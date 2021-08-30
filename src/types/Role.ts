import Desk from "./Desk";

export default interface Role {
  id?: string;

  name: string;

  permissions: Array<string>;

  kind?: string;

  desk?: Desk;

  effectiveDesks?: string[];

  vaultGroupId?: string;
}
