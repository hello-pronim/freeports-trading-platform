import Desk from "./Desk";

export default interface DeskRole {
  id?: string;

  name: string;

  desk: Desk;

  permissions: Array<string>;

  vaultGroupId?: string;
}
