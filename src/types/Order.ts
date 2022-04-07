import { OrderItem } from "./OrderItem";

export type Order = {
  id: string;
  items: Array<OrderItem>;
  order_date: string;
};
