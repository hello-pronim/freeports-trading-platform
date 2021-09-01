/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-param-reassign */
import { PayloadAction } from "@reduxjs/toolkit";
import { PublicKeyDoc } from "../../../../types/User";
import { createSlice } from "../../../../util/@reduxjs/toolkit";
import {
  useInjectReducer,
  useInjectSaga,
} from "../../../../util/redux-injectors";
import Role from "../../../../types/Role";
import { coWorkerFormSaga } from "./saga";
import { OrgCoWorkerFormState } from "./types";

export const initialState: OrgCoWorkerFormState = {
  orgRoles: [],
  multiDeskRoles: [],
  deskRoles: [],
  loading: false,
  addingUserToVault: false,
  deletingUserFromVault: false,
};

const slice = createSlice({
  name: "orgCoWorkerForm",
  initialState,
  reducers: {
    getOrgRoles(state, action: PayloadAction<string>) {
      state.loading = true;
      state.orgRoles = [];
    },
    getOrgRolesSuccess(state, action: PayloadAction<Role[]>) {
      state.loading = false;
      state.orgRoles = action.payload;
    },
    getMultiDeskRoles(state, action: PayloadAction<string>) {
      state.loading = true;
      state.multiDeskRoles = [];
    },
    getMultiDeskRolesSuccess(state, action: PayloadAction<Role[]>) {
      state.loading = false;
      state.multiDeskRoles = action.payload;
    },
    getDeskRoles(state, action: PayloadAction<string>) {
      state.loading = true;
      state.deskRoles = [];
    },
    getDeskRolesSuccess(state, action: PayloadAction<Role[]>) {
      state.loading = false;
      state.deskRoles = action.payload;
    },
    addUserToVault(
      state,
      action: PayloadAction<{
        organizationId: string;
        userId: string;
        publicKey: PublicKeyDoc;
      }>
    ) {
      state.addingUserToVault = true;
    },
    addUserToVaultSuccess(state) {
      state.addingUserToVault = false;
    },
    removeUserFromVault(
      state,
      action: PayloadAction<{ userVaultId: string; userId: string }>
    ) {
      state.deletingUserFromVault = true;
    },
    removeUserFromVaultSuccess(state) {
      state.deletingUserFromVault = false;
    },
  },
});

export const { actions: coWorkActions, reducer } = slice;

export const useCoWorkerFormSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer });
  useInjectSaga({ key: slice.name, saga: coWorkerFormSaga });
  (window as any).action = slice.actions;
  return { actions: slice.actions };
};
