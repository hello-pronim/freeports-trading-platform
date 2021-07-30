export default interface Role {
  id?: string;

  name: string;

  permissions: Array<string>;
}
