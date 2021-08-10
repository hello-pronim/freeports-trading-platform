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
      const sortedTrades = (
        response as PaginatedResponse<TradeRequest>
      ).content.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      );
      yield put(
        actions.getTradeRequestsSuccess(sortedTrades as TradeRequest[])
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
