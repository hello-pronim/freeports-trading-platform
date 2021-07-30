import Investor from "../../../../../types/Investor";
import TradeRequest from "../../../../../types/TradeRequest";

export interface InvestorDetailState {
  selectedInvestor: Investor;
  tradeRequests: TradeRequest[];
  loadingDetail: boolean;
  loadingTradeRequests: boolean;
  creatingTradeRequest: boolean;
}
