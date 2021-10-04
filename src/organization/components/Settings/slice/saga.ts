import { takeEvery, call, put, take } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import { TradeLevel } from "../../../../types/Organization";

import { orgSettingsActions as actions } from ".";

import {
  updateTradeLevels,
} from "../../../../services/organizationService";
import { snackbarActions } from "../../../../components/Snackbar/slice";

export function* saveTradeLevels({
  payload,
}: PayloadAction<{
  organizationId: string;
  tradeLevels: TradeLevel[];
}>): Generator<any> {
  try {
    const response = yield call(
      updateTradeLevels,
      payload.organizationId,
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

export function* orgSettingsSaga(): Generator<any> {
  yield takeEvery(actions.saveTradeLevels, saveTradeLevels);
}
