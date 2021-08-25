import { createSelector } from "@reduxjs/toolkit";

import { initialState } from ".";
import { RootState } from "../../../../util/types/RootState";

// First select the relevant part from the state
const selectDomain = (state: RootState) => state.desks || initialState;

// eslint-disable-next-line import/prefer-default-export
export const selectDesks = createSelector(
  [selectDomain],
  (desksState) => desksState.desks
);

export const selectIsDesksLoading = createSelector(
  [selectDomain],
  (desksState) => desksState.loading
);

export const selectIsDeskCreating = createSelector(
  [selectDomain],
  (desksState) => desksState.creating
);

export const selectIsDeskDeleting = createSelector(
  [selectDomain],
  (desksState) => desksState.deleting
);
