import { takeEvery, takeLatest, call, put, take } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import Role from "../../../../types/Role";
import Permission from "../../../../types/Permission";

import { rolesActions as actions } from ".";

import {
  getAllOrgRoles,
  deleteOrgRole,
  getAllOrgPermissions,
  getAllMultiDeskRoles,
  getAllMultiDeskPermissions,
  getAllDeskRoles,
  getAllDeskPermissions,
} from "../../../../services/roleService";
import { snackbarActions } from "../../../../components/Snackbar/slice";

export function* getOrgRoles({
  payload,
}: PayloadAction<string>): Generator<any> {
  try {
    const response = yield call(getAllOrgRoles, payload);
    if (response) yield put(actions.getOrgRolesSuccess(response as Role[]));
  } catch (error) {
    yield put(
      snackbarActions.showSnackbar({
        message: error.data.message,
        type: "error",
      })
    );
  }
}

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

export function* getMultiDeskRoles({
  payload,
}: PayloadAction<string>): Generator<any> {
  try {
    const response = yield call(getAllMultiDeskRoles, payload);
    if (response)
      yield put(actions.getMultiDeskRolesSuccess(response as Role[]));
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
}: PayloadAction<{ organizationId: string; deskId?: string }>): Generator<any> {
  try {
    const response = yield call(
      getAllMultiDeskPermissions,
      payload.organizationId,
      payload.deskId
    );
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

export function* getDeskRoles({
  payload,
}: PayloadAction<string>): Generator<any> {
  try {
    const response = yield call(getAllDeskRoles, payload);
    if (response) yield put(actions.getDeskRolesSuccess(response as Role[]));
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
}: PayloadAction<{ organizationId: string; deskId?: string }>): Generator<any> {
  try {
    const response = yield call(
      getAllDeskPermissions,
      payload.organizationId,
      payload.deskId
    );
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
/* export function* removeRole({
  payload,
}: PayloadAction<{
  organizationId: string;
  roleId: string;
}>): Generator<any> {
  try {
    const response = yield call(
      deleteOrgRole,
      payload.organizationId,
      payload.roleId
    );
    if (response) {
      yield put(actions.removeRoleSuccess(response as string));
      yield put(
        snackbarActions.showSnackbar({
          message: "Role has been deleted successfully",
          type: "success",
        })
      );
      yield put(actions.getRoles(payload.organizationId));
      yield take(actions.getRolesSuccess);
    }
  } catch (error) {
    yield put(
      snackbarActions.showSnackbar({
        message: error.data.message,
        type: "error",
      })
    );
  }
} */

export function* rolesSaga(): Generator<any> {
  yield takeEvery(actions.getOrgRoles, getOrgRoles);
  yield takeEvery(actions.getOrgPermissions, getOrgPermissions);
  yield takeEvery(actions.getMultiDeskRoles, getMultiDeskRoles);
  yield takeEvery(actions.getMultiDeskPermissions, getMultiDeskPermissions);
  yield takeEvery(actions.getDeskRoles, getDeskRoles);
  yield takeEvery(actions.getDeskPermissions, getDeskPermissions);
}
