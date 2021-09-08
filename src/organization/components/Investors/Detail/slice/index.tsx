/* eslint-disable no-param-reassign */
import { PayloadAction } from "@reduxjs/toolkit";

import { createSlice } from "../../../../../util/@reduxjs/toolkit";
import {
  useInjectReducer,
  useInjectSaga,
} from "../../../../../util/redux-injectors";
import Account from "../../../../../types/Account";
import Investor from "../../../../../types/Investor";
import TradeRequest from "../../../../../types/TradeRequest";
import { investorDetailSaga } from "./saga";
import { InvestorDetailState } from "./types";
import PaginatedResponse from "../../../../../types/PaginatedResponse";

const defaultInvestor = {
  id: "",
  name: "",
  accounts: [],
  createdAt: "",
};

const defaultInvestorAccount = {
  id: "",
  name: "",
  currency: "",
  type: "crypto",
  publicAddress: "",
  vaultWalletId: "",
  hdPath: "",
  balance: 0,
  balanceUpdatedAt: "",
};

export const initialState: InvestorDetailState = {
  selectedInvestor: defaultInvestor,
  loadingDetail: false,

  tradeRequests: [],
  loadingTradeRequests: false,
  creatingTradeRequest: false,

  investorAccounts: [],
  loadingInvestorAccounts: false,
  creatingInvestorAccount: false,
  deletingInvestorAccount: false,

  selectedInvestorAccount: defaultInvestorAccount,
  loadingInvestorAccountDetail: false,
};

const slice = createSlice({
  name: "investorDetail",
  initialState,
  reducers: {
    getInvestor(
      state,
      action: PayloadAction<{
        organizationId: string;
        deskId: string;
        investorId: string;
      }>
    ) {
      state.loadingDetail = true;
      state.selectedInvestor = defaultInvestor;
    },
    getInvestorSuccess(state, action: PayloadAction<Investor>) {
      state.loadingDetail = false;
      state.selectedInvestor = action.payload;
    },
    getInvestorFailed(state) {
      state.loadingDetail = false;
    },
    getInvestorTradeRequests(
      state,
      action: PayloadAction<{
        organizationId: string;
        deskId: string;
        investorId: string;
      }>
    ) {
      state.loadingTradeRequests = true;
      state.tradeRequests = [];
    },
    getInvestorTradeRequestsSuccess(
      state,
      action: PayloadAction<TradeRequest[]>
    ) {
      state.loadingTradeRequests = false;
      state.tradeRequests = action.payload;
    },
    getInvestorTradeRequestsFailed(state) {
      state.loadingTradeRequests = false;
    },
    addTradeRequest(
      state,
      action: PayloadAction<{
        organizationId: string;
        deskId: string;
        investorId: string;
        trade: TradeRequest;
      }>
    ) {
      state.creatingTradeRequest = true;
    },
    addTradeRequestSuccess(state, action: PayloadAction<string>) {
      state.creatingTradeRequest = false;
    },
    addTradeRequestFailed(state) {
      state.creatingTradeRequest = false;
    },
    getInvestorAccounts(
      state,
      action: PayloadAction<{
        organizationId: string;
        deskId: string;
        investorId: string;
      }>
    ) {
      state.loadingInvestorAccounts = true;
      state.investorAccounts = [];
    },
    getInvestorAccountsSuccess(state, action: PayloadAction<Account[]>) {
      state.loadingInvestorAccounts = false;
      state.investorAccounts = action.payload;
    },
    getInvestorAccountsFailed(state) {
      state.loadingInvestorAccounts = false;
    },
    addInvestorAccount(
      state,
      action: PayloadAction<{
        organizationId: string;
        deskId: string;
        investorId: string;
        account: Account;
      }>
    ) {
      state.creatingInvestorAccount = true;
    },
    addInvestorAccountSuccess(state, action: PayloadAction<string>) {
      state.creatingInvestorAccount = false;
    },
    addInvestorAccountFailed(state) {
      state.creatingInvestorAccount = false;
    },
    removeInvestorAccount(
      state,
      action: PayloadAction<{
        organizationId: string;
        deskId: string;
        investorId: string;
        accountId: string;
      }>
    ) {
      state.deletingInvestorAccount = true;
    },
    removeInvestorAccountSuccess(state) {
      state.deletingInvestorAccount = false;
    },
    removeInvestorAccountFailed(state) {
      state.deletingInvestorAccount = false;
    },
    getInvestorAccount(
      state,
      action: PayloadAction<{
        organizationId: string;
        deskId: string;
        investorId: string;
        accountId: string;
      }>
    ) {
      state.loadingInvestorAccountDetail = true;
    },
    getInvestorAccountSuccess(state, action: PayloadAction<string>) {
      state.loadingInvestorAccountDetail = false;
    },
    getInvestorAccountFailed(state) {
      state.loadingInvestorAccountDetail = false;
    },
  },
});

export const { actions: investorDetailActions, reducer } = slice;

export const useInvestorDetailSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer });
  useInjectSaga({ key: slice.name, saga: investorDetailSaga });
  (window as any).action = slice.actions;
  return { actions: slice.actions };
};
