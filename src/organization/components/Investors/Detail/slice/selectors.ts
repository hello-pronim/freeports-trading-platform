import { createSelector } from "@reduxjs/toolkit";

import { initialState } from ".";
import { RootState } from "../../../../../util/types/RootState";

// First select the relevant part from the state
const selectDomain = (state: RootState) => state.investorDetail || initialState;

// eslint-disable-next-line import/prefer-default-export
export const selectInvestorDetail = createSelector(
  [selectDomain],
  (investorDetailState) => investorDetailState.selectedInvestor
);

export const selectIsDetailLoading = createSelector(
  [selectDomain],
  (investorDetailState) => investorDetailState.loadingDetail
);

export const selectTradeRequests = createSelector(
  [selectDomain],
  (investorDetailState) => investorDetailState.tradeRequests
);

export const selectIsTradeRequestsLoading = createSelector(
  [selectDomain],
  (investorDetailState) => investorDetailState.loadingTradeRequests
);

export const selectIsTradeRequestCreating = createSelector(
  [selectDomain],
  (investorDetailState) => investorDetailState.creatingTradeRequest
);

export const selectInvestorAccounts = createSelector(
  [selectDomain],
  (investorDetailState) => investorDetailState.investorAccounts
);

export const selectIsInvestorAccountsLoading = createSelector(
  [selectDomain],
  (investorDetailState) => investorDetailState.loadingInvestorAccounts
);

export const selectIsInvestorAccountCreating = createSelector(
  [selectDomain],
  (investorDetailState) => investorDetailState.creatingInvestorAccount
);

export const selectInvestorAccount = createSelector(
  [selectDomain],
  (investorDetailState) => investorDetailState.selectedInvestorAccount
);

export const selectIsInvestorAccountDetailLoading = createSelector(
  [selectDomain],
  (investorDetailState) => investorDetailState.loadingInvestorAccountDetail
);
