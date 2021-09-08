import { takeEvery, takeLatest, call, put, take } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import Investor from "../../../../types/Investor";
import PaginatedResponse from "../../../../types/PaginatedResponse";

import { investorsActions as actions } from ".";

import {
  getAllInvestors,
  createInvestor,
  deleteInvestor,
} from "../../../../services/investorService";
import { snackbarActions } from "../../../../components/Snackbar/slice";

export function* getInvestors({ payload }: PayloadAction): Generator<any> {
  try {
    const response = yield call(getAllInvestors);
    if (response)
      yield put(
        actions.getInvestorsSuccess(
          (response as PaginatedResponse<Investor>).content
        )
      );
  } catch (error) {
    yield put(actions.getInvestorsFailed());
    yield put(
      snackbarActions.showSnackbar({
        message: error.data.message,
        type: "error",
      })
    );
  }
}

export function* addInvestor({
  payload,
}: PayloadAction<{
  organizationId: string;
  deskId: string;
  investor: Investor;
}>): Generator<any> {
  try {
    const response = yield call(
      createInvestor,
      payload.organizationId,
      payload.deskId,
      payload.investor
    );
    if (response) {
      yield put(actions.addInvestorSuccess(response as string));
      yield put(
        snackbarActions.showSnackbar({
          message: "Investor has been created successfully",
          type: "success",
        })
      );
      yield put(actions.getInvestors());
      yield take(actions.getInvestorsSuccess);
    }
  } catch (error) {
    yield put(actions.addInvestorFailed());
    yield put(
      snackbarActions.showSnackbar({
        message: error.data.message,
        type: "error",
      })
    );
  }
}

export function* removeInvestor({
  payload,
}: PayloadAction<{
  organizationId: string;
  deskId: string;
  investorId: string;
}>): Generator<any> {
  try {
    const response = yield call(
      deleteInvestor,
      payload.organizationId,
      payload.deskId,
      payload.investorId
    );
    if (response) {
      yield put(actions.removeInvestorSuccess(response as string));
      yield put(
        snackbarActions.showSnackbar({
          message: "Investor has been deleted successfully",
          type: "success",
        })
      );
      yield put(actions.getInvestors);
      yield take(actions.getInvestorsSuccess);
    }
  } catch (error) {
    yield put(actions.removeInvestorFailed());
    yield put(
      snackbarActions.showSnackbar({
        message: error.data.message,
        type: "error",
      })
    );
  }
}

export function* investorsSaga(): Generator<any> {
  yield takeLatest(actions.getInvestors, getInvestors);
  yield takeEvery(actions.addInvestor, addInvestor);
  yield takeEvery(actions.removeInvestor, removeInvestor);
}
