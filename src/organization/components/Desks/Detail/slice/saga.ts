import { takeEvery, call, put, take } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import Desk, { TradeLevel } from "../../../../../types/Desk";

import { deskDetailActions as actions } from ".";

import {
  getDesk,
  updateTradeLevels,
} from "../../../../../services/deskService";
import { snackbarActions } from "../../../../../components/Snackbar/slice";

export function* retrieveDesk({
  payload,
}: PayloadAction<{ organizationId: string; deskId: string }>): Generator<any> {
  try {
    const response = yield call(
      getDesk,
      payload.organizationId,
      payload.deskId
    );
    if (response) yield put(actions.getDeskSuccess(response as Desk));
  } catch (error) {
    yield put(actions.getDeskFailed());
    yield put(
      snackbarActions.showSnackbar({
        message: error.data.message,
        type: "error",
      })
    );
  }
}

export function* saveTradeLevels({
  payload,
}: PayloadAction<{
  organizationId: string;
  deskId: string;
  tradeLevels: TradeLevel[];
}>): Generator<any> {
  try {
    const response = yield call(
      updateTradeLevels,
      payload.organizationId,
      payload.deskId,
      payload.tradeLevels
    );
    if (response) {
      yield put(
        snackbarActions.showSnackbar({
          message: "Trade levels have been updated successfully.",
          type: "success",
        })
      );
      yield put(actions.saveTradeLevelsSuccess());
      const desk = yield call(getDesk, payload.organizationId, payload.deskId);
      yield put(actions.getDeskSuccess(desk as Desk));
    }
  } catch (error) {
    yield put(actions.saveTradeLevelsFailed());
    yield put(
      snackbarActions.showSnackbar({
        message: error.data.message,
        type: "error",
      })
    );
  }
}

export function* deskDetailSaga(): Generator<any> {
  yield takeEvery(actions.getDesk, retrieveDesk);
  yield takeEvery(actions.saveTradeLevels, saveTradeLevels);
}
