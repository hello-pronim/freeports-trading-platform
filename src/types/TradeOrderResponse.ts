import { Side } from "./RfqResponse";

// eslint-disable-next-line no-shadow
export enum TradeOrderStatus {
  requesting = "requesting",
  success = "success",
  failed = "failed",
}

export interface TradeOrderResponse {
  id: string;
  brokerId: string;
  createdAt: Date;
  validUntil: Date;
  quantity: string;
  side: Side;
  price: string;
  executedPrice: string;
  status: TradeOrderStatus;
}
