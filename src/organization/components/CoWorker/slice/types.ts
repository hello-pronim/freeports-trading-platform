import User from "../../../../types/User";

/* --- STATE --- */
export interface OrgCoWorkersState {
  coWorkers: User[];
  selectedCoWorker: User;
  coWorkersLoading: boolean;
  formLoading: boolean;
  formSubmitting: boolean;
  suspendStateLoading: boolean;
  passwordResetting: boolean;
}
