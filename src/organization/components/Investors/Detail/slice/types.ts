import Account from "../../../../../types/Account";
import Investor from "../../../../../types/Investor";
import TradeRequest from "../../../../../types/TradeRequest";
import FundRequest from "../../../../../types/FundRequest";
import RefundRequest from "../../../../../types/RefundRequest";
import MoveRequest from "../../../../../types/MoveRequest";

export interface InvestorDetailState {
  selectedInvestor: Investor;
  loadingDetail: boolean;

  tradeRequests: TradeRequest[];
  loadingTradeRequests: boolean;
  creatingTradeRequest: boolean;

  fundRequests: FundRequest[];
  loadingFundRequests: boolean;
  creatingFundRequest: boolean;
  refundRequests: RefundRequest[];
  loadingRefundRequests: boolean;
  creatingRefundRequest: boolean;
  moveRequests: MoveRequest[];
  loadingMoveRequests: boolean;
  creatingMoveRequest: boolean;

  investorAccounts: Account[];
  loadingInvestorAccounts: boolean;
  creatingInvestorAccount: boolean;
  deletingInvestorAccount: boolean;

  selectedInvestorAccount: Account;
  loadingInvestorAccountDetail: boolean;
}
