/* eslint-disable no-param-reassign */
import { PayloadAction } from "@reduxjs/toolkit";

import { createSlice } from "../../../../util/@reduxjs/toolkit";
import {
  useInjectReducer,
  useInjectSaga,
} from "../../../../util/redux-injectors";
import Account from "../../../../types/Account";
import { accountsSaga } from "./saga";
import { AccountsState } from "./types";

const defaultAccount = {
  name: "",
  currency: "CHF",
  type: "fiat",
  balance: 0,
  iban: "",
  publicAddress: "",
  vaultWalletId: "",
};

export const initialState: AccountsState = {
  accounts: [],
  selectedAccount: defaultAccount,
  loading: false,
  creating: false,
  deleting: false,
};

const slice = createSlice({
  name: "accounts",
  initialState,
  reducers: {
    getAccounts(state) {
      state.loading = true;
      state.accounts = [];
    },
    getAccountsSuccess(state, action: PayloadAction<Account[]>) {
      state.loading = false;
      state.accounts = action.payload;
    },
    addAccount(state, action: PayloadAction<Account>) {
      state.creating = true;
    },
    addAccountSuccess(state, action: PayloadAction<string>) {
      state.creating = false;
    },
    removeAccount(state, action: PayloadAction<string>) {
      state.deleting = true;
    },
    removeAccountSuccess(state, action: PayloadAction<string>) {
      state.deleting = false;
    },
  },
});

export const { actions: accountsActions, reducer } = slice;

export const useAccountsSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer });
  useInjectSaga({ key: slice.name, saga: accountsSaga });
  (window as any).action = slice.actions;
  return { actions: slice.actions };
};
