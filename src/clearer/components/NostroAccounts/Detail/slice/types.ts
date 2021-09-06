import Account from "../../../../../types/Account";
import Operation from "../../../../../types/Operation";

export interface AccountDetailState {
  selectedAccount: Account;
  operations: Array<Operation>;
  loading: boolean;
  creatingOperation: boolean;
  gettingOperations: boolean;
  deletingOperation: boolean;
  moveRequests: Array<any>;
  gettingMoveRequests: boolean;
}
