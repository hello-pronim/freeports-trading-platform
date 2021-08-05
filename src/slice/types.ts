import { CurrentUser } from "../types/User";

/* --- STATE --- */
export interface GlobalState {
  user: CurrentUser | undefined;
  loading: boolean;
  theme: string;
  error: { errorType: string; message: string } | undefined;
  keyList: Array<any>
}
