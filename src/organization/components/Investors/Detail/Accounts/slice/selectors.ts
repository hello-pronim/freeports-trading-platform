import { createSelector } from "@reduxjs/toolkit";

import { initialState } from ".";
import { RootState } from "../../../../../../util/types/RootState";

// First select the relevant part from the state
const selectDomain = (state: RootState) =>
  state.investorAccountDetail || initialState;

// eslint-disable-next-line import/prefer-default-export
export const selectInvestorAccountOperations = createSelector(
  [selectDomain],
  (investorDetailState) => investorDetailState.accountOperations
);

export const selectIsInvestorAccountOperationsLoading = createSelector(
  [selectDomain],
  (investorDetailState) => investorDetailState.loadingAccountOperations
);

export const selectInvestorAccountBalance = createSelector(
  [selectDomain],
  (investorDetailState) => investorDetailState.accountBalance
);

export const selectIsInvestorAccountBalanceLoading = createSelector(
  [selectDomain],
  (investorDetailState) => investorDetailState.loadingAccountBalance
);
