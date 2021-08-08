import { takeEvery, takeLatest, call, put, take } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import Organization from "../../../../types/Organization";

import { organizationsActions as actions } from ".";

import {
  retrieveOrganizations,
  createOrganization,
} from "../../../../services/organizationService";
import { snackbarActions } from "../../../../components/Snackbar/slice";
import PaginatedResponse from "../../../../types/PaginatedResponse";

export function* getOrganizations(): Generator<any> {
  try {
    const response = yield call(retrieveOrganizations);
    if (response)
      yield put(
        actions.getOrganizationsSuccess(
          (response as PaginatedResponse<Organization>).content
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

export function* addOrganization({
  payload,
}: PayloadAction<Organization>): Generator<any> {
  try {
    const response = yield call(createOrganization, payload);
    if (response) {
      yield put(actions.addOrganizationSuccess(response as string));
      yield put(
        snackbarActions.showSnackbar({
          message: "Organization has been created successfully",
          type: "success",
        })
      );
      yield put(actions.getOrganizations());
      yield take(actions.getOrganizationsSuccess);
    }
  } catch (error) {
    const errorList = error.data.message;
    if (errorList.length) {
      if (errorList[0].constraints.isIBAN)
        yield put(
          snackbarActions.showSnackbar({
            message: errorList[0].constraints.isIBAN,
            type: "error",
          })
        );
    }
  }
}

export function* organizationsSaga(): Generator<any> {
  yield takeLatest(actions.getOrganizations, getOrganizations);
  yield takeEvery(actions.addOrganization, addOrganization);
}
