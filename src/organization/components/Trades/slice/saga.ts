import { takeLatest, call, put } from "redux-saga/effects";
import TradeRequest from "../../../../types/TradeRequest";

import { tradesActions as actions } from ".";

import { getAllTradeRequests } from "../../../../services/tradeService";
import { snackbarActions } from "../../../../components/Snackbar/slice";
import PaginatedResponse from "../../../../types/PaginatedResponse";

export function* getTradeRequests(): Generator<any> {
  try {
    const response = yield call(getAllTradeRequests);

    if (response) {
      yield put(
        actions.getTradeRequestsSuccess(
          (response as PaginatedResponse<TradeRequest>).content
        )
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

export function* tradesSaga(): Generator<any> {
  yield takeLatest(actions.getTradeRequests, getTradeRequests);
}
