import { takeEvery, call, put } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";

import { vaultRequestActions as actions } from ".";

import { addPublicKey, getUserProfile } from "../../../services/profileService";
import { SavedKeyObject, saveKey } from "../../../util/keyStore/keystore";
import { publicKeyToString } from "../../../util/keyStore/functions";
import sendRequest, { VaultRequestDto } from "../../../services/vaultService";
import vault from "../../../vault";

export function* sendRequestSaga({
  payload: { method, path, body, headers },
}: PayloadAction<VaultRequestDto>): Generator<any> {
  try {
    const request = yield call(
      vault.createRequest,
      method,
      path,
      body,
      headers
    );

    const response = yield call(vault.sendRequest, request as VaultRequestDto);

    yield put(actions.requestSuccess(response));
  } catch (error) {
    console.log("error", error);
    yield put(actions.requestFailed(error));
  }
}

export function* profileSaga(): Generator<any> {
  yield takeEvery(actions.sendRequest, sendRequestSaga);
}
