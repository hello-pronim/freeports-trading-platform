import Desk from "../../../../../types/Desk";

export interface DeskDetailState {
  selectedDesk: Desk;
  loading: boolean;
  formSubmitting: boolean;
}
