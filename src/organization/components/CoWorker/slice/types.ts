import User from "../../../../types/User";

/* --- STATE --- */
export interface OrgCoWorkersState {
  coWorkers: User[];
  selectedCoWorker: User;
  loading: boolean;
  formLoading: boolean;
  suspendStateLoading: boolean;
}
