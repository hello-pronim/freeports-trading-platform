import InvestorAccountOperation from "../../../../../../types/InvestorAccountOperation";

export interface InvestorAccountDetailState {
  accountOperations: InvestorAccountOperation;
  loadingAccountOperations: boolean;
}
