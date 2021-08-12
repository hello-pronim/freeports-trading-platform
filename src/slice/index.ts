/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-param-reassign */
import Lockr from "lockr";
import { PayloadAction } from "@reduxjs/toolkit";
import { CurrentUser } from "../types/User";
import { createSlice } from "../util/@reduxjs/toolkit";
import { useInjectReducer, useInjectSaga } from "../util/redux-injectors";
import { globalSaga } from "./saga";
import { GlobalState } from "./types";

interface ErrorResponseType {
  errorType: string;
  message: string;
}

export const initialState: GlobalState = {
  user: undefined,
  loading: false,
  theme: Lockr.get("THEME") ? Lockr.get("THEME") : "light",
  error: { errorType: "", message: "" },
  keyList: [],
  remoteKey: null,
};

const slice = createSlice({
  name: "global",
  initialState,
  reducers: {
    getCurrentClearerUser(state) {
      state.loading = true;
    },
    getCurrentOrganizationUser(state) {
      state.loading = true;
    },
    setCurrentUser(state, action: PayloadAction<CurrentUser>) {
      state.user = action.payload;
      state.loading = false;
    },
    clearError(state) {
      state.error = undefined;
    },
    toggleTheme(state) {
      state.loading = true;
      state.theme = state.theme === "light" ? "dark" : "light";
      Lockr.set("THEME", state.theme);
    },
    setError(state, action: PayloadAction<ErrorResponseType>) {
      state.loading = false;
      state.error = action.payload;
    },
    setKeyList(state, action: PayloadAction<any>) {
      state.keyList = action.payload;
    },
    setRemoteKey(state, action: PayloadAction<any>) {
      state.remoteKey = action.payload;
    },
    setCertification(state, action: PayloadAction<any>) {
      state.keyList = action.payload.keyList;
      state.remoteKey = action.payload.remoteKey;
    },
  },
});

export const { actions: globalActions, reducer } = slice;

export const useGlobalSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer });
  useInjectSaga({ key: slice.name, saga: globalSaga });

  return { actions: slice.actions };
};
