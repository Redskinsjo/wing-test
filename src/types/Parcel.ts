import { OrderItem } from "./OrderItem";

export type Parcel = {
  order_id: string;
  items: Array<OrderItem>;
  weight: number;
  tracking_id: string;
  palette_number: number;
};
