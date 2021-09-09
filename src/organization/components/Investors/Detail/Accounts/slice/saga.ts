import { takeEvery, call, put, take } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";

import { investorDetailActions as actions } from ".";

import {
  getInvestorAccountOperations,
  getInvestorAccountBalance,
} from "../../../../../../services/investorService";
import InvestorAccountOperation from "../../../../../../types/InvestorAccountOperation";
import InvestorAccountBalance from "../../../../../../types/InvestorAccountBalance";
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

export function* retrieveInvestorAccountBalance({
  payload,
}: PayloadAction<{
  organizationId: string;
  deskId: string;
  investorId: string;
  accountId: string;
}>): Generator<any> {
  try {
    const response = yield call(
      getInvestorAccountBalance,
      payload.organizationId,
      payload.deskId,
      payload.investorId,
      payload.accountId
    );
    if (response)
      yield put(
        actions.getInvestorAccountBalanceSuccess(
          response as InvestorAccountBalance
        )
      );
  } catch (error) {
    yield put(actions.getInvestorAccountBalanceFailed());
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
  yield takeEvery(
    actions.getInvestorAccountBalance,
    retrieveInvestorAccountBalance
  );
}
