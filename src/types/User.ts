import { PermissionAny } from "./Permissions";

export interface PublicKeyDoc {
  _id: string;
  name: string;
  key: string;
}
export interface RoleResponse {
  id: string;
  name: string;
  system: boolean;

  permissions?: PermissionAny[];
}

export default interface User {
  id?: string;

  nickname: string;

  email: string;

  phone: string;

  avatar: string;

  jobTitle: string;

  roles?: Array<{
    id: string;
    kind: string;
    effectiveDesks?: string[];
    desk?: string;
  }>;

  suspended: boolean;

  publicKeys: PublicKeyDoc[];

  vaultUserId?: string;

  organization?: string;

  hasPassword?: boolean;
}

export interface CurrentUser extends Omit<User, "roles"> {
  roles: RoleResponse[];
}
