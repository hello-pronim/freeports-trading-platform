import { TradeOrderResponse } from "./TradeOrderResponse";

export default interface TradeRequest {
  id?: string;

  accountFrom: string;

  accountTo: string;

  status?: string;

  currencyFrom?: string;

  currencyTo?: string;

  type: string;

  quantity: string;

  limitPrice: string;

  limitTime: string;

  createdAt?: string;

  orders?: TradeOrderResponse[];
}
