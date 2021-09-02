/* eslint-disable no-param-reassign */
import { PayloadAction } from "@reduxjs/toolkit";

import { createSlice } from "../../../../util/@reduxjs/toolkit";
import {
  useInjectReducer,
  useInjectSaga,
} from "../../../../util/redux-injectors";
import Desk from "../../../../types/Desk";
import { desksSaga } from "./saga";
import { DesksState } from "./types";

export const initialState: DesksState = {
  desks: [],
  loading: false,
  creating: false,
  deleting: false,
};

const slice = createSlice({
  name: "desks",
  initialState,
  reducers: {
    getDesks(state) {
      state.loading = true;
      state.desks = [];
    },
    getDesksSuccess(state, action: PayloadAction<Desk[]>) {
      state.loading = false;
      state.desks = action.payload;
    },
    addDesk(
      state,
      action: PayloadAction<{ organizationId: string; desk: Desk }>
    ) {
      state.creating = true;
    },
    addDeskSuccess(state, action: PayloadAction<string>) {
      state.creating = false;
    },
    removeDesk(
      state,
      action: PayloadAction<{ organizationId: string; deskId: string }>
    ) {
      state.deleting = true;
    },
    removeDeskSuccess(state, action: PayloadAction<string>) {
      state.deleting = false;
    },
  },
});

export const { actions: desksActions, reducer } = slice;

export const useDesksSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer });
  useInjectSaga({ key: slice.name, saga: desksSaga });
  (window as any).action = slice.actions;
  return { actions: slice.actions };
};
