import { RfqResponse } from "../../../../../types/RfqResponse";
import TradeRequest from "../../../../../types/TradeRequest";

export interface PriceEvent {
  broker: string;
  originalEvent?: any;
  instrument?: string;
  currency?: string[];
  buy: string;
  sell: string;
  quantity: number;
}
export interface TradeDetailState {
  selectedTradeRequest: TradeRequest;
  loadingDetail: boolean;
  rfqs: RfqResponse[];
  loadingRfqs: boolean;
  orderLoading: boolean;
  tradeAmount: "";
  priceEvents: PriceEvent[];
}
