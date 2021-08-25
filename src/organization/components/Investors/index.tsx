/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { useEffect, useState } from "react";
import Lockr from "lockr";
import { Link } from "react-router-dom";
import { Form } from "react-final-form";
import arrayMutators from "final-form-arrays";
import { TextField as MuiTextField, Select as MuiSelect } from "mui-rff";
import { useSelector, useDispatch } from "react-redux";
import {
  Button,
  CircularProgress,
  Container,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  Icon,
  IconButton,
  makeStyles,
  MenuItem,
  Select,
  Theme,
  Typography,
} from "@material-ui/core";
import MaterialTable from "material-table";

import { useInvestorsSlice } from "./slice";
import { useInvestorDetailSlice } from "./Detail/slice";
import { useDesksSlice } from "../Desks/slice";
import {
  selectInvestors,
  selectIsInvestorsLoading,
  selectIsInvestorCreating,
} from "./slice/selectors";
import { selectIsTradeRequestCreating } from "./Detail/slice/selectors";
import { selectDesks } from "../Desks/slice/selectors";
import Loader from "../../../components/Loader";
import { useOrganization } from "../../../hooks";

interface investorType {
  deskId: string;
  name: string;
}
interface deskType {
  id?: string;
  name: string;
}
interface tradeType {
  accountFrom: string;
  accountTo: string;
  type: string;
  status?: string;
  quantity: string;
  limitPrice: string;
  limitTime: string;
  currencyFrom?: string;
  currencyTo?: string;
}
interface accountType {
  currency: string;
  iban: string;
  account: string;
  balance?: number;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    addButton: {
      // color: theme.palette.primary.main,
      fontWeight: "bold",
      padding: 0,
    },
    currencyDropdown: {
      margin: theme.spacing(1),
      minWidth: 120,
    },
    errorMessage: {
      marginTop: theme.spacing(8),
    },
    noDecoration: {
      "&:hover": {
        textDecoration: "none",
      },
    },
    link: {
      color: theme.palette.primary.main,
    },
    progressButtonWrapper: {
      margin: theme.spacing(1),
      position: "relative",
    },
    progressButton: {
      color: theme.palette.primary.main,
      position: "absolute",
      top: "50%",
      left: "50%",
      marginTop: -12,
      marginLeft: -12,
    },
  })
);

const currencyOptions = [{ name: "U$", value: "usd" }];

const validateInvestor = (values: any) => {
  const errors: Partial<investorType> = {};
  if (!values.deskId) {
    errors.deskId = "This Field Required";
  }
  if (!values.name) {
    errors.name = "This Field Required";
  }
  return errors;
};

const validateTrade = (values: any) => {
  const errors: Partial<any> = {};

  if (!values.accountFrom) {
    errors.accountFrom = "This Field Required";
  }

  if (!values.accountTo) {
    errors.accountTo = "This Field Required";
  }

  if (!values.type) {
    errors.type = "This Field Required";
  }

  if (!values.quantity) {
    errors.quantity = "This Field Required";
  }

  return errors;
};

