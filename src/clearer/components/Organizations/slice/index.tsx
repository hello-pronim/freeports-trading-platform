/* eslint-disable no-param-reassign */
import { PayloadAction } from "@reduxjs/toolkit";

import { createSlice } from "../../../../util/@reduxjs/toolkit";
import {
  useInjectReducer,
  useInjectSaga,
} from "../../../../util/redux-injectors";
import Organization from "../../../../types/Organization";
import { organizationsSaga } from "./saga";
import { OrganizationsState } from "./types";

export const initialState: OrganizationsState = {
  organizations: [],
  loading: false,
};

const slice = createSlice({
  name: "organizations",
  initialState,
  reducers: {
    getOrganizations(state) {
      state.loading = true;
      state.organizations = [];
    },
    getOrganizationsSuccess(state, action: PayloadAction<Organization[]>) {
      state.loading = false;
      state.organizations = action.payload;
    },
    addOrganization(state, action: PayloadAction<Organization>) {
      state.loading = true;
    },
    addOrganizationSuccess(state, action: PayloadAction<string>) {
      state.loading = false;
    },
  },
});

export const { actions: organizationsActions, reducer } = slice;

export const useOrganizationsSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer });
  useInjectSaga({ key: slice.name, saga: organizationsSaga });
  (window as any).action = slice.actions;
  return { actions: slice.actions };
};
