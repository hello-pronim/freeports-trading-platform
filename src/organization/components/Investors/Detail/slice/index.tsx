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
import FundRequest from "../../../../../types/FundRequest";
import RefundRequest from "../../../../../types/RefundRequest";
import MoveRequest from "../../../../../types/MoveRequest";
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
  vaultAddressbookId: "",
};

export const initialState: InvestorDetailState = {
  selectedInvestor: defaultInvestor,
  loadingDetail: false,

  tradeRequests: [],
  loadingTradeRequests: false,
  creatingTradeRequest: false,

  fundRequests: [],
  loadingFundRequests: false,
  creatingFundRequest: false,
  refundRequests: [],
  loadingRefundRequests: false,
  creatingRefundRequest: false,
  moveRequests: [],
  loadingMoveRequests: false,
  creatingMoveRequest: false,

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
    getInvestorFundRequests(
      state,
      action: PayloadAction<{
        organizationId: string;
        deskId: string;
        investorId: string;
      }>
    ) {
      state.loadingFundRequests = true;
    },
    getInvestorFundRequestsSuccess(
      state,
      action: PayloadAction<FundRequest[]>
    ) {
      state.loadingFundRequests = false;
      state.fundRequests = action.payload;
    },
    getInvestorFundRequestsFailed(state) {
      state.loadingFundRequests = false;
    },
    addInvestorFundRequest(
      state,
      action: PayloadAction<{
        organizationId: string;
        deskId: string;
        investorId: string;
        request: FundRequest;
      }>
    ) {
      state.creatingFundRequest = true;
    },
    addInvestorFundRequestSuccess(state) {
      state.creatingFundRequest = false;
    },
    addInvestorFundRequestFailed(state) {
      state.creatingFundRequest = false;
    },
    getInvestorRefundRequests(
      state,
      action: PayloadAction<{
        organizationId: string;
        deskId: string;
        investorId: string;
      }>
    ) {
      state.loadingRefundRequests = true;
    },
    getInvestorRefundRequestsSuccess(
      state,
      action: PayloadAction<RefundRequest[]>
    ) {
      state.loadingRefundRequests = false;
      state.refundRequests = action.payload;
    },
    getInvestorRefundRequestsFailed(state) {
      state.loadingRefundRequests = false;
    },
    addInvestorRefundRequest(
      state,
      action: PayloadAction<{
        organizationId: string;
        deskId: string;
        investorId: string;
        request: RefundRequest;
      }>
    ) {
      state.creatingRefundRequest = true;
    },
    addInvestorRefundRequestSuccess(state) {
      state.creatingRefundRequest = false;
    },
    addInvestorRefundRequestFailed(state) {
      state.creatingRefundRequest = false;
    },
    getInvestorMoveRequests(
      state,
      action: PayloadAction<{
        organizationId: string;
        deskId: string;
        investorId: string;
      }>
    ) {
      state.loadingMoveRequests = true;
    },
    getInvestorMoveRequestsSuccess(
      state,
      action: PayloadAction<MoveRequest[]>
    ) {
      state.loadingMoveRequests = false;
      state.moveRequests = action.payload;
    },
    getInvestorMoveRequestsFailed(state) {
      state.loadingMoveRequests = false;
    },
    addInvestorMoveRequest(
      state,
      action: PayloadAction<{
        organizationId: string;
        deskId: string;
        investorId: string;
        request: MoveRequest;
      }>
    ) {
      state.creatingMoveRequest = true;
    },
    addInvestorMoveRequestSuccess(state) {
      state.creatingMoveRequest = false;
    },
    addInvestorMoveRequestFailed(state) {
      state.creatingMoveRequest = false;
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
    getInvestorAccountSuccess(state, action: PayloadAction<Account>) {
      state.loadingInvestorAccountDetail = false;
      state.selectedInvestorAccount = action.payload;
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
