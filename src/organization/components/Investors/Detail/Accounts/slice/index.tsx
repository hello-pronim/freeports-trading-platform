/* eslint-disable no-param-reassign */
import { PayloadAction } from "@reduxjs/toolkit";

import { createSlice } from "../../../../../../util/@reduxjs/toolkit";
import {
  useInjectReducer,
  useInjectSaga,
} from "../../../../../../util/redux-injectors";
import InvestorAccountOperation from "../../../../../../types/InvestorAccountOperation";
import InvestorAccountBalance from "../../../../../../types/InvestorAccountBalance";
import { investorAccountDetailSaga } from "./saga";
import { InvestorAccountDetailState } from "./types";
import PaginatedResponse from "../../../../../../types/PaginatedResponse";

const defaultInvestorAccountOperation = {
  address: "",
  totalReceived: 0,
  totalSent: 0,
  balance: 0,
  unconfirmedBalance: 0,
  finalBalance: 0,
  nTx: 0,
  unconfirmedNTx: 0,
  finalNTx: 0,
  txrefs: [],
};
const defaultInvestorAccountBalance = {
  address: "",
  totalReceived: 0,
  totalSent: 0,
  balance: 0,
  unconfirmedBalance: 0,
  finalBalance: 0,
  nTx: 0,
  unconfirmedNTx: 0,
  finalNTx: 0,
};

export const initialState: InvestorAccountDetailState = {
  accountOperations: defaultInvestorAccountOperation,
  loadingAccountOperations: false,
  accountBalance: defaultInvestorAccountBalance,
  loadingAccountBalance: false,
};

const slice = createSlice({
  name: "investorAccountDetail",
  initialState,
  reducers: {
    getInvestorAccountBalance(
      state,
      action: PayloadAction<{
        organizationId: string;
        deskId: string;
        investorId: string;
        accountId: string;
      }>
    ) {
      state.loadingAccountBalance = true;
    },
    getInvestorAccountBalanceSuccess(
      state,
      action: PayloadAction<InvestorAccountBalance>
    ) {
      state.loadingAccountBalance = false;
      state.accountBalance = action.payload;
    },
    getInvestorAccountBalanceFailed(state) {
      state.loadingAccountBalance = false;
    },
    getInvestorAccountOperations(
      state,
      action: PayloadAction<{
        organizationId: string;
        deskId: string;
        investorId: string;
        accountId: string;
      }>
    ) {
      state.loadingAccountOperations = true;
    },
    getInvestorAccountOperationsSuccess(
      state,
      action: PayloadAction<InvestorAccountOperation>
    ) {
      state.loadingAccountOperations = false;
      state.accountOperations = action.payload;
    },
    getInvestorAccountOperationsFailed(state) {
      state.loadingAccountOperations = false;
    },
  },
});

export const { actions: investorDetailActions, reducer } = slice;

export const useInvestorAccountDetailSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer });
  useInjectSaga({ key: slice.name, saga: investorAccountDetailSaga });
  (window as any).action = slice.actions;
  return { actions: slice.actions };
};
