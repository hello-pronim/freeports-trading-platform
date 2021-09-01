import Role from "../../../../types/Role";

/* --- STATE --- */
export interface OrgCoWorkerFormState {
  orgRoles: Role[];
  multiDeskRoles: Role[];
  deskRoles: Role[];
  loading: boolean;
  addingUserToVault: boolean;
  deletingUserFromVault: boolean;
}
