export default interface Permission {
  name: string;
  description?: string;
  permissions: Array<{
    code: string;
    name: string;
    description?: string;
    dependsOn?: string[];
  }>;
}
