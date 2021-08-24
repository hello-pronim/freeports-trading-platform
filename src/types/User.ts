import { PermissionAny } from "./Permissions";

export interface PublicKeyDoc {
  _id: string;
  key: string;
  status: string;
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
    vaultGroupId?: string;
  }>;

  suspended: boolean;

  publicKey?: PublicKeyDoc;

  vaultUserId?: string;

  organization?: string;

  hasPassword?: boolean;
}

export interface CurrentUser extends Omit<User, "roles"> {
  roles: RoleResponse[];
}
