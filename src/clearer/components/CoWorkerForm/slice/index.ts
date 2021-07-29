/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-param-reassign */
import { PayloadAction } from "@reduxjs/toolkit";
import { PublicKeyDoc } from "../../../../types/User";
import { createSlice } from "../../../../util/@reduxjs/toolkit";
import {
  useInjectReducer,
  useInjectSaga,
} from "../../../../util/redux-injectors";
import { RoleType } from "../../Roles";
import { coWorkerFormSaga } from "./saga";
import { CoWorkerFormState } from "./types";

export const initialState: CoWorkerFormState = {
  roles: [],
  loading: false,
};

const slice = createSlice({
  name: "coWorkerForm",
  initialState,
  reducers: {
    getRoles(state) {
      state.loading = true;
      state.roles = [];
    },
    getRolesSuccess(state, action: PayloadAction<RoleType[]>) {
      state.loading = true;
      state.roles = action.payload;
    },
    addUserToVault(
      state,
      action: PayloadAction<{ userId: string; publicKey: PublicKeyDoc }>
    ) {
      state.loading = true;
    },
  },
});

export const { actions: coWorkActions, reducer } = slice;

export const useCoWorkerFormSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer });
  useInjectSaga({ key: slice.name, saga: coWorkerFormSaga });
  (window as any).action = slice.actions;
  return { actions: slice.actions };
};
