import { promises as fs } from "fs";

import { OrderItem, Item, Order, Parcel } from "./types";

const parseFile = async (path: string) => {
  const fileData = await fs.readFile(path, "utf-8");
  return JSON.parse(fileData);
};

export const createParcels = async (): Promise<
  Array<Omit<Parcel, "tracking_id">>
> => {
  // with node, json files can be parsed to use data
  const { items } = (await parseFile("./src/data/items.json")) as {
    items: Item[];
  };
  const { orders } = (await parseFile("./src/data/orders.json")) as {
    orders: Order[];
  };

  let parcels: Array<Omit<Parcel, "tracking_id">> = [];
  let sides: Array<OrderItem> = [];

  // items are set to accepted until the 30kg are reached
  for (let i = 0; i < orders.length; i++) {
    const orderItems = orders[i].items.reduce(
      (
        acc: {
          weight: 0;
          accepted: OrderItem[];
          rejected: OrderItem[];
        },
        curr: OrderItem
      ) => {
        const item = items.find((item) => item.id === curr.item_id);

        if (item) {
          const weight = Number(item.weight) * curr.quantity;

          if (acc.weight + weight <= 30) {
            acc.weight += weight;
            acc.accepted.push(curr);
            console.log("An item was added to a parcel : ", curr.item_id);
          } else {
            acc.rejected.push(curr);
          }
        } else {
          console.error(
            "An order item was not found into the stock :",
            curr.item_id
          );
        }
        return acc;
      },
      { weight: 0, accepted: [], rejected: [] }
    );

    const newParcel: Omit<Parcel, "tracking_id"> = {
      order_id: orders[i].id,
      items: orderItems.accepted,
      weight: orderItems.weight,
      palette_number: Math.ceil(parcels.length / 14),
    };

    parcels.push(newParcel);
    sides.concat(orderItems.rejected);
  }

  // the rejected items are then added one by one to the parcel that are not full
  sides.forEach((orderItem, index) => {
    const item = items.find((item) => item.id === orderItem.item_id);
    if (item) {
      const weight = Number(item.weight) * orderItem.quantity;
      const parcel = parcels.find((parcel) => parcel.weight + weight <= 30);
      if (parcel) {
        parcel.items.push(orderItem);
        console.log("An item was added to a parcel : ", orderItem.item_id);
        sides.splice(index, 1);
      } else {
        console.error(
          "A parcel was not found for this orderItem",
          orderItem.item_id
        );
      }
    } else {
      console.error(
        "An order item was not found into the stock :",
        orderItem.item_id
      );
    }
  });
  return parcels;
};
