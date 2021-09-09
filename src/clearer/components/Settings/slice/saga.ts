import { takeEvery, takeLatest, call, put, take } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import Clearer from "../../../../types/Clearer";
import PaginatedResponse from "../../../../types/PaginatedResponse";

import { clearerSettingsActions as actions } from ".";

import {
  getClearerSettings,
  updateClearerSettings,
} from "../../../../services/clearerUsersService";
import { snackbarActions } from "../../../../components/Snackbar/slice";

export function* retrieveClearerSettings(): Generator<any> {
  try {
    const response = yield call(getClearerSettings);
    if (response)
      yield put(actions.retrieveClearerSettingsSuccess(response as Clearer));
    else yield put(actions.retrieveClearerSettingsFailed());
  } catch (error) {
    yield put(actions.retrieveClearerSettingsFailed());
    yield put(
      snackbarActions.showSnackbar({
        message: error.message,
        type: "error",
      })
    );
  }
}

export function* saveClearerSettings({
  payload,
}: PayloadAction<Clearer>): Generator<any> {
  try {
    const response = yield call(updateClearerSettings, payload);
    if (response) {
      yield put(actions.saveClearerSettingsSuccess());
      yield put(
        snackbarActions.showSnackbar({
          message: "Settings has been updated successfully",
          type: "success",
        })
      );
    }
  } catch (error) {
    yield put(actions.saveClearerSettingsFailed());
    yield put(
      snackbarActions.showSnackbar({
        message: error.message,
        type: "error",
      })
    );
  }
}

export function* clearerSettingsSaga(): Generator<any> {
  yield takeLatest(actions.retrieveClearerSettings, retrieveClearerSettings);
  yield takeEvery(actions.saveClearerSettings, saveClearerSettings);
}
