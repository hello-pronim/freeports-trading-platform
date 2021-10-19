import { createSelector } from "@reduxjs/toolkit";

import { BigNumber } from "bignumber.js";
import { initialState } from ".";
import { CryptoCurrencies } from "../../../../../types/Currencies";
import { RootState } from "../../../../../util/types/RootState";

// First select the relevant part from the state
const selectDomain = (state: RootState) => state.tradeDetail || initialState;

// eslint-disable-next-line import/prefer-default-export
export const selectTradeRequestDetail = createSelector(
  [selectDomain],
  (tradeRequestDetailState) => tradeRequestDetailState.selectedTradeRequest
);

export const selectRemainingQuantity = createSelector(
  [selectDomain],
  (tradeRequestDetailState) => {
    if (tradeRequestDetailState.selectedTradeRequest?.orders) {
      const orderedAmount =
        tradeRequestDetailState.selectedTradeRequest.orders.reduce(
          (prev, curr) => {
            const quantity = curr.executedPrice ? curr.quantity : "0";
            return new BigNumber(quantity).plus(prev).toString();
          },
          "0"
        );
      return new BigNumber(
        tradeRequestDetailState.selectedTradeRequest.quantity
      )
        .minus(orderedAmount)
        .toString();
    }
    return tradeRequestDetailState.selectedTradeRequest.quantity;
  }
);

export const selectIsDetailLoading = createSelector(
  [selectDomain],
  (tradeRequestDetailState) => tradeRequestDetailState.loadingDetail
);
export const selectRfqsLoading = createSelector(
  [selectDomain],
  (tradeRequestDetailState) => tradeRequestDetailState.loadingRfqs
);
export const selectRfqs = createSelector(
  [selectDomain],
  (tradeRequestDetailState) => tradeRequestDetailState.rfqs
);
export const selectOrderLoading = createSelector(
  [selectDomain],
  (tradeRequestDetailState) => tradeRequestDetailState.orderLoading
);

export const selectBestRfq = createSelector(
  [selectDomain],
  (tradeRequestDetailState) => {
    let bestRfq = tradeRequestDetailState.rfqs[0];
    for (let i = 0; i < tradeRequestDetailState.rfqs.length; i += 1) {
      if (
        new BigNumber(tradeRequestDetailState.rfqs[i].price).lt(
          new BigNumber(bestRfq.price)
        )
      ) {
        bestRfq = tradeRequestDetailState.rfqs[i];
      }
    }
    return bestRfq;
  }
);

export const selectBaseCurrency = createSelector(
  [selectDomain],
  (tradeRequestDetailState) => {
    const { selectedTradeRequest } = tradeRequestDetailState;

    if (selectedTradeRequest) {
      return Object.values(CryptoCurrencies).includes(
        selectedTradeRequest.currencyFrom as CryptoCurrencies
      )
        ? selectedTradeRequest.currencyFrom
        : selectedTradeRequest.currencyTo;
    }
    return "";
  }
);

export const selectTradeAmount = createSelector(
  [selectDomain],
  (tradeRequestDetailState) => tradeRequestDetailState.tradeAmount
);

export const selectPriceEvents = createSelector(
  [selectDomain],
  (tradeRequestDetailState) => tradeRequestDetailState.priceEvents
);
