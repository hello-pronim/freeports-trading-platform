import { PayloadAction } from "@reduxjs/toolkit";

import { takeEvery, call, put, takeLatest } from "redux-saga/effects";

import { coWorkActions as actions } from ".";
import { snackbarActions } from "../../../../components/Snackbar/slice";
import {
  createVaultUser,
  removeVaultUser,
} from "../../../../services/orgUsersService";

import {
  getAllOrgRoles,
  getAllMultiDeskRoles,
  getAllDeskRoles,
} from "../../../../services/roleService";
import { VaultRequestDto } from "../../../../services/vaultService";
import { PublicKeyDoc } from "../../../../types/User";
import vault from "../../../../vault";
import Role from "../../../../types/Role";

export function* getOrgRoles({
  payload,
}: PayloadAction<string>): Generator<any> {
  try {
    const response = yield call(getAllOrgRoles, payload);
    yield put(actions.getOrgRolesSuccess(response as Array<Role>));
  } catch (error) {
    snackbarActions.showSnackbar({
      message: error.data.message,
      type: "error",
    });
  }
}

export function* getMultiDeskRoles({
  payload,
}: PayloadAction<string>): Generator<any> {
  try {
    const response = yield call(getAllMultiDeskRoles, payload);
    yield put(actions.getMultiDeskRolesSuccess(response as Array<Role>));
  } catch (error) {
    snackbarActions.showSnackbar({
      message: error.data.message,
      type: "error",
    });
  }
}

export function* getDeskRoles({
  payload,
}: PayloadAction<string>): Generator<any> {
  try {
    const response = yield call(getAllDeskRoles, payload);
    yield put(actions.getDeskRolesSuccess(response as Array<Role>));
  } catch (error) {
    snackbarActions.showSnackbar({
      message: error.data.message,
      type: "error",
    });
  }
}
export function* addUserToVault({
  payload: { organizationId, userId, publicKey },
}: PayloadAction<{
  organizationId: string;
  userId: string;
  publicKey: PublicKeyDoc;
}>): Generator<any> {
  try {
    const createVaultUserRequest = yield call(
      vault.createVaultUser,
      publicKey.key,
      true
    );

    console.log("create vault user req ", createVaultUserRequest);
    const response = yield call(
      createVaultUser,
      organizationId,
      userId,
      createVaultUserRequest as VaultRequestDto
    );
    if (response) {
      yield put(actions.addUserToVaultSuccess());
      yield put(
        snackbarActions.showSnackbar({
          message: "This user has been added to vault successfully",
          type: "success",
        })
      );
    }
  } catch (error) {
    yield put(
      snackbarActions.showSnackbar({
        message: error.message,
        type: "error",
      })
    );
  }
}

export function* removeUserFromVault({
  payload: { userVaultId, organizationId, userId },
}: PayloadAction<{
  userVaultId: string;
  organizationId: string;
  userId: string;
}>): Generator<any> {
  try {
    const removeVaultUserRequest = yield call(
      vault.deleteVaultUser,
      userVaultId,
      true
    );

    console.log("remove vault user req ", removeVaultUserRequest);
    const response = yield call(
      removeVaultUser,
      organizationId,
      userId,
      removeVaultUserRequest as VaultRequestDto
    );
    if (response) {
      yield put(actions.removeUserFromVaultSuccess());
      yield put(
        snackbarActions.showSnackbar({
          message: "This user has been removed from Vault successfully",
          type: "success",
        })
      );
    }
  } catch (error) {
    yield put(
      snackbarActions.showSnackbar({
        message: error.message,
        type: "error",
      })
    );
  }
}

export function* coWorkerFormSaga(): Generator<any> {
  yield takeEvery(actions.getOrgRoles, getOrgRoles);
  yield takeEvery(actions.getMultiDeskRoles, getMultiDeskRoles);
  yield takeEvery(actions.getDeskRoles, getDeskRoles);
  yield takeLatest(actions.addUserToVault, addUserToVault);
  yield takeLatest(actions.removeUserFromVault, removeUserFromVault);
}