const Investors = (): React.ReactElement => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { getOrganization } = useOrganization();
  const investors = useSelector(selectInvestors);
  const investorsLoading = useSelector(selectIsInvestorsLoading);
  const investorCreating = useSelector(selectIsInvestorCreating);
  const tradeRequestCreating = useSelector(selectIsTradeRequestCreating);
  const desks = useSelector(selectDesks);
  const { actions: investorsActions } = useInvestorsSlice();
  const { actions: investorDetailActions } = useInvestorDetailSlice();
  const { actions: deskActions } = useDesksSlice();
  const { organizationId } = Lockr.get("USER_DATA");
  const [investor, setInvestor] = useState<investorType>({
    deskId: "",
    name: "",
  });
  const [tradeRequest, setTradeRequest] = useState<tradeType>({
    accountFrom: "",
    accountTo: "",
    type: "",
    quantity: "",
    limitPrice: "",
    limitTime: "",
  });
  const [selectedInvestorId, setSelectedInvestorId] = useState("");
  const [selectedDeskId, setSelectedDeskId] = useState("");
  const [tradingAccounts, setTradingAccounts] = useState<
    Array<{ currency: string; iban: string; account: string; balance?: number }>
  >([]);
  const [createInvestorModalOpen, setCreateInvestorModalOpen] = useState(false);
  const [createTradeModalOpen, setCreateTradeModalOpen] = useState(false);
  const columns = [
    {
      field: "id",
      title: "Investor ID",
      cellStyle: {
        width: "20%",
      },
      render: (rowData: any) => {
        const { id, desk } = rowData;

        return <Link to={`/desks/${desk}/investors/${id}`}>{id}</Link>;
      },
    },
    {
      field: "accountSummary",
      title: "Account summary",
      cellStyle: {
        width: "30%",
      },
    },
    {
      field: "tradingAccountSummary",
      title: "Trading account summary",
      cellStyle: {
        width: "30%",
      },
    },
    {
      cellStyle: {
        width: "20%",
      },
      render: (rowData: any) => {
        const { id, desk } = rowData;

        return (
          <Button color="primary" onClick={() => handleNewTradeClick(desk, id)}>
            INITIATE NEW TRADE
          </Button>
        );
      },
    },
  ];

  useEffect(() => {
    let mounted = false;
    const init = async () => {
      const orgDetail = await getOrganization(organizationId);
      if (!mounted && orgDetail.clearing) {
        setTradingAccounts(orgDetail.clearing);
      }
      await dispatch(investorsActions.getInvestors());
      await dispatch(deskActions.getDesks(organizationId));
    };
    init();

    return () => {
      mounted = true;
    };
  }, []);

  const handleCreateInvestorDialogOpen = () => {
    setCreateInvestorModalOpen(true);
  };

  const handleCreateInvestorDialogClose = () => {
    setCreateInvestorModalOpen(false);
  };

  const handleInvestorCreate = async (values: investorType) => {
    await dispatch(
      investorsActions.addInvestor({
        organizationId,
        deskId: values.deskId,
        investor: values,
      })
    );
    setCreateInvestorModalOpen(false);
  };

  const handleCreateTradeDialogClose = () => {
    setCreateTradeModalOpen(false);
  };

  const handleNewTradeClick = (deskId: string, investorId: string) => {
    setCreateTradeModalOpen(true);
    setSelectedDeskId(deskId);
    setSelectedInvestorId(investorId);
  };

  const handleTradeCreate = async (values: tradeType) => {
    await dispatch(
      investorDetailActions.addTradeRequest({
        organizationId,
        deskId: selectedDeskId,
        investorId: selectedInvestorId,
        trade: values,
      })
    );
    setCreateTradeModalOpen(false);
  };

  return (
    <div className="main-wrapper">
      <Container>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Grid container alignItems="center" justify="space-between">
              <Grid item>
                <Grid container alignItems="center" spacing={2}>
                  <Grid item>
                    <Typography variant="h5">INVESTORS</Typography>
                  </Grid>
                  <Grid item>
                    <IconButton
                      className={classes.addButton}
                      color="primary"
                      onClick={handleCreateInvestorDialogOpen}
                    >
                      <Icon fontSize="large">add_circle</Icon>
                    </IconButton>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item>
                <Grid container alignItems="center" spacing={1}>
                  <Grid item>
                    <Typography variant="subtitle1">
                      Preferred currency display:
                    </Typography>
                  </Grid>
                  <Grid item>
                    <FormControl
                      size="small"
                      variant="outlined"
                      className={classes.currencyDropdown}
                    >
                      <Select value="usd">
                        {currencyOptions.map((opt) => (
                          <MenuItem key={opt.value} value={opt.value}>
                            {opt.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            {investorsLoading && <Loader />}
            {!investorsLoading && (
              <MaterialTable
                columns={columns}
                data={investors.map((investorItem: any) => ({
                  ...investorItem,
                }))}
                options={{
                  showTitle: false,
                }}
              />
            )}
          </Grid>
        </Grid>
      </Container>
      <Dialog
        open={createInvestorModalOpen}
        onClose={handleCreateInvestorDialogClose}
        aria-labelledby="form-dialog-title"
      >
        <Form
          onSubmit={handleInvestorCreate}
          mutators={{
            ...arrayMutators,
          }}
          initialValues={investor}
          validate={validateInvestor}
          render={({
            handleSubmit,
            submitting,
            pristine,
            form: {
              mutators: { push },
            },
            values: investorValues,
          }) => (
            <form onSubmit={handleSubmit} noValidate>
              <DialogTitle id="form-dialog-title">
                Create New Investor
              </DialogTitle>
              <Divider />
              <DialogContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <MuiSelect
                      native
                      name="deskId"
                      label="Desk"
                      variant="outlined"
                      fullWidth
                    >
                      <option value="0">Select...</option>
                      {desks.map((deskItem: deskType, index) => (
                        <option key={deskItem.id} value={deskItem.id}>
                          {deskItem.name}
                        </option>
                      ))}
                    </MuiSelect>
                  </Grid>
                  <Grid item xs={6}>
                    <MuiTextField
                      required
                      label="Investor name"
                      type="text"
                      name="name"
                      variant="outlined"
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </DialogContent>
              <Divider />
              <DialogActions>
                <Button
                  onClick={handleCreateInvestorDialogClose}
                  variant="contained"
                >
                  Cancel
                </Button>
                <div className={classes.progressButtonWrapper}>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={investorCreating}
                  >
                    Create
                  </Button>
                  {investorCreating && (
                    <CircularProgress
                      size={24}
                      className={classes.progressButton}
                    />
                  )}
                </div>
              </DialogActions>
            </form>
          )}
        />
      </Dialog>
      <Dialog
        open={createTradeModalOpen}
        onClose={handleCreateTradeDialogClose}
        aria-labelledby="form-dialog-title"
      >
        <Form
          onSubmit={handleTradeCreate}
          mutators={{
            ...arrayMutators,
          }}
          initialValues={tradeRequest}
          validate={validateTrade}
          render={({
            handleSubmit,
            submitting,
            pristine,
            form: {
              mutators: { push },
            },
            values: tradeValues,
          }) => (
            <form onSubmit={handleSubmit} noValidate>
              <DialogTitle id="form-dialog-title">Create Trade</DialogTitle>
              <Divider />
              <DialogContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <MuiSelect
                      native
                      name="accountFrom"
                      label="Account From"
                      variant="outlined"
                      fullWidth
                    >
                      <option value="0">Select...</option>
                      {tradingAccounts
                        .filter(
                          (accItem: accountType) =>
                            accItem.account !== tradeValues.accountTo
                        )
                        .map((accItem: accountType) => (
                          <option key={accItem.account} value={accItem.account}>
                            {accItem.currency}
                          </option>
                        ))}
                    </MuiSelect>
                  </Grid>
                  <Grid item xs={6}>
                    <MuiSelect
                      native
                      name="accountTo"
                      label="Account To"
                      variant="outlined"
                      fullWidth
                    >
                      <option value="0">Select...</option>
                      {tradingAccounts
                        .filter(
                          (accItem: accountType) =>
                            accItem.account !== tradeValues.accountFrom
                        )
                        .map((accItem: accountType) => (
                          <option key={accItem.account} value={accItem.account}>
                            {accItem.currency}
                          </option>
                        ))}
                    </MuiSelect>
                  </Grid>
                  <Grid item xs={6}>
                    <MuiSelect
                      native
                      name="type"
                      label="Type"
                      variant="outlined"
                      fullWidth
                    >
                      <option value="0">Select...</option>
                      <option value="limit">Limit</option>
                      <option value="market">Market</option>
                      <option value="manual">Manual</option>
                    </MuiSelect>
                  </Grid>
                  <Grid item xs={6}>
                    <MuiTextField
                      required
                      label="Quantity"
                      type="text"
                      name="quantity"
                      variant="outlined"
                      fullWidth
                    />
                  </Grid>
                  {tradeValues.type === "limit" && (
                    <>
                      <Grid item xs={6}>
                        <MuiTextField
                          label="Limit Price"
                          type="text"
                          name="limitPrice"
                          variant="outlined"
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <MuiTextField
                          label="Limit Time"
                          type="datetime-local"
                          name="limitTime"
                          variant="outlined"
                          fullWidth
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              </DialogContent>
              <Divider />
              <DialogActions>
                <Button
                  onClick={handleCreateTradeDialogClose}
                  variant="contained"
                >
                  Cancel
                </Button>
                <div className={classes.progressButtonWrapper}>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={tradeRequestCreating}
                  >
                    Create
                  </Button>
                  {tradeRequestCreating && (
                    <CircularProgress
                      size={24}
                      className={classes.progressButton}
                    />
                  )}
                </div>
              </DialogActions>
            </form>
          )}
        />
      </Dialog>
    </div>
  );
};

export default Investors;
