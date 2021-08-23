import { VaultRequestDto } from "../../../services/vaultService";

/* --- STATE --- */
export interface VaultRequestState {
  request: VaultRequestDto;
  response: any;
  loading: boolean;
  error: any;
}
