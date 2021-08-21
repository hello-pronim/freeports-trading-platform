import {
  takeEvery,
  call,
  put,
  debounce,
  takeLatest,
  select,
} from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import { BigNumber } from "bignumber.js";
import TradeRequest from "../../../../../types/TradeRequest";

import { tradeDetailActions as actions } from ".";

import {
  getTradeRequest,
  tradeOrderRequest,
  tradeRfqRequest,
} from "../../../../../services/tradeService";
import { snackbarActions } from "../../../../../components/Snackbar/slice";
import { RfqResponse } from "../../../../../types/RfqResponse";
import {
  TradeOrderResponse,
  TradeOrderStatus,
} from "../../../../../types/TradeOrderResponse";
import { selectRemainingQuantity, selectTradeAmount } from "./selectors";

export function* retrieveTradeRequest({
  payload,
}: PayloadAction<{
  organizationId: string;
  deskId: string;
  investorId: string;
  tradeId: string;
}>): Generator<any> {
  try {
    const response = yield call(
      getTradeRequest,
      payload.organizationId,
      payload.deskId,
      payload.investorId,
      payload.tradeId
    );
    if (response)
      yield put(actions.getTradeRequestDetailSuccess(response as TradeRequest));
  } catch (error) {
    yield put(
      snackbarActions.showSnackbar({
        message: error.data.message,
        type: "error",
      })
    );
  }
}
export function* getRfqs({
  payload,
}: PayloadAction<{
  organizationId: string;
  deskId: string;
  investorId: string;
  tradeId: string;
  ignoreError: boolean;
}>): Generator<any> {
  try {
    console.log("get rfq from api", payload);

    const quantity = yield select(selectTradeAmount);
    const remainingQuantity = yield select(selectRemainingQuantity);
    if (quantity && remainingQuantity !== "0") {
      if (Number(quantity as string) <= 0) {
        yield put(
          snackbarActions.showSnackbar({
            message: "Amount must be Positive number greater than zero",
            type: "error",
          })
        );
        yield put(actions.getRfqsFail({}));

        return;
      }
      if (Number(quantity as string) >= Number(remainingQuantity as string)) {
        yield put(
          snackbarActions.showSnackbar({
            message: "Quantity exceeds trade amount",
            type: "error",
          })
        );

        yield put(actions.getRfqsFail({}));
      } else {
        yield put(actions.setRfqsLoading());

        const response = yield call(
          tradeRfqRequest,
          payload.organizationId,
          payload.deskId,
          payload.investorId,
          payload.tradeId,
          quantity as string
        );
        yield put(actions.getRfqsSuccess(response as RfqResponse[]));
        if ((response as RfqResponse[]).length === 0 && !payload.ignoreError) {
          yield put(
            snackbarActions.showSnackbar({
              message: "No brokers available",
              type: "error",
            })
          );

          yield put(actions.getRfqsFail({}));
        }
      }
    }
  } catch (error) {
    if (!payload.ignoreError) {
      yield put(
        snackbarActions.showSnackbar({
          message: "Error Requesting RFQ",
          type: "error",
        })
      );
    }

    yield put(actions.getRfqsFail(error));
  }
}

export function* tradeOrder({
  payload,
}: PayloadAction<{
  organizationId: string;
  deskId: string;
  investorId: string;
  tradeId: string;

  rfqId: string;
}>): Generator<any> {
  try {
    const response = yield call(
      tradeOrderRequest,
      payload.organizationId,
      payload.deskId,
      payload.investorId,
      payload.tradeId,
      payload.rfqId
    );
    yield put(actions.orderSuccess(response as TradeOrderResponse));
    if (
      response &&
      (response as TradeOrderResponse).status === TradeOrderStatus.failed
    ) {
      yield put(
        snackbarActions.showSnackbar({
          message: "Order failed",
          type: "error",
        })
      );
    } else {
      yield put(
        snackbarActions.showSnackbar({
          message: "Order submitted",
          type: "success",
        })
      );
      const remainingQuantity = yield select(selectRemainingQuantity);
      if (
        remainingQuantity &&
        new BigNumber(remainingQuantity as string).gt(0)
      ) {
        yield put(actions.setTradeAmount(remainingQuantity));
        yield call(getRfqs, {
          payload: {
            organizationId: payload.organizationId,
            deskId: payload.deskId,
            investorId: payload.investorId,
            tradeId: payload.tradeId,
            quantity: remainingQuantity,
            ignoreError: true,
          },
        } as PayloadAction<any>);
      } else {
        yield put(actions.setTradeAmount(""));
      }
    }
  } catch (error) {
    yield put(
      snackbarActions.showSnackbar({
        message: "Error Submitting order",
        type: "error",
      })
    );
    yield put(actions.orderFail(error));
  }
}

export function* tradeDetailSaga(): Generator<any> {
  yield takeEvery(actions.getTradeRequestDetail, retrieveTradeRequest);
  yield debounce(600, actions.getRfqs, getRfqs);
  yield takeLatest(actions.order, tradeOrder);
}
