import { Side } from "./RfqResponse";

export interface TradeOrderResponse {
  id: string;
  brokerId: string;
  createdAt: Date;
  validUntil: Date;
  quantity: string;
  side: Side;
  price: string;
  executedPrice: string;
}
