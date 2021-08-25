import Role from "../../../../types/Role";
import DeskRole from "../../../../types/DeskRole";
import Permission from "../../../../types/Permission";

export interface OrgRolesState {
  orgRoles: Role[];
  multiDeskRoles: Role[];
  deskRoles: DeskRole[];
  orgPermissions: Permission[];
  multiDeskPermissions: Permission[];
  deskPermissions: Permission[];
  orgRolesLoading: boolean;
  orgRoleUpdating: boolean;
  orgRoleDeleting: boolean;
  multiDeskRolesLoading: boolean;
  multiDeskRoleUpdating: boolean;
  multiDeskRoleDeleting: boolean;
  deskRolesLoading: boolean;
  deskRoleUpdating: boolean;
  deskRoleDeleting: boolean;
  orgPermissionsLoading: boolean;
  multiDeskPermissionsLoading: boolean;
  deskPermissionsLoading: boolean;
}
