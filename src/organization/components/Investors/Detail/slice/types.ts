import Investor from "../../../../../types/Investor";
import PaginatedResponse from "../../../../../types/PaginatedResponse";
import TradeRequest from "../../../../../types/TradeRequest";

export interface InvestorDetailState {
  selectedInvestor: Investor;
  tradeRequests: PaginatedResponse<TradeRequest[]> | null;
  loadingDetail: boolean;
  loadingTradeRequests: boolean;
  creatingTradeRequest: boolean;
}
