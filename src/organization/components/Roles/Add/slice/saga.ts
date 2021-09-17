import { takeEvery, call, put, take } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import Role from "../../../../../types/Role";
import Permission from "../../../../../types/Permission";
import PaginatedResponse from "../../../../../types/PaginatedResponse";

import { newOrgRoleActions as actions } from ".";

import {
  getAllOrgPermissions,
  getAllMultiDeskPermissions,
  getAllDeskPermissions,
} from "../../../../../services/roleService";
import { snackbarActions } from "../../../../../components/Snackbar/slice";

export function* getOrgPermissions({
  payload,
}: PayloadAction<string>): Generator<any> {
  try {
    const response = yield call(getAllOrgPermissions, payload);
    if (response)
      yield put(actions.getOrgPermissionsSuccess(response as Permission[]));
  } catch (error) {
    yield put(
      snackbarActions.showSnackbar({
        message: error.data.message,
        type: "error",
      })
    );
  }
}

export function* getMultiDeskPermissions({
  payload,
}: PayloadAction<string>): Generator<any> {
  try {
    const response = yield call(getAllMultiDeskPermissions, payload);
    if (response)
      yield put(
        actions.getMultiDeskPermissionsSuccess(response as Permission[])
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

export function* getDeskPermissions({
  payload,
}: PayloadAction<string>): Generator<any> {
  try {
    const response = yield call(getAllDeskPermissions, payload);
    if (response)
      yield put(actions.getDeskPermissionsSuccess(response as Permission[]));
  } catch (error) {
    yield put(
      snackbarActions.showSnackbar({
        message: error.data.message,
        type: "error",
      })
    );
  }
}

export function* newOrgRoleSaga(): Generator<any> {
  yield takeEvery(actions.getOrgPermissions, getOrgPermissions);
  yield takeEvery(actions.getMultiDeskPermissions, getMultiDeskPermissions);
  yield takeEvery(actions.getDeskPermissions, getDeskPermissions);
}
