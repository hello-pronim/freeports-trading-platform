import Investor from "../../../../types/Investor";

export interface InvestorsState {
  investors: Investor[];
  loading: boolean;
  creating: boolean;
  deleting: boolean;
}
