import { takeEvery, call, put, take } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import Investor from "../../../../../types/Investor";
import TradeRequest from "../../../../../types/TradeRequest";

import { investorDetailActions as actions } from ".";

import { getInvestor } from "../../../../../services/investorService";
import {
  getInvestorTradeRequests,
  createTradeRequest,
} from "../../../../../services/tradeService";
import { snackbarActions } from "../../../../../components/Snackbar/slice";
import PaginatedResponse from "../../../../../types/PaginatedResponse";

export function* retrieveInvestor({
  payload,
}: PayloadAction<{
  organizationId: string;
  deskId: string;
  investorId: string;
}>): Generator<any> {
  try {
    const response = yield call(
      getInvestor,
      payload.organizationId,
      payload.deskId,
      payload.investorId
    );
    if (response) yield put(actions.getInvestorSuccess(response as Investor));
  } catch (error) {
    yield put(
      snackbarActions.showSnackbar({
        message: error.data.message,
        type: "error",
      })
    );
  }
}

export function* retrieveInvestorTradeRequests({
  payload,
}: PayloadAction<{
  organizationId: string;
  deskId: string;
  investorId: string;
}>): Generator<any> {
  try {
    const response = yield call(
      getInvestorTradeRequests,
      payload.organizationId,
      payload.deskId,
      payload.investorId
    );
    if (response)
      yield put(
        actions.getInvestorTradeRequestsSuccess(
          (response as PaginatedResponse<TradeRequest>).content
        )
      );
  } catch (error) {
    yield put(
      snackbarActions.showSnackbar({
        message: error.data.message,
        type: "error",
      })
    );
  }
}

export function* addTradeRequest({
  payload,
}: PayloadAction<{
  organizationId: string;
  deskId: string;
  investorId: string;
  trade: TradeRequest;
}>): Generator<any> {
  try {
    const response = yield call(
      createTradeRequest,
      payload.organizationId,
      payload.deskId,
      payload.investorId,
      payload.trade
    );
    if (response) {
      yield put(actions.addTradeRequestSuccess(response as string));
      yield put(
        snackbarActions.showSnackbar({
          message: "Trade has been created successfully",
          type: "success",
        })
      );
      yield put(
        actions.getInvestorTradeRequests({
          organizationId: payload.organizationId,
          deskId: payload.deskId,
          investorId: payload.investorId,
        })
      );
      yield take(actions.getInvestorTradeRequestsSuccess);
    }
  } catch (error) {
    yield put(
      snackbarActions.showSnackbar({
        message: error.data.message,
        type: "error",
      })
    );
  }
}
export function* investorDetailSaga(): Generator<any> {
  yield takeEvery(actions.getInvestor, retrieveInvestor);
  yield takeEvery(
    actions.getInvestorTradeRequests,
    retrieveInvestorTradeRequests
  );
  yield takeEvery(actions.addTradeRequest, addTradeRequest);
}
