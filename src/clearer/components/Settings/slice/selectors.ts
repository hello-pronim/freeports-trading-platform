import { createSelector } from "@reduxjs/toolkit";

import { initialState } from ".";
import { RootState } from "../../../../util/types/RootState";

// First select the relevant part from the state
const selectDomain = (state: RootState) =>
  state.clearerSettings || initialState;

// eslint-disable-next-line import/prefer-default-export
export const selectClearerSettings = createSelector(
  [selectDomain],
  (desksState) => desksState.clearerSettings
);

export const selectIsFormLoading = createSelector(
  [selectDomain],
  (desksState) => desksState.formLoading
);

export const selectIsFormSubmitting = createSelector(
  [selectDomain],
  (desksState) => desksState.formSubmitting
);
