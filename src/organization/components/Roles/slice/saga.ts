import { takeEvery, takeLatest, call, put, take } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import Role from "../../../../types/Role";
import DeskRole from "../../../../types/DeskRole";
import Permission from "../../../../types/Permission";

import { rolesActions as actions } from ".";

import {
  getAllOrgRoles,
  updateOrgRole,
  removeOrgRole,
  getAllOrgPermissions,
  getAllMultiDeskRoles,
  updateMultiDeskRole,
  removeMultiDeskRole,
  getAllMultiDeskPermissions,
  getAllDeskRoles,
  removeDeskRole,
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

export function* editOrgRole({
  payload,
}: PayloadAction<{
  organizationId: string;
  roleId: string;
  role: Role;
}>): Generator<any> {
  try {
    const response = yield call(
      updateOrgRole,
      payload.organizationId,
      payload.roleId,
      payload.role
    );
    if (response) {
      yield put(actions.editOrgRoleSuccess(response as string));
      yield put(actions.getOrgRoles(payload.organizationId));
      yield take(actions.getOrgRolesSuccess);
      yield put(
        snackbarActions.showSnackbar({
          message: "Organization role has been updated successfully",
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

export function* deleteOrgRole({
  payload,
}: PayloadAction<{
  organizationId: string;
  roleId: string;
}>): Generator<any> {
  try {
    const response = yield call(
      removeOrgRole,
      payload.organizationId,
      payload.roleId
    );
    if (response) {
      yield put(actions.deleteOrgRoleSuccess(response as string));
      yield put(actions.getOrgRoles(payload.organizationId));
      yield take(actions.getOrgRolesSuccess);
      yield put(
        snackbarActions.showSnackbar({
          message: "Organization role has been deleted successfully",
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

export function* editMultiDeskRole({
  payload,
}: PayloadAction<{
  organizationId: string;
  roleId: string;
  role: Role;
}>): Generator<any> {
  try {
    const response = yield call(
      updateMultiDeskRole,
      payload.organizationId,
      payload.roleId,
      payload.role
    );
    if (response) {
      yield put(actions.editMultiDeskRoleSuccess(response as string));
      yield put(actions.getMultiDeskRoles(payload.organizationId));
      yield take(actions.getMultiDeskRolesSuccess);
      yield put(
        snackbarActions.showSnackbar({
          message: "Multi-desk role has been updated successfully",
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

export function* deleteMultiDeskRole({
  payload,
}: PayloadAction<{
  organizationId: string;
  roleId: string;
}>): Generator<any> {
  try {
    const response = yield call(
      removeMultiDeskRole,
      payload.organizationId,
      payload.roleId
    );
    if (response) {
      yield put(actions.deleteMultiDeskRoleSuccess(response as string));
      yield put(actions.getMultiDeskRoles(payload.organizationId));
      yield take(actions.getMultiDeskRolesSuccess);
      yield put(
        snackbarActions.showSnackbar({
          message: "Multi-desk role has been deleted successfully",
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
    if (response)
      yield put(actions.getDeskRolesSuccess(response as DeskRole[]));
  } catch (error) {
    yield put(
      snackbarActions.showSnackbar({
        message: error.data.message,
        type: "error",
      })
    );
  }
}

export function* deleteDeskRole({
  payload,
}: PayloadAction<{
  organizationId: string;
  deskId: string;
  roleId: string;
}>): Generator<any> {
  try {
    const response = yield call(
      removeDeskRole,
      payload.organizationId,
      payload.deskId,
      payload.roleId
    );
    if (response) {
      yield put(actions.deleteDeskRoleSuccess(response as string));
      yield put(
        snackbarActions.showSnackbar({
          message: "Desk role has been deleted successfully",
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
  yield takeEvery(actions.editOrgRole, editOrgRole);
  yield takeEvery(actions.deleteOrgRole, deleteOrgRole);
  yield takeEvery(actions.getOrgPermissions, getOrgPermissions);
  yield takeEvery(actions.getMultiDeskRoles, getMultiDeskRoles);
  yield takeEvery(actions.editMultiDeskRole, editMultiDeskRole);
  yield takeEvery(actions.deleteMultiDeskRole, deleteMultiDeskRole);
  yield takeEvery(actions.getMultiDeskPermissions, getMultiDeskPermissions);
  yield takeEvery(actions.getDeskRoles, getDeskRoles);
  yield takeEvery(actions.deleteDeskRole, deleteDeskRole);
  yield takeEvery(actions.getDeskPermissions, getDeskPermissions);
}
