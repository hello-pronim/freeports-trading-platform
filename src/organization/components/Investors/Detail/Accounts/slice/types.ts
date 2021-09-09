import InvestorAccountOperation from "../../../../../../types/InvestorAccountOperation";
import InvestorAccountBalance from "../../../../../../types/InvestorAccountBalance";

export interface InvestorAccountDetailState {
  accountOperations: InvestorAccountOperation;
  loadingAccountOperations: boolean;
  accountBalance: InvestorAccountBalance;
  loadingAccountBalance: boolean;
}
