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

  // Function creation of a new parcel
  // with inputs: orderID, weight, items
  const newParcel = ({
    items,
    weight,
    order,
  }: {
    items: Array<OrderItem>;
    weight: number;
    order: Order;
  }): Omit<Parcel, "tracking_id"> => ({
    order_id: order.id,
    items,
    weight,
    palette_number: Math.ceil(parcels.length / 14),
  });

  // High complexity O3, will work on that to reduce looping time
  // focus made on readability
  for (let h = 0; h < orders.length; h++) {
    const order = orders[h];

    for (let i = 0; i < order.items.length; i++) {
      const item = order.items[i];
      const weight = Number(items.find((it) => it.id === item.item_id)?.weight);

      for (let j = 0; j < item.quantity; j++) {
        const parcel = parcels.find(
          (p) => p.weight + weight <= 30 && p.order_id === order.id
        );
        // create a new parcel, if one for the same order and that has space doesn't exist
        // with increment of quantity, weight and add of order ID
        if (!parcel) {
          parcels.push(
            newParcel({ items: [{ ...item, quantity: 1 }], weight, order })
          );
        } else {
          // otherwise add item to the existing parcel
          const itemExists = parcel.items.find(
            (it) => it.item_id === item.item_id
          );
          if (itemExists) {
            itemExists.quantity++;
            console.log(
              "A new item was added to a parcel, order:",
              parcel.order_id
            );
          } else {
            parcel.items = [...parcel.items, item];
          }
          parcel.weight += weight;
        }
      }
    }
  }
  return parcels;
};
