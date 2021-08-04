import { takeEvery, call, put, debounce, takeLatest } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import TradeRequest from "../../../../../types/TradeRequest";

import { tradeDetailActions as actions } from ".";

import {
  getTradeRequest,
  tradeOrderRequest,
  tradeRfqRequest,
} from "../../../../../services/tradeService";
import { snackbarActions } from "../../../../../components/Snackbar/slice";
import { RfqResponse } from "../../../../../types/RfqResponse";
import { TradeOrderResponse } from "../../../../../types/TradeOrderResponse";

export function* retrieveTradeRequest({
  payload,
}: PayloadAction<{
  organizationId: string;
  deskId: string;
  investorId: string;
  tradeId: string;
}>): Generator<any> {
  try {
    const response = yield call(
      getTradeRequest,
      payload.organizationId,
      payload.deskId,
      payload.investorId,
      payload.tradeId
    );
    if (response)
      yield put(actions.getTradeRequestDetailSuccess(response as TradeRequest));
  } catch (error) {
    yield put(
      snackbarActions.showSnackbar({
        message: error.data.message,
        type: "error",
      })
    );
  }
}
export function* getRfqs({
  payload,
}: PayloadAction<{
  organizationId: string;
  deskId: string;
  investorId: string;
  tradeId: string;
  quantity: string;
}>): Generator<any> {
  try {
    console.log("get rfq from api", payload);

    const response = yield call(
      tradeRfqRequest,
      payload.organizationId,
      payload.deskId,
      payload.investorId,
      payload.tradeId,
      payload.quantity
    );
    yield put(actions.getRfqsSuccess(response as RfqResponse[]));
  } catch (error) {
    console.error(error);
    yield put(
      snackbarActions.showSnackbar({
        message: "Error Requesting RFQ",
        type: "error",
      })
    );
  }
}

export function* tradeOrder({
  payload,
}: PayloadAction<{
  organizationId: string;
  deskId: string;
  investorId: string;
  tradeId: string;

  rfqId: string;
}>): Generator<any> {
  try {
    const response = yield call(
      tradeOrderRequest,
      payload.organizationId,
      payload.deskId,
      payload.investorId,
      payload.tradeId,
      payload.rfqId
    );
    yield put(actions.orderSuccess(response as TradeOrderResponse));
  } catch (error) {
    console.error(error);
    yield put(
      snackbarActions.showSnackbar({
        message: "Error Requesting RFQ",
        type: "error",
      })
    );
  }
}

export function* tradeDetailSaga(): Generator<any> {
  yield takeEvery(actions.getTradeRequestDetail, retrieveTradeRequest);
  yield debounce(500, actions.getRfqs, getRfqs);
  yield takeLatest(actions.order, tradeOrder);
}
