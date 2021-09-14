import { createSelector } from "@reduxjs/toolkit";

import { initialState } from ".";
import { RootState } from "../../../../../util/types/RootState";

// First select the relevant part from the state
const selectDomain = (state: RootState) => state.deskDetail || initialState;

// eslint-disable-next-line import/prefer-default-export
export const selectDeskDetail = createSelector(
  [selectDomain],
  (deskDetailState) => deskDetailState.selectedDesk
);

export const selectIsDetailLoading = createSelector(
  [selectDomain],
  (deskDetailState) => deskDetailState.loading
);

export const selectIsFormSubmitting = createSelector(
  [selectDomain],
  (deskDetailState) => deskDetailState.formSubmitting
);
