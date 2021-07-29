import { takeEvery, call, put, take } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import Role from "../../../../../types/Role";
import Permission from "../../../../../types/Permission";
import PaginatedResponse from "../../../../../types/PaginatedResponse";

import { newOrgRoleActions as actions } from ".";

import {
  createOrgRole,
  getAllOrgPermissions,
  createMultiDeskRole,
  getAllMultiDeskPermissions,
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

export function* addOrgRole({
  payload,
}: PayloadAction<{ organizationId: string; role: Role }>): Generator<any> {
  try {
    const response = yield call(
      createOrgRole,
      payload.organizationId,
      payload.role
    );
    if (response) {
      yield put(actions.addOrgRoleSuccess(response as string));
      yield put(
        snackbarActions.showSnackbar({
          message: "New organization role has been created successfully",
          type: "success",
        })
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

export function* addMultiDeskRole({
  payload,
}: PayloadAction<{ organizationId: string; role: Role }>): Generator<any> {
  try {
    const response = yield call(
      createMultiDeskRole,
      payload.organizationId,
      payload.role
    );
    if (response) {
      yield put(actions.addMultiDeskRoleSuccess(response as string));
      yield put(
        snackbarActions.showSnackbar({
          message: "New multi-desk role has been created successfully",
          type: "success",
        })
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

export function* newOrgRoleSaga(): Generator<any> {
  yield takeEvery(actions.getOrgPermissions, getOrgPermissions);
  yield takeEvery(actions.getMultiDeskPermissions, getMultiDeskPermissions);
  yield takeEvery(actions.addOrgRole, addOrgRole);
  yield takeEvery(actions.addMultiDeskRole, addMultiDeskRole);
}
