// [IMPORT NEW CONTAINERSTATE ABOVE] < Needed for generating containers seamlessly

import { AccountsState } from "../../clearer/components/NostroAccounts/slice/types";
import { AccountDetailState } from "../../clearer/components/NostroAccounts/Detail/slice/types";
import { ClearerCoWorkersState } from "../../clearer/components/CoWorker/slice/types";
import { ClearerCoWorkerFormState } from "../../clearer/components/CoWorkerForm/slice/types";
import { DesksState } from "../../organization/components/Desks/slice/types";
import { DeskDetailState } from "../../organization/components/Desks/Detail/slice/types";
import { InvestorsState } from "../../organization/components/Investors/slice/types";
import { InvestorDetailState } from "../../organization/components/Investors/Detail/slice/types";
import { TradesState } from "../../organization/components/Trades/slice/types";
import { TradeDetailState } from "../../organization/components/Trades/Detail/slice/types";
import { OrgRolesState } from "../../organization/components/Roles/slice/types";
import { NewOrgRoleState } from "../../organization/components/Roles/Add/slice/types";
import { OrgCoWorkersState } from "../../organization/components/CoWorker/slice/types";
import { OrgCoWorkerFormState } from "../../organization/components/CoWorkerForm/slice/types";
import { SnackbarState } from "../../components/Snackbar/slice/types";
import { ProfileState } from "../../components/Profile/slice/types";
import { GlobalState } from "../../slice/types";

/* 
  Because the redux-injectors injects your
   reducers asynchronously somewhere in your code
  You have to declare them here manually
  Properties are optional because they are injected when 
  the components are mounted sometime in your application's life. 
  So, not available always
*/
export interface RootState {
  accounts?: AccountsState;
  accountDetail?: AccountDetailState;
  clearerCoWorkers?: ClearerCoWorkersState;
  clearerCoWorkerForm: ClearerCoWorkerFormState;
  desks?: DesksState;
  deskDetail?: DeskDetailState;
  global?: GlobalState;
  investors?: InvestorsState;
  investorDetail?: InvestorDetailState;
  trades?: TradesState;
  tradeDetail?: TradeDetailState;
  orgRoles?: OrgRolesState;
  newOrgRole?: NewOrgRoleState;
  orgCoWorkers?: OrgCoWorkersState;
  orgCoWorkerForm: OrgCoWorkerFormState;
  auth?: any;
  profileForm?: ProfileState;
  snackbar: SnackbarState;
  // [INSERT NEW REDUCER KEY ABOVE] < Needed for
  // generating containers seamlessly
}
