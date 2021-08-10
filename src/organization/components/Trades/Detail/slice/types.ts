import { RfqResponse } from "../../../../../types/RfqResponse";
import TradeRequest from "../../../../../types/TradeRequest";

export interface TradeDetailState {
  selectedTradeRequest: TradeRequest;
  loadingDetail: boolean;
  rfqs: RfqResponse[];
  loadingRfqs: boolean;
  orderLoading: boolean;
  tradeAmount: "";
}
