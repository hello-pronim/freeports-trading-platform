/* eslint-disable no-param-reassign */
import { PayloadAction } from "@reduxjs/toolkit";

import { createSlice } from "../../../../util/@reduxjs/toolkit";
import {
  useInjectReducer,
  useInjectSaga,
} from "../../../../util/redux-injectors";
import Clearer from "../../../../types/Clearer";
import { clearerSettingsSaga } from "./saga";
import { ClearerSettingsState } from "./types";

const defaultClearerSettings = {
  id: "",
  name: "",
  street: "",
  street2: "",
  zip: "",
  city: "",
  country: "",
  logo: "",
  vaultOrganizationId: "",
};

export const initialState: ClearerSettingsState = {
  clearerSettings: defaultClearerSettings,
  formLoading: false,
  formSubmitting: false,
};

const slice = createSlice({
  name: "clearerSettings",
  initialState,
  reducers: {
    retrieveClearerSettings(state) {
      state.formLoading = true;
    },
    retrieveClearerSettingsSuccess(state, action: PayloadAction<Clearer>) {
      state.formLoading = false;
      state.clearerSettings = action.payload;
    },
    retrieveClearerSettingsFailed(state) {
      state.formLoading = false;
    },
    saveClearerSettings(state, action: PayloadAction<Clearer>) {
      state.formSubmitting = true;
    },
    saveClearerSettingsSuccess(state) {
      state.formSubmitting = false;
    },
    saveClearerSettingsFailed(state) {
      state.formSubmitting = false;
    },
  },
});

export const { actions: clearerSettingsActions, reducer } = slice;

export const useClearerSettingsSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer });
  useInjectSaga({ key: slice.name, saga: clearerSettingsSaga });
  (window as any).action = slice.actions;
  return { actions: slice.actions };
};
