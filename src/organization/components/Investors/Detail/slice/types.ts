import Account from "../../../../../types/Account";
import Investor from "../../../../../types/Investor";
import TradeRequest from "../../../../../types/TradeRequest";

export interface InvestorDetailState {
  selectedInvestor: Investor;
  loadingDetail: boolean;

  tradeRequests: TradeRequest[];
  loadingTradeRequests: boolean;
  creatingTradeRequest: boolean;

  investorAccounts: Account[];
  loadingInvestorAccounts: boolean;
  creatingInvestorAccount: boolean;
  deletingInvestorAccount: boolean;

  selectedInvestorAccount: Account;
  loadingInvestorAccountDetail: boolean;
}
