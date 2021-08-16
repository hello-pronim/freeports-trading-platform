import { takeEvery, call, put, take } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import Account from "../../../../../types/Account";
import Operation from "../../../../../types/Operation";
import PaginatedResponse from "../../../../../types/PaginatedResponse";

import { accountDetailActions as actions } from ".";

import {
  getAccount,
  createOperation,
  getAllOperations,
  deleteOperation,
  getAllMoveRequests,
} from "../../../../../services/accountService";
import { snackbarActions } from "../../../../../components/Snackbar/slice";

export function* retrieveAccount({
  payload,
}: PayloadAction<string>): Generator<any> {
  try {
    const response = yield call(getAccount, payload);
    if (response) yield put(actions.getAccountSuccess(response as Account));
  } catch (error) {
    yield put(
      snackbarActions.showSnackbar({
        message: error.data.message,
        type: "error",
      })
    );
  }
}

export function* getOperations({
  payload,
}: PayloadAction<string>): Generator<any> {
  try {
    const response = yield call(getAllOperations, payload);
    if (response)
      yield put(
        actions.getOperationsSuccess(
          (response as PaginatedResponse<Operation>).content
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

export function* addOperation({
  payload,
}: PayloadAction<{ accountId: string; operation: Array<Operation> }>): Generator<any> {
  try {
    const response = yield call(
      createOperation,
      payload.accountId,
      payload.operation
    );
    if (response) {
      yield put(actions.addOperationSuccess(response as string));
      yield put(
        snackbarActions.showSnackbar({
          message: "Account operation has been created successfully",
          type: "success",
        })
      );
      const operationsResponse = yield call(
        getAllOperations,
        payload.accountId
      );
      yield put(
        actions.getOperationsSuccess(
          (operationsResponse as PaginatedResponse<Operation>).content
        )
      );
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

export function* removeOperation({
  payload,
}: PayloadAction<{ accountId: string; operationId: string }>): Generator<any> {
  try {
    const response = yield call(
      deleteOperation,
      payload.accountId,
      payload.operationId
    );
    if (response) {
      yield put(actions.removeOperationSuccess(response as string));
      yield put(
        snackbarActions.showSnackbar({
          message: "Account operation has been deleted successfully",
          type: "success",
        })
      );
      const operationsResponse = yield call(
        getAllOperations,
        payload.accountId
      );
      yield put(
        actions.getOperationsSuccess(
          (operationsResponse as PaginatedResponse<Operation>).content
        )
      );
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

export function* getMoveRequests({
  payload,
}: PayloadAction<string>): Generator<any> {
  try {
    const response = yield call(getAllMoveRequests, payload);
    if (response)
      yield put(
        actions.getMoveRequestsSuccess(
          (response as PaginatedResponse<any>).content
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

export function* accountDetailSaga(): Generator<any> {
  yield takeEvery(actions.getAccount, retrieveAccount);
  yield takeEvery(actions.getOperations, getOperations);
  yield takeEvery(actions.addOperation, addOperation);
  yield takeEvery(actions.removeOperation, removeOperation);
  yield takeEvery(actions.getMoveRequests, getMoveRequests);
}
