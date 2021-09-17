import { createSelector } from "@reduxjs/toolkit";

import { initialState } from ".";
import { RootState } from "../../../../../util/types/RootState";

// First select the relevant part from the state
const selectDomain = (state: RootState) => state.newOrgRole || initialState;

// eslint-disable-next-line import/prefer-default-export
export const selectOrgPermissions = createSelector(
  [selectDomain],
  (newOrgRoleState) => newOrgRoleState.orgPermissions
);

export const selectIsOrgPermissionsLoading = createSelector(
  [selectDomain],
  (newOrgRoleState) => newOrgRoleState.orgPermissionsLoading
);

export const selectMultiDeskPermissions = createSelector(
  [selectDomain],
  (newOrgRoleState) => newOrgRoleState.multiDeskPermissions
);

export const selectIsMultiDeskPermissionsLoading = createSelector(
  [selectDomain],
  (newOrgRoleState) => newOrgRoleState.multiDeskPermissionsLoading
);

export const selectDeskPermissions = createSelector(
  [selectDomain],
  (newOrgRoleState) => newOrgRoleState.deskPermissions
);

export const selectIsDeskPermissionsLoading = createSelector(
  [selectDomain],
  (newOrgRoleState) => newOrgRoleState.deskPermissionsLoading
);
