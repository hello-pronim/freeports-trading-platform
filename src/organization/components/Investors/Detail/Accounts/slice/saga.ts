import { takeEvery, call, put, take } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";

import { investorDetailActions as actions } from ".";

import { getInvestorAccountOperations } from "../../../../../../services/investorService";
import InvestorAccountOperation from "../../../../../../types/InvestorAccountOperation";
import { snackbarActions } from "../../../../../../components/Snackbar/slice";

export function* retrieveInvestorAccountOperations({
  payload,
}: PayloadAction<{
  organizationId: string;
  deskId: string;
  investorId: string;
  accountId: string;
}>): Generator<any> {
  try {
    const response = yield call(
      getInvestorAccountOperations,
      payload.organizationId,
      payload.deskId,
      payload.investorId,
      payload.accountId
    );
    if (response)
      yield put(
        actions.getInvestorAccountOperationsSuccess(
          response as InvestorAccountOperation
        )
      );
  } catch (error) {
    yield put(actions.getInvestorAccountOperationsFailed());
    yield put(
      snackbarActions.showSnackbar({
        message: error.data.message,
        type: "error",
      })
    );
  }
}

export function* investorAccountDetailSaga(): Generator<any> {
  yield takeEvery(
    actions.getInvestorAccountOperations,
    retrieveInvestorAccountOperations
  );
}
