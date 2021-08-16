/* eslint-disable no-param-reassign */
import { PayloadAction } from "@reduxjs/toolkit";

import { createSlice } from "../../../../../util/@reduxjs/toolkit";
import {
  useInjectReducer,
  useInjectSaga,
} from "../../../../../util/redux-injectors";
import Account from "../../../../../types/Account";
import Operation from "../../../../../types/Operation";
import { accountDetailSaga } from "./saga";
import { AccountDetailState } from "./types";

const defaultAccount = {
  id: "",
  name: "",
  currency: "CHF",
  type: "fiat",
  balance: 0,
  iban: "",
  publicAddress: "",
  vaultWalletId: "",
};

export const initialState: AccountDetailState = {
  selectedAccount: defaultAccount,
  operations: [],
  loading: false,
  creatingOperation: false,
  gettingOperations: false,
  deletingOperation: false,
  moveRequests: [],
};

const slice = createSlice({
  name: "accountDetail",
  initialState,
  reducers: {
    getAccount(state, action: PayloadAction<string>) {
      state.loading = true;
      state.selectedAccount = defaultAccount;
    },
    getAccountSuccess(state, action: PayloadAction<Account>) {
      state.loading = false;
      state.selectedAccount = action.payload;
    },
    getOperations(state, action: PayloadAction<string>) {
      state.gettingOperations = true;
      state.operations = [];
    },
    getOperationsSuccess(state, action: PayloadAction<Operation[]>) {
      state.gettingOperations = false;
      state.operations = action.payload;
    },
    addOperation(
      state,
      action: PayloadAction<{ accountId: string; operation: Array<Operation> }>
    ) {
      state.creatingOperation = true;
    },
    addOperationSuccess(state, action: PayloadAction<string>) {
      state.creatingOperation = false;
    },
    removeOperation(
      state,
      action: PayloadAction<{ accountId: string; operationId: string }>
    ) {
      state.deletingOperation = true;
    },
    removeOperationSuccess(state, action: PayloadAction<string>) {
      state.deletingOperation = false;
    },
    getMoveRequests(state, action: PayloadAction<string>) {
      state.moveRequests = [];
    },
    getMoveRequestsSuccess(state, action: PayloadAction<Operation[]>) {
      state.moveRequests = action.payload;
    },
  },
});

export const { actions: accountDetailActions, reducer } = slice;

export const useAccountDetailSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer });
  useInjectSaga({ key: slice.name, saga: accountDetailSaga });
  (window as any).action = slice.actions;
  return { actions: slice.actions };
};
