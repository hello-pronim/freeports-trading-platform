import Role from "../../../../../types/Role";
import Permission from "../../../../../types/Permission";

export interface NewOrgRoleState {
  orgRoleCreating: boolean;
  multiDeskRoleCreating: boolean;
  orgPermissions: Permission[];
  multiDeskPermissions: Permission[];
  deskPermissions: Permission[];
  orgPermissionsLoading: boolean;
  multiDeskPermissionsLoading: boolean;
  deskPermissionsLoading: boolean;
}
