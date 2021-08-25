import { createSelector } from "@reduxjs/toolkit";

import { initialState } from ".";
import { RootState } from "../../../../util/types/RootState";

// First select the relevant part from the state
const selectDomain = (state: RootState) =>
  state.orgCoWorkerForm || initialState;

// eslint-disable-next-line import/prefer-default-export
export const selectOrgRoles = createSelector(
  [selectDomain],
  (orgCoWorkerFormState) => orgCoWorkerFormState.orgRoles
);

export const selectMultiDeskRoles = createSelector(
  [selectDomain],
  (orgCoWorkerFormState) => orgCoWorkerFormState.multiDeskRoles
);

export const selectDeskRoles = createSelector(
  [selectDomain],
  (orgCoWorkerFormState) => orgCoWorkerFormState.deskRoles
);

export const selectIsUserAddingToVault = createSelector(
  [selectDomain],
  (orgCoWorkerFormState) => orgCoWorkerFormState.addingUserToVault
);
