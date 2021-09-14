export interface TradeLevel {
  currency: string;
  small: string;
  medium: string;
  mediumSplitBy: string;
  inherited: string;
}
export default interface Desk {
  id?: string;

  name: string;

  investors?: number;

  coworkers?: number;

  value?: number;

  tradeLevels?: TradeLevel[];

  createdAt?: string;
}
