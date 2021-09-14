export interface TradeLevel {
  currency: string;
  small: string;
  medium: string;
  mediumSplitBy: string;
}
export default interface Organization {
  id?: string;

  name: string;

  street?: string;

  street2?: string;

  zip?: string;

  city?: string;

  country?: string;

  logo?: string;

  vaultOrganizationId?: string;

  vaultRequest?: {
    method: string;
    path: string;
    body: any;
    signature: string;
    headers: {
      signature: string;
      authorization: string;
    };
  };

  tradeLevels?: TradeLevel[];

  commissionOrganization?: string;

  commissionClearer?: string;

  userActive?: number;

  userSuspended?: number;

  createdAt?: string;
}
