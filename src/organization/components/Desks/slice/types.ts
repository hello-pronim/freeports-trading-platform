import Desk from "../../../../types/Desk";

export interface DesksState {
  desks: Desk[];
  loading: boolean;
  creating: boolean;
  deleting: boolean;
}
