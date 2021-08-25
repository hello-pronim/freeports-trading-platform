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
import { ClearerCoWorkersState } from "./types";

const defaultCoWorker = {
  roles: [],
  nickname: "",
  phone: "",
  email: "",
  avatar: "",
  jobTitle: "",
  suspended: false,
};
export const initialState: ClearerCoWorkersState = {
  coWorkers: [],
  selectedCoWorker: defaultCoWorker,
  coWorkersLoading: false,
  formLoading: false,
  submitting: false,
  suspendStateLoading: false,
  passwordResetting: false,
  OTPResetting: false,
};

const slice = createSlice({
  name: "clearerCoWorkers",
  initialState,
  reducers: {
    getCoWorkers(state, action?: PayloadAction<{ search?: string }>) {
      state.coWorkersLoading = true;
      state.coWorkers = [];
    },
    getCoWorkersSuccess(state, action: PayloadAction<User[]>) {
      state.coWorkersLoading = false;
      state.coWorkers = action.payload;
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    createCoWorker(state, action: PayloadAction<{ user: User }>) {
      state.submitting = true;
    },
    createCoWorkerSuccess(
      state,
      action: PayloadAction<ResourceCreatedResponse>
    ) {
      state.submitting = false;
    },
    createCoWorkerError(state) {
      state.submitting = false;
    },
    updateCoWorker(
      state,
      action: PayloadAction<{
        updates: Partial<User>;
        id: string;
        vaultUserId: string;
        oldVaultGroup: string[];
        newVaultGroup: string[];
      }>
    ) {
      state.submitting = true;
    },
    updateCoWorkerSuccess(state, action: any) {
      state.submitting = false;
    },
    updateCoWorkerError(state) {
      state.submitting = false;
    },
    selectCoWorker(state, action: PayloadAction<User>) {
      state.formLoading = true;
    },
    selectCoWorkerSuccess(state, action: PayloadAction<User>) {
      state.selectedCoWorker = action.payload;
      state.formLoading = false;
    },
    suspendCoWorker(state, action: PayloadAction<{ id: string }>) {
      state.suspendStateLoading = true;
    },
    suspendCoWorkerSuccess(state) {
      state.suspendStateLoading = false;
    },
    suspendCoWorkerError(state) {
      state.suspendStateLoading = false;
    },
    resumeCoWorker(state, action: PayloadAction<{ id: string }>) {
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
    resetOTP(state, action: PayloadAction<{ id: string }>) {
      state.OTPResetting = true;
    },
    resetOTPSuccess(state) {
      state.OTPResetting = false;
    },
    resetOTPError(state) {
      state.OTPResetting = false;
    },
  },
});

export const { actions: coWorkActions, reducer } = slice;

export const useCoWorkersSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer });
  useInjectSaga({ key: slice.name, saga: coWorkersSaga });

  return { actions: slice.actions };
};
