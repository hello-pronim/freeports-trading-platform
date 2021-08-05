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
  publicKeys: [],
};
export const initialState: OrgCoWorkersState = {
  coWorkers: [],
  selectedCoWorker: defaultCoWorker,
  loading: false,
  formLoading: false,
  suspendStateLoading: false,
};

const slice = createSlice({
  name: "orgCoWorkers",
  initialState,
  reducers: {
    getCoWorkers(
      state,
      action?: PayloadAction<{ organizationId: string; search?: string }>
    ) {
      state.loading = true;
      state.coWorkers = [];
    },
    getCoWorkersSuccess(state, action: PayloadAction<User[]>) {
      state.loading = false;
      state.coWorkers = action.payload;
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    createCoWorker(
      state,
      action: PayloadAction<{ organizationId: string; user: User }>
    ) {
      state.formLoading = true;
    },
    createCoWorkerSuccess(
      state,
      action: PayloadAction<ResourceCreatedResponse>
    ) {
      state.formLoading = false;
    },
    updateCoWorker(
      state,
      action: PayloadAction<{
        organizationId: string;
        id: string;
        updates: Partial<User>;
      }>
    ) {
      state.formLoading = true;
    },
    updateCoWorkerSuccess(state, action: any) {
      state.formLoading = false;
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
    resumeCoWorker(state, action: PayloadAction<{ id: string }>) {
      state.suspendStateLoading = true;
    },
    resumeCoWorkerSuccess(state) {
      state.suspendStateLoading = false;
    },
    sendCoWorkerResetPasswordEmail(
      state,
      action: PayloadAction<{ id: string }>
    ) {
      state.formLoading = true;
    },
    sendCoWorkerResetPasswordEmailSuccess(state) {
      state.formLoading = false;
    },
  },
});

export const { actions: coWorkActions, reducer } = slice;

export const useCoWorkersSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer });
  useInjectSaga({ key: slice.name, saga: coWorkersSaga });

  return { actions: slice.actions };
};
