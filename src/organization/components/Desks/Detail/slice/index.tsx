/* eslint-disable no-param-reassign */
import { PayloadAction } from "@reduxjs/toolkit";

import { createSlice } from "../../../../../util/@reduxjs/toolkit";
import {
  useInjectReducer,
  useInjectSaga,
} from "../../../../../util/redux-injectors";
import Desk, { TradeLevel } from "../../../../../types/Desk";
import { deskDetailSaga } from "./saga";
import { DeskDetailState } from "./types";

const defaultDesk = {
  id: "",
  name: "",
  createdAt: "",
};

export const initialState: DeskDetailState = {
  selectedDesk: defaultDesk,
  loading: false,
  formSubmitting: false,
};

const slice = createSlice({
  name: "deskDetail",
  initialState,
  reducers: {
    getDesk(
      state,
      action: PayloadAction<{ organizationId: string; deskId: string }>
    ) {
      state.loading = true;
      state.selectedDesk = defaultDesk;
    },
    getDeskSuccess(state, action: PayloadAction<Desk>) {
      state.loading = false;
      state.selectedDesk = action.payload;
    },
    getDeskFailed(state) {
      state.loading = false;
    },
    saveTradeLevels(
      state,
      action: PayloadAction<{
        organizationId: string;
        deskId: string;
        tradeLevels: TradeLevel[];
      }>
    ) {
      state.formSubmitting = true;
    },
    saveTradeLevelsSuccess(state) {
      state.formSubmitting = false;
    },
    saveTradeLevelsFailed(state) {
      state.formSubmitting = false;
    },
  },
});

export const { actions: deskDetailActions, reducer } = slice;

export const useDeskDetailSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer });
  useInjectSaga({ key: slice.name, saga: deskDetailSaga });
  (window as any).action = slice.actions;
  return { actions: slice.actions };
};
