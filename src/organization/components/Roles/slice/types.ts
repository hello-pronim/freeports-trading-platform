import Role from "../../../../types/Role";
import Permission from "../../../../types/Permission";

export interface OrgRolesState {
  orgRoles: Role[];
  multiDeskRoles: Role[];
  deskRoles: Role[];
  orgPermissions: Permission[];
  multiDeskPermissions: Permission[];
  deskPermissions: Permission[];
  orgRolesLoading: boolean;
  orgRoleDeleting: boolean;
  multiDeskRolesLoading: boolean;
  multiDeskRoleDeleting: boolean;
  deskRolesLoading: boolean;
  deskRoleDeleting: boolean;
  orgPermissionsLoading: boolean;
  multiDeskPermissionsLoading: boolean;
  deskPermissionsLoading: boolean;
  updating: boolean;
  deleting: boolean;
}
