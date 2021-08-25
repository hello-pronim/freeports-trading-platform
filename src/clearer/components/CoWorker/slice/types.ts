import User from "../../../../types/User";

/* --- STATE --- */
export interface ClearerCoWorkersState {
  coWorkers: User[];
  selectedCoWorker: User;
  coWorkersLoading: boolean;
  formLoading: boolean;
  submitting: boolean;
  suspendStateLoading: boolean;
  passwordResetting: boolean;
  OTPResetting: boolean;
}
