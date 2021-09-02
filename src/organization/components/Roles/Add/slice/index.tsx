/* eslint-disable no-param-reassign */
import { PayloadAction } from "@reduxjs/toolkit";

import { createSlice } from "../../../../../util/@reduxjs/toolkit";
import {
  useInjectReducer,
  useInjectSaga,
} from "../../../../../util/redux-injectors";
import Role from "../../../../../types/Role";
import Permission from "../../../../../types/Permission";
import { newOrgRoleSaga } from "./saga";
import { NewOrgRoleState } from "./types";

export const initialState: NewOrgRoleState = {
  orgRoleCreating: false,
  multiDeskRoleCreating: false,
  deskRoleCreating: false,
  orgPermissions: [],
  multiDeskPermissions: [],
  deskPermissions: [],
  orgPermissionsLoading: false,
  multiDeskPermissionsLoading: false,
  deskPermissionsLoading: false,
};

const slice = createSlice({
  name: "newOrgRole",
  initialState,
  reducers: {
    addOrgRole(
      state,
      action: PayloadAction<{
        organizationId: string;
        role: Role;
        vaultUserId: string;
      }>
    ) {
      state.orgRoleCreating = true;
    },
    addOrgRoleSuccess(state, action: PayloadAction<string>) {
      state.orgRoleCreating = false;
    },
    addOrgRoleFailed(state) {
      state.orgRoleCreating = false;
    },
    addMultiDeskRole(
      state,
      action: PayloadAction<{
        organizationId: string;
        role: Role;
        vaultUserId: string;
      }>
    ) {
      state.multiDeskRoleCreating = true;
    },
    addMultiDeskRoleSuccess(state, action: PayloadAction<string>) {
      state.multiDeskRoleCreating = false;
    },
    addMultiDeskRoleFailed(state) {
      state.multiDeskRoleCreating = false;
    },
    addDeskRole(
      state,
      action: PayloadAction<{
        organizationId: string;
        deskId: string;
        role: Role;
        vaultUserId: string;
      }>
    ) {
      state.deskRoleCreating = true;
    },
    addDeskRoleSuccess(state, action: PayloadAction<string>) {
      state.deskRoleCreating = false;
    },
    addDeskRoleFailed(state) {
      state.deskRoleCreating = false;
    },
    getOrgPermissions(state, action: PayloadAction<string>) {
      state.orgPermissionsLoading = true;
      state.orgPermissions = [];
    },
    getOrgPermissionsSuccess(state, action: PayloadAction<Permission[]>) {
      state.orgPermissionsLoading = false;
      state.orgPermissions = action.payload;
    },
    getMultiDeskPermissions(state, action: PayloadAction<string>) {
      state.multiDeskPermissionsLoading = true;
      state.multiDeskPermissions = [];
    },
    getMultiDeskPermissionsSuccess(state, action: PayloadAction<Permission[]>) {
      state.multiDeskPermissionsLoading = false;
      state.multiDeskPermissions = action.payload;
    },
    getDeskPermissions(state, action: PayloadAction<string>) {
      state.deskPermissionsLoading = true;
      state.deskPermissions = [];
    },
    getDeskPermissionsSuccess(state, action: PayloadAction<Permission[]>) {
      state.deskPermissionsLoading = false;
      state.deskPermissions = action.payload;
    },
  },
});

export const { actions: newOrgRoleActions, reducer } = slice;

export const useNewOrgRoleSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer });
  useInjectSaga({ key: slice.name, saga: newOrgRoleSaga });
  (window as any).action = slice.actions;
  return { actions: slice.actions };
};
