/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-param-reassign */
import { PayloadAction } from "@reduxjs/toolkit";

import { createSlice } from "../../../../../util/@reduxjs/toolkit";
import {
  useInjectReducer,
  useInjectSaga,
} from "../../../../../util/redux-injectors";
import TradeRequest from "../../../../../types/TradeRequest";
import { tradeDetailSaga } from "./saga";
import { TradeDetailState } from "./types";
import { RfqResponse } from "../../../../../types/RfqResponse";
import { TradeOrderResponse } from "../../../../../types/TradeOrderResponse";

const defaultTradeRequest = {
  id: "",
  accountFrom: "",
  accountTo: "",
  status: "",
  currencyFrom: "",
  currencyTo: "",
  type: "",
  quantity: "",
  limitPrice: "",
  limitTime: "",
  createdAt: "",
};

export const initialState: TradeDetailState = {
  selectedTradeRequest: defaultTradeRequest,
  loadingDetail: false,
  rfqs: [],
  loadingRfqs: false,
  orderLoading: false,
  tradeAmount: "",
};
export const MAX_TRADE_AMOUNT = 10;
const slice = createSlice({
  name: "tradeDetail",
  initialState,
  reducers: {
    getTradeRequestDetail(
      state,
      action: PayloadAction<{
        organizationId: string;
        deskId: string;
        investorId: string;
        tradeId: string;
      }>
    ) {
      state.loadingDetail = true;
      state.selectedTradeRequest = defaultTradeRequest;
    },
    getTradeRequestDetailSuccess(state, action: PayloadAction<TradeRequest>) {
      state.loadingDetail = false;
      state.selectedTradeRequest = action.payload;
    },
    getRfqs(
      state,
      action: PayloadAction<{
        organizationId: string;
        deskId: string;
        investorId: string;
        tradeId: string;
      }>
    ) {
      state.rfqs = [];
    },
    setRfqsLoading(state) {
      state.loadingRfqs = true;
    },
    getRfqsSuccess(state, action: PayloadAction<RfqResponse[]>) {
      state.rfqs = action.payload;
      state.loadingRfqs = false;
    },
    getRfqsFail(state, action?: PayloadAction<any>) {
      state.loadingRfqs = false;
      state.tradeAmount = "";
    },
    order(
      state,
      action: PayloadAction<{
        organizationId: string;
        deskId: string;
        investorId: string;
        tradeId: string;
        rfqId: string;
        quantity: string;
      }>
    ) {
      state.orderLoading = true;
    },
    orderSuccess(state, action: PayloadAction<TradeOrderResponse>) {
      const selectedTradeRequest = { ...state.selectedTradeRequest };
      if (selectedTradeRequest.orders) {
        selectedTradeRequest.orders.push(action.payload);
      } else {
        selectedTradeRequest.orders = [action.payload];
      }
      state.selectedTradeRequest = selectedTradeRequest;
      state.orderLoading = false;
    },
    orderFail(state, action: PayloadAction<any>) {
      state.orderLoading = false;
    },
    setTradeAmount(state, action: PayloadAction<any>) {
      state.tradeAmount = action.payload;
    },
  },
});

export const { actions: tradeDetailActions, reducer } = slice;

export const useTradeDetailSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer });
  useInjectSaga({ key: slice.name, saga: tradeDetailSaga });
  (window as any).action = slice.actions;
  return { actions: slice.actions };
};
