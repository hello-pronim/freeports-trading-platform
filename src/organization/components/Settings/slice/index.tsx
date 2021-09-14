/* eslint-disable no-param-reassign */
import { PayloadAction } from "@reduxjs/toolkit";

import { createSlice } from "../../../../util/@reduxjs/toolkit";
import {
  useInjectReducer,
  useInjectSaga,
} from "../../../../util/redux-injectors";
import { TradeLevel } from "../../../../types/Organization";
import { orgSettingsSaga } from "./saga";
import { OrgSettingsState } from "./types";

export const initialState: OrgSettingsState = {
  settingsLoading: false,
  tradeLevelsUpdating: false,
  accountsTrusting: false,
};

const slice = createSlice({
  name: "orgSettings",
  initialState,
  reducers: {
    trustAccounts(
      state,
      action: PayloadAction<{
        organizationId: string;
        address: string[];
      }>
    ) {
      state.accountsTrusting = true;
    },
    trustAccountsSuccess(state) {
      state.accountsTrusting = false;
    },
    trustAccountsFailed(state) {
      state.accountsTrusting = false;
    },
    saveTradeLevels(
      state,
      action: PayloadAction<{
        organizationId: string;
        tradeLevels: TradeLevel[];
      }>
    ) {
      state.tradeLevelsUpdating = true;
    },
    saveTradeLevelsSuccess(state) {
      state.tradeLevelsUpdating = false;
    },
    saveTradeLevelsFailed(state) {
      state.tradeLevelsUpdating = false;
    },
  },
});

export const { actions: orgSettingsActions, reducer } = slice;

export const useOrgSettingsSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer });
  useInjectSaga({ key: slice.name, saga: orgSettingsSaga });
  (window as any).action = slice.actions;
  return { actions: slice.actions };
};
