/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-param-reassign */
import { PayloadAction } from "@reduxjs/toolkit";
import { Method, VaultRequestDto } from "../../../services/vaultService";

import { createSlice } from "../../../util/@reduxjs/toolkit";
import { SavedKeyObject } from "../../../util/keyStore/keystore";
import { useInjectReducer, useInjectSaga } from "../../../util/redux-injectors";
import { profileSaga } from "./saga";
import { VaultRequestState } from "./types";

export const initialState: VaultRequestState = {
  request: {
    method: Method.GET,
    path: "",
    body: {},
    headers: {},
  },
  response: null,
  loading: false,
  error: null,
};

const slice = createSlice({
  name: "vaultRequest",
  initialState,
  reducers: {
    sendRequest(state, action: PayloadAction<VaultRequestDto>) {
      state.loading = true;
      state.error = null;

      state.response = null;
    },
    requestSuccess(state, action: PayloadAction<any>) {
      state.loading = false;
      state.error = null;

      state.response = action.payload;
    },
    requestFailed(state, action: PayloadAction<any>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { actions: vaultRequestActions, reducer } = slice;

export const useVaultRequestSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer });
  useInjectSaga({ key: slice.name, saga: profileSaga });
  (window as any).action = slice.actions;
  return { actions: slice.actions };
};
