import { createSelector } from "@reduxjs/toolkit";

import { initialState } from ".";
import { RootState } from "../../../../util/types/RootState";

// First select the relevant part from the state
const selectDomain = (state: RootState) => state.investors || initialState;

// eslint-disable-next-line import/prefer-default-export
export const selectInvestors = createSelector(
  [selectDomain],
  (investorsState) => investorsState.investors
);

export const selectIsInvestorsLoading = createSelector(
  [selectDomain],
  (investorsState) => investorsState.loading
);

export const selectIsInvestorCreating = createSelector(
  [selectDomain],
  (investorsState) => investorsState.creating
);
