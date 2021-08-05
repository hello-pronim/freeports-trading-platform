/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-param-reassign */
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
  theme: "light",
  error: { errorType: "", message: "" },
  keyList: []
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
    setTheme(state, action: PayloadAction<string>) {
      state.theme = action.payload;
    },
    setError(state, action: PayloadAction<ErrorResponseType>) {
      state.loading = false;
      state.error = action.payload;
    },
    setKeyList(state, action: PayloadAction<any>) {
      state.keyList = action.payload;
    },
  },
});

export const { actions: globalActions, reducer } = slice;

export const useGlobalSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer });
  useInjectSaga({ key: slice.name, saga: globalSaga });

  return { actions: slice.actions };
};
