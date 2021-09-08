import { takeEvery, call, put, take } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import Account from "../../../../../types/Account";
import Investor from "../../../../../types/Investor";
import TradeRequest from "../../../../../types/TradeRequest";

import { investorDetailActions as actions } from ".";

import {
  getInvestor,
  getInvestorAccounts,
  createInvestorAccount,
  deleteInvestorAccount,
} from "../../../../../services/investorService";
import {
  getInvestorTradeRequests,
  createTradeRequest,
} from "../../../../../services/tradeService";
import { snackbarActions } from "../../../../../components/Snackbar/slice";
import PaginatedResponse from "../../../../../types/PaginatedResponse";

export function* retrieveInvestor({
  payload,
}: PayloadAction<{
  organizationId: string;
  deskId: string;
  investorId: string;
}>): Generator<any> {
  try {
    const response = yield call(
      getInvestor,
      payload.organizationId,
      payload.deskId,
      payload.investorId
    );
    if (response) yield put(actions.getInvestorSuccess(response as Investor));
  } catch (error) {
    yield put(actions.getInvestorFailed());
    yield put(
      snackbarActions.showSnackbar({
        message: error.data.message,
        type: "error",
      })
    );
  }
}

export function* retrieveInvestorTradeRequests({
  payload,
}: PayloadAction<{
  organizationId: string;
  deskId: string;
  investorId: string;
}>): Generator<any> {
  try {
    const response = yield call(
      getInvestorTradeRequests,
      payload.organizationId,
      payload.deskId,
      payload.investorId
    );
    if (response)
      yield put(
        actions.getInvestorTradeRequestsSuccess(
          (response as PaginatedResponse<TradeRequest>).content
        )
      );
  } catch (error) {
    yield put(actions.getInvestorTradeRequestsFailed());
    yield put(
      snackbarActions.showSnackbar({
        message: error.data.message,
        type: "error",
      })
    );
  }
}

export function* addTradeRequest({
  payload,
}: PayloadAction<{
  organizationId: string;
  deskId: string;
  investorId: string;
  trade: TradeRequest;
}>): Generator<any> {
  try {
    const response = yield call(
      createTradeRequest,
      payload.organizationId,
      payload.deskId,
      payload.investorId,
      payload.trade
    );
    if (response) {
      yield put(actions.addTradeRequestSuccess(response as string));
      yield put(
        snackbarActions.showSnackbar({
          message: "Trade has been created successfully",
          type: "success",
        })
      );
      yield put(
        actions.getInvestorTradeRequests({
          organizationId: payload.organizationId,
          deskId: payload.deskId,
          investorId: payload.investorId,
        })
      );
      yield take(actions.getInvestorTradeRequestsSuccess);
    }
  } catch (error) {
    yield put(actions.addTradeRequestFailed());
    yield put(
      snackbarActions.showSnackbar({
        message: error.data.message,
        type: "error",
      })
    );
  }
}

export function* retrieveInvestorAccounts({
  payload,
}: PayloadAction<{
  organizationId: string;
  deskId: string;
  investorId: string;
}>): Generator<any> {
  try {
    const response = yield call(
      getInvestorAccounts,
      payload.organizationId,
      payload.deskId,
      payload.investorId
    );
    if (response)
      yield put(actions.getInvestorAccountsSuccess(response as Account[]));
  } catch (error) {
    yield put(actions.getInvestorAccountsFailed());
    yield put(
      snackbarActions.showSnackbar({
        message: error.data.message,
        type: "error",
      })
    );
  }
}

export function* addInvestorAccount({
  payload,
}: PayloadAction<{
  organizationId: string;
  deskId: string;
  investorId: string;
  account: Account;
}>): Generator<any> {
  try {
    const response = yield call(
      createInvestorAccount,
      payload.organizationId,
      payload.deskId,
      payload.investorId,
      payload.account
    );
    if (response) {
      yield put(actions.addInvestorAccountSuccess(response as string));
      yield put(
        snackbarActions.showSnackbar({
          message: "Investor account has been created successfully",
          type: "success",
        })
      );
      yield put(
        actions.getInvestorAccounts({
          organizationId: payload.organizationId,
          deskId: payload.deskId,
          investorId: payload.investorId,
        })
      );
      yield take(actions.getInvestorAccountsSuccess);
    }
  } catch (error) {
    yield put(actions.addInvestorAccountFailed());
    const errorList = error.data.message;
    if (Array.isArray(errorList)) {
      if (errorList.length) {
        if (errorList[0].constraints.IsUnique) {
          yield put(
            snackbarActions.showSnackbar({
              message: errorList[0].constraints.IsUnique,
              type: "error",
            })
          );
        }
      }
    } else {
      yield put(
        snackbarActions.showSnackbar({
          message: error.data.message,
          type: "error",
        })
      );
    }
  }
}

export function* removeInvestorAccount({
  payload,
}: PayloadAction<{
  organizationId: string;
  deskId: string;
  investorId: string;
  accountId: string;
}>): Generator<any> {
  try {
    const response = yield call(
      deleteInvestorAccount,
      payload.organizationId,
      payload.deskId,
      payload.investorId,
      payload.accountId
    );
    if (response) {
      yield put(actions.removeInvestorAccountSuccess());
      yield put(
        snackbarActions.showSnackbar({
          message: "Investor account has been deleted successfully",
          type: "success",
        })
      );
      yield put(
        actions.getInvestorAccounts({
          organizationId: payload.organizationId,
          deskId: payload.deskId,
          investorId: payload.investorId,
        })
      );
      yield take(actions.getInvestorAccountsSuccess);
    }
  } catch (error) {
    yield put(actions.removeInvestorAccountFailed());
    const errorList = error.data.message;
    if (Array.isArray(errorList)) {
      if (errorList.length) {
        if (errorList[0].constraints.IsUnique) {
          yield put(
            snackbarActions.showSnackbar({
              message: errorList[0].constraints.IsUnique,
              type: "error",
            })
          );
        }
      }
    } else {
      yield put(
        snackbarActions.showSnackbar({
          message: error.data.message,
          type: "error",
        })
      );
    }
  }
}

export function* investorDetailSaga(): Generator<any> {
  yield takeEvery(actions.getInvestor, retrieveInvestor);
  yield takeEvery(
    actions.getInvestorTradeRequests,
    retrieveInvestorTradeRequests
  );
  yield takeEvery(actions.addTradeRequest, addTradeRequest);
  yield takeEvery(actions.getInvestorAccounts, retrieveInvestorAccounts);
  yield takeEvery(actions.addInvestorAccount, addInvestorAccount);
  yield takeEvery(actions.removeInvestorAccount, removeInvestorAccount);
}
