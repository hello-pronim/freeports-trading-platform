/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState } from "react";
import Lockr from "lockr";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router";
import { Link } from "react-router-dom";
import { Form } from "react-final-form";
import arrayMutators from "final-form-arrays";
import { TextField as MuiTextField, Select as MuiSelect } from "mui-rff";
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
  Grid,
  Icon,
  IconButton,
  InputAdornment,
  ListItem,
  ListItemText,
  List,
  makeStyles,
  Snackbar,
  TextField,
  Theme,
  Tooltip,
  Typography,
} from "@material-ui/core";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import CompareArrowsIcon from "@material-ui/icons/CompareArrows";
import SearchIcon from "@material-ui/icons/Search";
import DeleteIcon from "@material-ui/icons/Delete";
import VisibilityIcon from "@material-ui/icons/Visibility";
import MaterialTable from "material-table";
import MuiAlert, { AlertProps } from "@material-ui/lab/Alert";

import { trades } from "./data";
import { useInvestorsSlice } from "../slice";
import { useInvestorDetailSlice } from "./slice";
import { selectInvestors, selectIsInvestorsLoading } from "../slice/selectors";
import {
  selectInvestorDetail,
  selectIsDetailLoading,
  selectTradeRequests,
  selectIsTradeRequestsLoading,
  selectIsTradeRequestCreating,
  selectInvestorAccounts,
  selectIsInvestorAccountsLoading,
  selectIsInvestorAccountCreating,
} from "./slice/selectors";
import Loader from "../../../../components/Loader";
import { useOrganization } from "../../../../hooks";
import Account from "../../../../types/Account";
import TradeRequest from "../../../../types/TradeRequest";
import { CryptoCurrencies } from "../../../../types/Currencies";
import vault from "../../../../vault";

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
      color: theme.palette.primary.main,
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
    tableHeader: {
      paddingLeft: 24,
      paddingRight: 24,
      minHeight: 64,
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

const convertDateToDMY = (date: string) => {
  const d = new Date(date);
  let month = `${d.getMonth() + 1}`;
  let day = `${d.getDate()}`;
  const year = `${d.getFullYear()}`;

  if (month.length < 2) month = `0${month}`;
  if (day.length < 2) day = `0${day}`;

  return [day, month, year].join(".");
};

const validateTradeRequest = (values: any) => {
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

const validateAccount = (values: any) => {
  const errors: Partial<any> = {};

  if (!values.name) {
    errors.name = "This Field Required";
  }

  if (!values.currency) {
    errors.currency = "This Field Required";
  }

  return errors;
};

const Alert = (props: AlertProps) => {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
};

const InvestorDetail = (): React.ReactElement => {
  const classes = useStyles();
  const history = useHistory();
  const dispatch = useDispatch();
  const { organizationId } = Lockr.get("USER_DATA");
  const { deskId } = useParams<{ deskId: string }>();
  const { investorId } = useParams<{ investorId: string }>();
  const { actions: investorsActions } = useInvestorsSlice();
  const { actions: investorDetailActions } = useInvestorDetailSlice();
  const { getOrganization } = useOrganization();
  const investors = useSelector(selectInvestors);
  const selectedInvestor = useSelector(selectInvestorDetail);
  const investorsLoading = useSelector(selectIsInvestorsLoading);
  const investorDetailLoading = useSelector(selectIsDetailLoading);
  const tradeRequests = useSelector(selectTradeRequests);
  const tradeRequestsLoading = useSelector(selectIsTradeRequestsLoading);
  const tradeRequestCreating = useSelector(selectIsTradeRequestCreating);
  const investorAccounts = useSelector(selectInvestorAccounts);
  const investorAccountsLoading = useSelector(selectIsInvestorAccountsLoading);
  const investorAccountCreating = useSelector(selectIsInvestorAccountCreating);
  const [searchText, setSearchText] = useState("");
  const [tradingAccounts, setTradingAccounts] = useState<
    Array<{ currency: string; iban: string; account: string; balance?: number }>
  >([]);
  const [createTradeModalOpen, setCreateTradeModalOpen] = useState(false);
  const [createAccountModalOpen, setCreateAccountModalOpen] = useState(false);
  const [defaultTradeRequest, setDefaultTradeRequest] = useState<tradeType>({
    accountFrom: "",
    accountTo: "",
    type: "",
    quantity: "",
    limitPrice: "",
    limitTime: "",
  });
  const [defaultAccount, setDefaultAccount] = useState<Account>({
    name: "",
    currency: "",
    type: "crypto",
  });
  const [showAlert, setShowAlert] = useState(false);
  const [submitResponse, setSubmitResponse] = useState({
    type: "success",
    message: "",
  });
  const btcRate = 100000000;
  const ethRate = 1000000000000000000;

  const getQuantityLabel = (values: any): string => {
    if (values) {
      const accountFrom = tradingAccounts.find(
        (account) => account.account === values.accountFrom
      );
      const accountTo = tradingAccounts.find(
        (account) => account.account === values.accountTo
      );
      if (
        accountTo &&
        Object.values(CryptoCurrencies).includes(
          accountTo.currency.toUpperCase() as CryptoCurrencies
        )
      ) {
        return `Quantity ${accountTo.currency}`;
      }
      if (
        accountFrom &&
        Object.values(CryptoCurrencies).includes(
          accountFrom.currency.toUpperCase() as CryptoCurrencies
        )
      ) {
        return `Quantity ${accountFrom.currency}`;
      }
    }
    return "Quantity";
  };

  useEffect(() => {
    let mounted = false;
    const init = async () => {
      const orgDetail = await getOrganization(organizationId);
      if (!mounted && orgDetail.clearing) {
        setTradingAccounts(orgDetail.clearing);
      }
    };
    init();

    return () => {
      mounted = true;
    };
  }, []);

  useEffect(() => {
    dispatch(investorsActions.getInvestors());
    dispatch(
      investorDetailActions.getInvestor({
        organizationId,
        deskId,
        investorId,
      })
    );
    dispatch(
      investorDetailActions.getInvestorTradeRequests({
        organizationId,
        deskId,
        investorId,
      })
    );
    dispatch(
      investorDetailActions.getInvestorAccounts({
        organizationId,
        deskId,
        investorId,
      })
    );
  }, [investorId]);

  const onSearchTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setSearchText(value);
  };

  const handleCreateTradeModalOpen = () => {
    setCreateTradeModalOpen(true);
  };

  const handleCreateTradeModalClose = () => {
    setCreateTradeModalOpen(false);
  };

  const handleTradeCreate = async (values: tradeType) => {
    await dispatch(
      investorDetailActions.addTradeRequest({
        organizationId,
        deskId,
        investorId,
        trade: values,
      })
    );
    setCreateTradeModalOpen(false);
  };

  const handleCreateAccountModalOpen = () => {
    setCreateAccountModalOpen(true);
  };

  const handleCreateAccountModalClose = () => {
    setCreateAccountModalOpen(false);
  };

  const handleAccountCreate = async (values: Account) => {
    try {
      const newAccount = { ...values };
      const vaultCreateWalletRequest = await vault.createWallet(
        newAccount.currency === "BTC" ? "Bitcoin" : "Ethereum"
      );
      const response = await vault.sendRequest(vaultCreateWalletRequest);
      newAccount.vaultWalletId = response.wallet.id;

      const vaultGetWalletsRequest = await vault.getAllWallets();
      const response2 = await vault.sendRequest(vaultGetWalletsRequest);
      newAccount.publicAddress = response2.wallets.filter(
        (x: any) => x.id === newAccount.vaultWalletId
      )[0].address;

      await dispatch(
        investorDetailActions.addInvestorAccount({
          organizationId,
          deskId,
          investorId,
          account: newAccount,
        })
      );
      setCreateAccountModalOpen(false);
    } catch (error: any) {
      setSubmitResponse({
        type: "error",
        message: error.message,
      });
      setShowAlert(true);
    }
  };

  const handleBackClick = () => {
    history.push("/investors");
  };

  const getShortId = (id: string) => {
    return `${id.substring(0, 10)}...${id.charAt(id.length - 1)}`;
  };

  const onHandleAccountDelete = (accountId: string) => {
    dispatch(
      investorDetailActions.removeInvestorAccount({
        organizationId,
        deskId,
        investorId,
        accountId,
      })
    );
  };

  const onHandleAccountView = (accountId: string) => {
    history.push(
      `/desks/${deskId}/investors/${investorId}/accounts/${accountId}`
    );
  };

  return (
    <div className="main-wrapper">
      <Container>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Grid container alignItems="center" spacing={4}>
              <Grid item xs={3}>
                <IconButton
                  color="inherit"
                  aria-label="Back"
                  onClick={handleBackClick}
                >
                  <ArrowBackIosIcon fontSize="small" color="primary" />
                </IconButton>
              </Grid>
              <Grid item xs={9}>
                <Grid
                  container
                  item
                  alignItems="center"
                  justify="space-between"
                >
                  <Typography variant="h5">
                    {`Investor ID: ${selectedInvestor.id}`}
                  </Typography>
                  {selectedInvestor.createdAt && (
                    <Typography variant="subtitle2" color="textSecondary">
                      {`Creation date: ${convertDateToDMY(
                        selectedInvestor.createdAt
                      )}`}
                    </Typography>
                  )}
                </Grid>
                <Divider />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            {investorDetailLoading && <Loader />}
            {!investorDetailLoading && (
              <Grid container spacing={4}>
                <Grid item xs={3}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        className="w-100"
                        placeholder="Search..."
                        value={searchText}
                        onChange={onSearchTextChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      {investorsLoading && <Loader />}
                      {!investorsLoading && (
                        <List component="nav" aria-label="investors">
                          {investors
                            .filter((investorItem) =>
                              investorItem.name
                                .toLowerCase()
                                .includes(searchText.toLowerCase())
                            )
                            .map((investorItem) => (
                              <ListItem
                                component={Link}
                                button
                                key={investorItem.id}
                                selected={investorItem.id === investorId}
                                to={`/desks/${deskId}/investors/${investorItem.id}`}
                              >
                                <ListItemText primary={investorItem.id} />
                              </ListItem>
                            ))}
                        </List>
                      )}
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={9}>
                  <Grid container spacing={4}>
                    <Grid item xs={12}>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Grid
                            container
                            alignItems="center"
                            justify="space-between"
                          >
                            <Grid item>
                              <Typography variant="h6">TRADES</Typography>
                            </Grid>
                            <Grid item>
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={handleCreateTradeModalOpen}
                              >
                                <Grid container alignItems="center" spacing={1}>
                                  <Grid item>
                                    <CompareArrowsIcon />
                                  </Grid>
                                  <Grid item>
                                    <Typography>INITIATE NEW TRADE</Typography>
                                  </Grid>
                                </Grid>
                              </Button>
                            </Grid>
                          </Grid>
                        </Grid>
                        <Grid item xs={12}>
                          {tradeRequestsLoading && <Loader />}
                          {!tradeRequestsLoading && (
                            <MaterialTable
                              columns={[
                                {
                                  title: "ID",
                                  render: (rowData: any) => {
                                    const { friendlyId } = rowData;

                                    return <Link to="/">{friendlyId}</Link>;
                                  },
                                },
                                {
                                  field: "createdAt",
                                  title: "Date",
                                  render: (rowData: any) => {
                                    const { createdAt } = rowData;

                                    return convertDateToDMY(createdAt);
                                  },
                                },
                                {
                                  field: "order",
                                  title: "Order",
                                  render: (rowData: any) => {
                                    const { type } = rowData;

                                    if (type === "limit") return "Limits";
                                    if (type === "market") return "At market";
                                    if (type === "manual") return "Manual";
                                    return "";
                                  },
                                },
                                {
                                  field: "status",
                                  title: "Status",
                                },
                                {
                                  field: "send",
                                  title: "Send",
                                },
                                {
                                  field: "receive",
                                  title: "Receive",
                                },
                                {
                                  field: "broker",
                                  title: "Broker",
                                },
                                {
                                  field: "commission",
                                  title: "Commission",
                                },
                              ]}
                              data={tradeRequests.map((trade) => ({
                                ...trade,
                              }))}
                              options={{
                                pageSize: 5,
                                toolbar: false,
                              }}
                            />
                          )}
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={6}>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Grid container alignItems="center" spacing={2}>
                            <Grid item>
                              <Typography variant="h6">
                                CURRENT ACCOUNTS
                              </Typography>
                            </Grid>
                            <Grid item>
                              <IconButton
                                color="primary"
                                aria-label="Add"
                                className={classes.addButton}
                                onClick={handleCreateAccountModalOpen}
                              >
                                <Icon fontSize="large">add_circle</Icon>
                              </IconButton>
                            </Grid>
                          </Grid>
                        </Grid>
                        <Grid item xs={12}>
                          {investorAccountsLoading && <Loader />}
                          {!investorAccountsLoading && (
                            <MaterialTable
                              columns={[
                                {
                                  field: "id",
                                  title: "Account ID",
                                  cellStyle: {
                                    width: "30%",
                                  },
                                  render: (rowData: any) => {
                                    const { id } = rowData;

                                    return (
                                      <Tooltip title={id} placement="top" arrow>
                                        <Link
                                          to={`/desks/${deskId}/investors/${investorId}/accounts/${id}`}
                                        >
                                          {getShortId(id)}
                                        </Link>
                                      </Tooltip>
                                    );
                                  },
                                },
                                {
                                  field: "balance",
                                  title: "Balance",
                                  cellStyle: {
                                    width: "40%",
                                  },
                                  render: (rowData: any) => {
                                    const { balance = 0, currency } = rowData;

                                    if (currency === "BTC")
                                      return `${currency} ${balance / btcRate}`;
                                    if (currency === "ETH")
                                      return `${currency} ${balance / ethRate}`;
                                    return `${currency} ${balance}`;
                                  },
                                },
                                {
                                  title: "Actions",
                                  render: (rowData: any) => {
                                    const { id: accountId } = rowData;

                                    return (
                                      <div>
                                        <IconButton
                                          color="inherit"
                                          aria-label="View details"
                                          onClick={() => {
                                            onHandleAccountView(accountId);
                                          }}
                                        >
                                          <VisibilityIcon
                                            fontSize="small"
                                            color="primary"
                                          />
                                        </IconButton>
                                        <IconButton
                                          color="inherit"
                                          onClick={() =>
                                            onHandleAccountDelete(accountId)
                                          }
                                        >
                                          <DeleteIcon
                                            fontSize="small"
                                            color="error"
                                            className="icon-delete"
                                          />
                                        </IconButton>
                                      </div>
                                    );
                                  },
                                },
                              ]}
                              data={
                                investorAccounts
                                  ? investorAccounts.map((accItem: any) => ({
                                      ...accItem,
                                    }))
                                  : []
                              }
                              options={{
                                sorting: false,
                                toolbar: false,
                              }}
                            />
                          )}
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={6}>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Grid
                            container
                            justify="space-between"
                            alignItems="center"
                          >
                            <Grid item>
                              <Grid container alignItems="center" spacing={2}>
                                <Grid item>
                                  <Typography variant="h6">
                                    TRADING ACCOUNTS
                                  </Typography>
                                </Grid>
                                <Grid item>
                                  <IconButton
                                    color="primary"
                                    aria-label="Add"
                                    className={classes.addButton}
                                  >
                                    <Icon fontSize="large">add_circle</Icon>
                                  </IconButton>
                                </Grid>
                              </Grid>
                            </Grid>
                            <Grid item>
                              <Button color="primary">Fund!</Button>
                              <Button color="primary">Refund!</Button>
                            </Grid>
                          </Grid>
                        </Grid>
                        <Grid item xs={12}>
                          <MaterialTable
                            columns={[
                              {
                                field: "account",
                                title: "Account ID",
                                render: (rowData: any) => {
                                  const { account } = rowData;

                                  return (
                                    <Tooltip
                                      title={account}
                                      placement="top"
                                      arrow
                                    >
                                      <Link to="/">{getShortId(account)}</Link>
                                    </Tooltip>
                                  );
                                },
                              },
                              {
                                field: "balance",
                                title: "Balance",
                                render: (rowData: any) => {
                                  const { balance = 0, currency } = rowData;

                                  return `${currency} ${balance}`;
                                },
                              },
                            ]}
                            data={tradingAccounts.map((accItem: any) => ({
                              ...accItem,
                            }))}
                            options={{
                              sorting: false,
                              toolbar: false,
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            )}
          </Grid>
        </Grid>
        <Dialog
          open={createTradeModalOpen}
          onClose={handleCreateTradeModalClose}
          aria-labelledby="form-dialog-title"
        >
          <Form
            onSubmit={handleTradeCreate}
            mutators={{
              ...arrayMutators,
            }}
            initialValues={defaultTradeRequest}
            validate={validateTradeRequest}
            render={({
              handleSubmit,
              submitting,
              pristine,
              form: {
                mutators: { push },
              },
              values,
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
                              accItem.account !== values.accountTo
                          )
                          .map((accItem: accountType) => (
                            <option
                              key={accItem.account}
                              value={accItem.account}
                            >
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
                              accItem.account !== values.accountFrom
                          )
                          .map((accItem: accountType) => (
                            <option
                              key={accItem.account}
                              value={accItem.account}
                            >
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
                        label={getQuantityLabel(values)}
                        type="text"
                        name="quantity"
                        variant="outlined"
                        fullWidth
                      />
                    </Grid>
                    {values.type === "limit" && (
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
                    onClick={handleCreateTradeModalClose}
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
        <Dialog
          open={createAccountModalOpen}
          onClose={handleCreateAccountModalClose}
          aria-labelledby="form-dialog-title"
        >
          <Form
            onSubmit={handleAccountCreate}
            mutators={{
              ...arrayMutators,
            }}
            initialValues={defaultAccount}
            validate={validateAccount}
            render={({
              handleSubmit,
              submitting,
              pristine,
              form: {
                mutators: { push },
              },
              values,
            }) => (
              <form onSubmit={handleSubmit} noValidate>
                <DialogTitle id="form-dialog-title">Create account</DialogTitle>
                <Divider />
                <DialogContent>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <MuiTextField
                        required
                        label="Name"
                        type="text"
                        name="name"
                        variant="outlined"
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <MuiSelect
                        native
                        name="currency"
                        label="Currency"
                        variant="outlined"
                        fullWidth
                      >
                        <option value="0">Select...</option>
                        <option value="BTC">BTC</option>
                        <option value="ETH">ETH</option>
                      </MuiSelect>
                    </Grid>
                  </Grid>
                </DialogContent>
                <Divider />
                <DialogActions>
                  <Button
                    onClick={handleCreateAccountModalClose}
                    variant="contained"
                  >
                    Cancel
                  </Button>
                  <div className={classes.progressButtonWrapper}>
                    <Button
                      variant="contained"
                      color="primary"
                      type="submit"
                      disabled={investorAccountCreating}
                    >
                      Create
                    </Button>
                    {investorAccountCreating && (
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
        <Snackbar
          autoHideDuration={2000}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          open={showAlert}
          onClose={() => {
            setShowAlert(false);
          }}
        >
          <Alert
            onClose={() => {
              setShowAlert(false);
            }}
            severity={submitResponse.type === "success" ? "success" : "error"}
          >
            {submitResponse.message}
          </Alert>
        </Snackbar>
      </Container>
    </div>
  );
};

export default InvestorDetail;
