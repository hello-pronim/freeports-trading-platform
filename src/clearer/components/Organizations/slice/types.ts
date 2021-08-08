import Organization from "../../../../types/Organization";

export interface OrganizationsState {
  organizations: Organization[];
  loading: boolean;
}
