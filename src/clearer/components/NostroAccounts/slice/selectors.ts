import { createSelector } from "@reduxjs/toolkit";

import { initialState } from ".";
import { RootState } from "../../../../util/types/RootState";

// First select the relevant part from the state
const selectDomain = (state: RootState) => state.accounts || initialState;

// eslint-disable-next-line import/prefer-default-export
export const selectAccounts = createSelector(
  [selectDomain],
  (accountsState) => accountsState.accounts
);

export const selectIsAccountsLoading = createSelector(
  [selectDomain],
  (accountsState) => accountsState.loading
);

export const selectIsAccountCreating = createSelector(
  [selectDomain],
  (accountsState) => accountsState.creating
);

export const selectIsAccountDeleting = createSelector(
  [selectDomain],
  (accountsState) => accountsState.deleting
);
