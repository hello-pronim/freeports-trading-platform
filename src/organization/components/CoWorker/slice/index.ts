/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-param-reassign */
import { PayloadAction } from "@reduxjs/toolkit";
import { ResourceCreatedResponse } from "../../../../types/ResourceCreatedResponse";
import User from "../../../../types/User";
import { createSlice } from "../../../../util/@reduxjs/toolkit";
import {
  useInjectReducer,
  useInjectSaga,
} from "../../../../util/redux-injectors";
import { coWorkersSaga } from "./saga";
import { OrgCoWorkersState } from "./types";

const defaultCoWorker = {
  roles: [],
  nickname: "",
  phone: "",
  email: "",
  avatar: "",
  jobTitle: "",
  suspended: false,
};
export const initialState: OrgCoWorkersState = {
  coWorkers: [],
  selectedCoWorker: defaultCoWorker,
  coWorkersLoading: false,
  formLoading: false,
  formSubmitting: false,
  suspendStateLoading: false,
  passwordResetting: false,
};

const slice = createSlice({
  name: "orgCoWorkers",
  initialState,
  reducers: {
    getCoWorkers(
      state,
      action?: PayloadAction<{ organizationId: string; search?: string }>
    ) {
      state.coWorkersLoading = true;
      state.coWorkers = [];
    },
    getCoWorkersSuccess(state, action: PayloadAction<User[]>) {
      state.coWorkersLoading = false;
      state.coWorkers = action.payload;
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    createCoWorker(
      state,
      action: PayloadAction<{ organizationId: string; user: User }>
    ) {
      state.formSubmitting = true;
    },
    createCoWorkerSuccess(
      state,
      action: PayloadAction<ResourceCreatedResponse>
    ) {
      state.formSubmitting = false;
    },
    createCoWorkerError(state) {
      state.formSubmitting = false;
    },
    updateCoWorker(
      state,
      action: PayloadAction<{
        organizationId: string;
        id: string;
        updates: Partial<User>;
        vaultUserId: string;
        oldVaultGroup: string[];
        newVaultGroup: string[];
      }>
    ) {
      state.formSubmitting = true;
    },
    updateCoWorkerSuccess(state, action: any) {
      state.formSubmitting = false;
    },
    updateCoWorkerError(state) {
      state.formSubmitting = false;
    },
    selectCoWorker(state, action: PayloadAction<User>) {
      state.formLoading = true;
    },
    selectCoWorkerSuccess(state, action: PayloadAction<User>) {
      state.selectedCoWorker = action.payload;
      state.formLoading = false;
    },
    suspendCoWorker(
      state,
      action: PayloadAction<{ organizationId: string; id: string }>
    ) {
      state.suspendStateLoading = true;
    },
    suspendCoWorkerSuccess(state) {
      state.suspendStateLoading = false;
    },
    suspendCoWorkerError(state) {
      state.suspendStateLoading = false;
    },
    resumeCoWorker(
      state,
      action: PayloadAction<{ organizationId: string; id: string }>
    ) {
      state.suspendStateLoading = true;
    },
    resumeCoWorkerSuccess(state) {
      state.suspendStateLoading = false;
    },
    resumeCoWorkerError(state) {
      state.suspendStateLoading = false;
    },
    sendCoWorkerResetPasswordEmail(
      state,
      action: PayloadAction<{ id: string }>
    ) {
      state.passwordResetting = true;
    },
    sendCoWorkerResetPasswordEmailSuccess(state) {
      state.passwordResetting = false;
    },
    sendCoWorkerResetPasswordEmailError(state) {
      state.passwordResetting = false;
    },
  },
});

export const { actions: coWorkActions, reducer } = slice;

export const useCoWorkersSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer });
  useInjectSaga({ key: slice.name, saga: coWorkersSaga });

  return { actions: slice.actions };
};
