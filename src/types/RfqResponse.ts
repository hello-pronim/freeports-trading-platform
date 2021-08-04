export enum Side {
  buy = "buy",
  sale = "sale",
}
export interface RfqResponse {
  id: string;
  brokerId: string;
  createdAt: Date;
  validUntil: Date;
  quantity: string;
  side: Side;
  price: string;
}
