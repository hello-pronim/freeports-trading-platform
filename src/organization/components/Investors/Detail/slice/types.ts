import Account from "../../../../../types/Account";
import Investor from "../../../../../types/Investor";
import TradeRequest from "../../../../../types/TradeRequest";

export interface InvestorDetailState {
  selectedInvestor: Investor;
  tradeRequests: TradeRequest[];
  investorAccounts: Account[];
  loadingDetail: boolean;
  loadingTradeRequests: boolean;
  creatingTradeRequest: boolean;
  loadingInvestorAccounts: boolean;
  creatingInvestorAccount: boolean;
}
