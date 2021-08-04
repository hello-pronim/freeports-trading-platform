import { createSelector } from "@reduxjs/toolkit";

import { initialState } from ".";
import { RootState } from "../../../../util/types/RootState";

// First select the relevant part from the state
const selectDomain = (state: RootState) => state.orgCoWorkers || initialState;

// eslint-disable-next-line import/prefer-default-export
export const selectCoWorkers = createSelector(
  [selectDomain],
  (orgCoWorkerState) => orgCoWorkerState.coWorkers
);

export const selectIsFormLoading = createSelector(
  [selectDomain],
  (orgCoWorkerState) => orgCoWorkerState.formLoading
);
export const selectIsLoading = createSelector(
  [selectDomain],
  (orgCoWorkerState) => orgCoWorkerState.loading
);

export const selectSelectedCoWorker = createSelector(
  [selectDomain],
  (orgCoWorkerState) => orgCoWorkerState.selectedCoWorker
);
export const selectSuspendStateLoading = createSelector(
  [selectDomain],
  (orgCoWorkerState) => orgCoWorkerState.suspendStateLoading
);
