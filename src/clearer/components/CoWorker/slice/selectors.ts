import { createSelector } from "@reduxjs/toolkit";

import { initialState } from ".";
import { RootState } from "../../../../util/types/RootState";

// First select the relevant part from the state
const selectDomain = (state: RootState) =>
  state.clearerCoWorkers || initialState;

// eslint-disable-next-line import/prefer-default-export
export const selectCoWorkers = createSelector(
  [selectDomain],
  (coWorkerState) => coWorkerState.coWorkers
);

export const selectIsCoWorkersLoading = createSelector(
  [selectDomain],
  (coWorkerState) => coWorkerState.coWorkersLoading
);

export const selectSelectedCoWorker = createSelector(
  [selectDomain],
  (coWorkerState) => coWorkerState.selectedCoWorker
);

export const selectIsFormLoading = createSelector(
  [selectDomain],
  (coWorkerState) => coWorkerState.formLoading
);

export const selectIsFormSubmitting = createSelector(
  [selectDomain],
  (coWorkerState) => coWorkerState.submitting
);

export const selectIsSuspendStateLoading = createSelector(
  [selectDomain],
  (coWorkerState) => coWorkerState.suspendStateLoading
);

export const selectIsPasswordResetting = createSelector(
  [selectDomain],
  (coWorkerState) => coWorkerState.passwordResetting
);

export const selectIsOTPResetting = createSelector(
  [selectDomain],
  (coWorkerState) => coWorkerState.OTPResetting
);
