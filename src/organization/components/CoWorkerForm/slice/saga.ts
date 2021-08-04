import { PayloadAction } from "@reduxjs/toolkit";

import { takeEvery, call, put, takeLatest } from "redux-saga/effects";

import { coWorkActions as actions } from ".";
import { snackbarActions } from "../../../../components/Snackbar/slice";
import { createVaultUser } from "../../../../services/clearerUsersService";

import getClearerRoles from "../../../../services/roleService";
import { VaultRequestDto } from "../../../../services/vaultService";
import { PublicKeyDoc } from "../../../../types/User";
import vault from "../../../../vault";
import Role from "../../../../types/Role";

export function* getRoles(): Generator<any> {
  try {
    const response = yield call(getClearerRoles);
    yield put(actions.getRolesSuccess(response as Array<Role>));
  } catch (error) {
    snackbarActions.showSnackbar({
      message: error.data.message,
      type: "error",
    });
  }
}

export function* addUserToVault({
  payload: { publicKey, userId },
}: PayloadAction<{
  userId: string;
  publicKey: PublicKeyDoc;
}>): Generator<any> {
  try {
    const createVaultUserRequest = yield call(
      vault.createVaultUser,
      publicKey.key
    );

    console.log("create vault user req ", createVaultUserRequest);
    const response = yield call(
      createVaultUser,
      userId,
      createVaultUserRequest as VaultRequestDto
    );
    yield put(
      snackbarActions.showSnackbar({
        message: "Vault user created successfully",
        type: "success",
      })
    );
  } catch (error) {
    console.error(error);
    yield put(
      snackbarActions.showSnackbar({
        message: "Error Creating vault user",
        type: "error",
      })
    );
  }
}
export function* coWorkerFormSaga(): Generator<any> {
  yield takeEvery(actions.getRoles, getRoles);
  yield takeLatest(actions.addUserToVault, addUserToVault);
}
