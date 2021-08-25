import Account from "../../../../types/Account";

export interface AccountsState {
  accounts: Account[];
  selectedAccount: Account;
  loading: boolean;
  creating: boolean;
  deleting: boolean;
}
