import { RoleType } from "../../Roles";

/* --- STATE --- */
export interface ClearerCoWorkerFormState {
  roles: RoleType[];
  loading: boolean;
  addingUserToVault: boolean;
  deletingUserFromVault: boolean;
}
