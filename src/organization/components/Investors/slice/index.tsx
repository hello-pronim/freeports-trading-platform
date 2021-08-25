/* eslint-disable no-param-reassign */
import { PayloadAction } from "@reduxjs/toolkit";

import { createSlice } from "../../../../util/@reduxjs/toolkit";
import {
  useInjectReducer,
  useInjectSaga,
} from "../../../../util/redux-injectors";
import Investor from "../../../../types/Investor";
import { investorsSaga } from "./saga";
import { InvestorsState } from "./types";

export const initialState: InvestorsState = {
  investors: [],
  loading: false,
  creating: false,
  deleting: false,
};

const slice = createSlice({
  name: "investors",
  initialState,
  reducers: {
    getInvestors(state, action: PayloadAction) {
      state.loading = true;
      state.investors = [];
    },
    getInvestorsSuccess(state, action: PayloadAction<Investor[]>) {
      state.loading = false;
      state.investors = action.payload;
    },
    addInvestor(
      state,
      action: PayloadAction<{
        organizationId: string;
        deskId: string;
        investor: Investor;
      }>
    ) {
      state.creating = true;
    },
    addInvestorSuccess(state, action: PayloadAction<string>) {
      state.creating = false;
    },
    removeInvestor(
      state,
      action: PayloadAction<{
        organizationId: string;
        deskId: string;
        investorId: string;
      }>
    ) {
      state.deleting = true;
    },
    removeInvestorSuccess(state, action: PayloadAction<string>) {
      state.deleting = false;
    },
  },
});

export const { actions: investorsActions, reducer } = slice;

export const useInvestorsSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer });
  useInjectSaga({ key: slice.name, saga: investorsSaga });
  (window as any).action = slice.actions;
  return { actions: slice.actions };
};
