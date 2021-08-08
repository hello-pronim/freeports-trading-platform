import { createSelector } from "@reduxjs/toolkit";

import { initialState } from ".";
import { RootState } from "../../../../util/types/RootState";

// First select the relevant part from the state
const selectDomain = (state: RootState) => state.organizations || initialState;

// eslint-disable-next-line import/prefer-default-export
export const selectOrganizations = createSelector(
  [selectDomain],
  (organizationsState) => organizationsState.organizations
);

export const selectIsOrganizationsLoading = createSelector(
  [selectDomain],
  (organizationsState) => organizationsState.loading
);
