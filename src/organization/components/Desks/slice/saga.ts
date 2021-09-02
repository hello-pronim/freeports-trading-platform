import { takeEvery, takeLatest, call, put, take } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import Desk from "../../../../types/Desk";
import PaginatedResponse from "../../../../types/PaginatedResponse";

import { desksActions as actions } from ".";

import {
  getAllDesks,
  getMyDesks,
  createDesk,
  deleteDesk,
} from "../../../../services/deskService";
import { snackbarActions } from "../../../../components/Snackbar/slice";

export function* getDesks(): Generator<any> {
  try {
    const response = yield call(getMyDesks);
    if (response)
      yield put(
        actions.getDesksSuccess((response as PaginatedResponse<Desk>).content)
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

export function* addDesk({
  payload,
}: PayloadAction<{ organizationId: string; desk: Desk }>): Generator<any> {
  try {
    const response = yield call(
      createDesk,
      payload.organizationId,
      payload.desk
    );
    if (response) {
      yield put(actions.addDeskSuccess(response as string));
      yield put(
        snackbarActions.showSnackbar({
          message: "Desk has been created successfully",
          type: "success",
        })
      );
      yield put(actions.getDesks());
      yield take(actions.getDesksSuccess);
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

export function* removeDesk({
  payload,
}: PayloadAction<{ organizationId: string; deskId: string }>): Generator<any> {
  try {
    const response = yield call(
      deleteDesk,
      payload.organizationId,
      payload.deskId
    );
    if (response) {
      yield put(actions.removeDeskSuccess(response as string));
      yield put(
        snackbarActions.showSnackbar({
          message: "Desk has been deleted successfully",
          type: "success",
        })
      );
      yield put(actions.getDesks());
      yield take(actions.getDesksSuccess);
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

export function* desksSaga(): Generator<any> {
  yield takeLatest(actions.getDesks, getDesks);
  yield takeEvery(actions.addDesk, addDesk);
  yield takeEvery(actions.removeDesk, removeDesk);
}
