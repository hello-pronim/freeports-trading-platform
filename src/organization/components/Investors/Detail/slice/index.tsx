/* eslint-disable no-param-reassign */
import { PayloadAction } from "@reduxjs/toolkit";

import { createSlice } from "../../../../../util/@reduxjs/toolkit";
import {
  useInjectReducer,
  useInjectSaga,
} from "../../../../../util/redux-injectors";
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

export const initialState: InvestorDetailState = {
  selectedInvestor: defaultInvestor,
  tradeRequests: [],
  loadingDetail: false,
  loadingTradeRequests: false,
  creatingTradeRequest: false,
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
  },
});

export const { actions: investorDetailActions, reducer } = slice;

export const useInvestorDetailSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer });
  useInjectSaga({ key: slice.name, saga: investorDetailSaga });
  (window as any).action = slice.actions;
  return { actions: slice.actions };
};
