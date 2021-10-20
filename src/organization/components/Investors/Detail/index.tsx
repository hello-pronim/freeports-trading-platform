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
  Snackbar,
  TextField,
  Theme,
  Tooltip,
  Typography,
} from "@mui/material";
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import MaterialTable from "material-table";
import MuiAlert, { AlertProps } from '@mui/material/Alert';

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
  selectFundRequests,
  selectIsFundRequestsLoading,
  selectIsFundRequestCreating,
  selectRefundRequests,
  selectIsRefundRequestsLoading,
  selectIsRefundRequestCreating,
  selectMoveRequests,
  selectIsMoveRequestsLoading,
  selectIsMoveRequestCreating,
  selectInvestorAccounts,
  selectIsInvestorAccountsLoading,
  selectIsInvestorAccountCreating,
} from "./slice/selectors";
import Loader from "../../../../components/Loader";
import { useOrganization } from "../../../../hooks";
import Account from "../../../../types/Account";
import TradeRequest from "../../../../types/TradeRequest";
import FundRequest from "../../../../types/FundRequest";
import RefundRequest from "../../../../types/RefundRequest";
import MoveRequest from "../../../../types/MoveRequest";
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

const validateFundRequest = (values: FundRequest) => {
  const errors: Partial<FundRequest> = {};
  console.log(values);

  if (values.accountFrom === "" || values.accountFrom === "0") {
    errors.accountFrom = "This Field Required";
  }

  if (values.accountTo === "" || values.accountTo === "0") {
    errors.accountTo = "This Field Required";
  }

  if (!values.quantity) {
    errors.quantity = "This Field Required";
  }

  return errors;
};

const validateRefundRequest = (values: RefundRequest) => {
  const errors: Partial<RefundRequest> = {};
  console.log(values);

  if (values.accountFrom === "" || values.accountFrom === "0") {
    errors.accountFrom = "This Field Required";
  }

  if (values.accountTo === "" || values.accountTo === "0") {
    errors.accountTo = "This Field Required";
  }

  if (!values.quantity) {
    errors.quantity = "This Field Required";
  }

  return errors;
};

const validateMoveRequest = (values: MoveRequest) => {
  const errors: Partial<MoveRequest> = {};

  if (!values.publicAddressTo) {
    errors.publicAddressTo = "This Field Required";
  }

  if (!values.quantity) {
    errors.quantity = "This Field Required";
  }

  return errors;

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
  const fundRequests = useSelector(selectFundRequests);
  const fundRequestsLoading = useSelector(selectIsFundRequestsLoading);
  const fundRequestCreating = useSelector(selectIsFundRequestCreating);
  const refundRequests = useSelector(selectRefundRequests);
  const refundRequestsLoading = useSelector(selectIsRefundRequestsLoading);
  const refundRequestCreating = useSelector(selectIsRefundRequestCreating);
  const moveRequests = useSelector(selectMoveRequests);
  const moveRequestsLoading = useSelector(selectIsMoveRequestsLoading);
  const moveRequestCreating = useSelector(selectIsMoveRequestCreating);
  const transferRequests = [
    ...fundRequests,
    ...refundRequests,
    ...moveRequests,
  ];
  const [searchText, setSearchText] = useState("");
  const [tradingAccounts, setTradingAccounts] = useState<
    Array<{ currency: string; iban: string; account: string; balance?: number }>
  >([]);
  const [createTradeModalOpen, setCreateTradeModalOpen] = useState(false);
  const [createAccountModalOpen, setCreateAccountModalOpen] = useState(false);
  const [createFundRequestModalOpen, setCreateFundRequestModalOpen] =
    useState(false);
  const [createRefundRequestModalOpen, setCreateRefundRequestModalOpen] =
    useState(false);
  const [createMoveRequestModalOpen, setCreateMoveRequestModalOpen] =
    useState(false);
  const [defaultTradeRequest, setDefaultTradeRequest] = useState<tradeType>({
    accountFrom: "",
    accountTo: "",
    type: "",
    quantity: "",
    limitPrice: "",
    limitTime: "",
  });
  const [defaultFundRequest, setDefaultFundRequest] = useState<FundRequest>({
    accountFrom: "",
    accountTo: "",
    quantity: "",
    description: "",
  });
  const [defaultRefundRequest, setDefaultRefundRequest] =
    useState<RefundRequest>({
      accountFrom: "",
      accountTo: "",
      quantity: "",
      description: "",
    });
  const [defaultMoveRequest, setDefaultMoveRequest] = useState<MoveRequest>({
    accountFrom: "",
    publicAddressTo: "",
    quantity: "",
    description: "",
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

  const convertDateToDMYHIS = (datetime: string) => {
    const dt = new Date(datetime);
    let month = `${dt.getMonth() + 1}`;
    let day = `${dt.getDate()}`;
    const year = `${dt.getFullYear()}`;
    let hour = `${dt.getHours()}`;
    let minute = `${dt.getMinutes()}`;
    let second = `${dt.getSeconds()}`;

    if (month.length < 2) month = `0${month}`;
    if (day.length < 2) day = `0${day}`;
    if (hour.length < 2) hour = `0${hour}`;
    if (minute.length < 2) minute = `0${minute}`;
    if (second.length < 2) second = `0${second}`;

    return `${[day, month, year].join(".")} ${[hour, minute, second].join(
      ":"
    )}`;
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
      investorDetailActions.getInvestorFundRequests({
        organizationId,
        deskId,
        investorId,
      })
    );
    dispatch(
      investorDetailActions.getInvestorRefundRequests({
        organizationId,
        deskId,
        investorId,
      })
    );
    dispatch(
      investorDetailActions.getInvestorMoveRequests({
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

  const handleCreateFundRequestModalOpen = () => {
    setCreateFundRequestModalOpen(true);
  };

  const handleCreateFundRequestModalClose = () => {
    setCreateFundRequestModalOpen(false);
  };

  const handleCreateRefundRequestModalOpen = () => {
    setCreateRefundRequestModalOpen(true);
  };

  const handleCreateRefundRequestModalClose = () => {
    setCreateRefundRequestModalOpen(false);
  };

  const handleCreateMoveRequestModalOpen = (accountFrom: string) => {
    setDefaultMoveRequest({ ...defaultMoveRequest, accountFrom });
    setCreateMoveRequestModalOpen(true);
  };

  const handleCreateMoveRequestModalClose = () => {
    setCreateMoveRequestModalOpen(false);
  };

  const handleAccountCreate = async (values: Account) => {
    const sameAccount = investorAccounts.filter(x => x.currency === values.currency);
    if (sameAccount.length) {
      setSubmitResponse({
        type: "error",
        message: "The account with same currency is already existing.",
      });
      setShowAlert(true);
    } else {
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
    }
  };

  const handleFundRequestCreate = async (values: FundRequest) => {
    await dispatch(
      investorDetailActions.addInvestorFundRequest({
        organizationId,
        deskId,
        investorId,
        request: values,
      })
    );
    setCreateFundRequestModalOpen(false);
  };

  const handleRefundRequestCreate = async (values: RefundRequest) => {
    await dispatch(
      investorDetailActions.addInvestorRefundRequest({
        organizationId,
        deskId,
        investorId,
        request: values,
      })
    );
    setCreateRefundRequestModalOpen(false);
  };

  const handleMoveRequestCreate = async (values: MoveRequest) => {
    await dispatch(
      investorDetailActions.addInvestorMoveRequest({
        organizationId,
        deskId,
        investorId,
        request: values,
      })
    );
    setCreateMoveRequestModalOpen(false);
  };

  const handleBackClick = () => {
    history.push("/investors");
  };

  const getShortId = (id: string) => {
    return `${id.substring(0, 10)}...${id.charAt(id.length - 1)}`;
  };

  const handleAccountDelete = (accountId: string) => {
    dispatch(
      investorDetailActions.removeInvestorAccount({
        organizationId,
        deskId,
        investorId,
        accountId,
      })
    );
  };

  const sortTransferRequestsByDate = () => {
    return (a: any, b: any) => {
      if (a.createdAt && b.createdAt && a.createdAt < b.createdAt) {
        return 1;
      }
      if (a.createdAt && b.createdAt && a.createdAt > b.createdAt) {
        return -1;
      }
      return 0;
    };
  };

  return (
    <div className="main-wrapper">
      <Container>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Grid container alignItems="center" spacing={4}>
              <Grid item xs={3}>
                <IconButton color="inherit" aria-label="Back" onClick={handleBackClick} size="large">
                  <ArrowBackIosIcon fontSize="small" color="primary" />
                </IconButton>
              </Grid>
              <Grid item xs={9}>
                <Grid
                  container
                  item
                  alignItems="center"
                  justifyContent="space-between"
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
                            justifyContent="space-between"
                          >
                            <Grid item>
                              <Typography variant="h6">
                                ORDER REQUESTS
                              </Typography>
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
                                    <Typography>INITIATE NEW ORDER</Typography>
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
                                    const { id } = rowData;

                                    return (
                                      <Link
                                        to={`/desks/${deskId}/investors/${investorId}/trades/${id}`}
                                      >
                                        {getShortId(id)}
                                      </Link>
                                    );
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
                                  title: "Processing",
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
                    <Grid item xs={12}>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Typography variant="h6">
                            TRANSFER REQUESTS
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          {(fundRequestsLoading ||
                            refundRequestsLoading ||
                            moveRequestsLoading) && <Loader />}
                          {!fundRequestsLoading &&
                            !refundRequestsLoading &&
                            !moveRequestsLoading && (
                              <MaterialTable
                                columns={[
                                  {
                                    field: "createdAt",
                                    title: "Date",
                                    render: (rowData: any) => {
                                      const { createdAt } = rowData;
                                      return convertDateToDMYHIS(createdAt);
                                    },
                                  },
                                  {
                                    field: "kind",
                                    title: "Kind",
                                    render: (rowData: any) => {
                                      const { kind } = rowData;
                                      if (kind === "RequestFund") return "Fund";
                                      if (kind === "RequestRefund")
                                        return "Refund";
                                      if (kind === "RequestMove") return "Move";
                                      return kind;
                                    },
                                  },
                                  {
                                    field: "quantity",
                                    title: "Quantity",
                                  },
                                  {
                                    field: "status",
                                    title: "Status",
                                  },
                                  {
                                    title: "Actions",
                                    render: (rowData: any) => {
                                      return (
                                        <Button
                                          color="primary"
                                          aria-label="Cancel"
                                        >
                                          Cancel
                                        </Button>
                                      );
                                    },
                                  },
                                ]}
                                data={transferRequests
                                  .sort(sortTransferRequestsByDate())
                                  .map((request: any) => ({
                                    ...request,
                                  }))}
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
                                size="large">
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
                                    width: "35%",
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
                                    const { id } = rowData;

                                    return (
                                      <div>
                                        <Button
                                          color="primary"
                                          aria-label="View details"
                                          onClick={() => {
                                            handleCreateMoveRequestModalOpen(
                                              id
                                            );
                                          }}
                                        >
                                          Move
                                        </Button>
                                        <IconButton
                                          color="inherit"
                                          onClick={() =>
                                            handleAccountDelete(id)
                                          }
                                          size="large">
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
                            justifyContent="space-between"
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
                                    size="large">
                                    <Icon fontSize="large">add_circle</Icon>
                                  </IconButton>
                                </Grid>
                              </Grid>
                            </Grid>
                            <Grid item>
                              <Button
                                color="primary"
                                onClick={handleCreateFundRequestModalOpen}
                              >
                                Fund!
                              </Button>
                              <Button
                                color="primary"
                                onClick={handleCreateRefundRequestModalOpen}
                              >
                                Refund!
                              </Button>
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
                <DialogTitle id="form-dialog-title">Create Order</DialogTitle>
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
                <DialogTitle id="form-dialog-title">
                  Create fund request
                </DialogTitle>
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
        <Dialog
          open={createFundRequestModalOpen}
          onClose={handleCreateFundRequestModalClose}
          aria-labelledby="form-dialog-title"
        >
          <Form
            onSubmit={handleFundRequestCreate}
            mutators={{
              ...arrayMutators,
            }}
            initialValues={defaultFundRequest}
            validate={validateFundRequest}
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
                <DialogTitle id="form-dialog-title">
                  Create fund request
                </DialogTitle>
                <Divider />
                <DialogContent>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <MuiSelect
                        native
                        name="accountFrom"
                        label="Account From"
                        variant="outlined"
                        fullWidth
                      >
                        <option value="0">Select...</option>
                        {investorAccounts.map((account: any) => (
                          <option key={account.id} value={account.id}>
                            {account.id}
                          </option>
                        ))}
                      </MuiSelect>
                    </Grid>
                    <Grid item xs={4}>
                      <MuiSelect
                        native
                        name="accountTo"
                        label="Account To"
                        variant="outlined"
                        fullWidth
                      >
                        <option value="0">Select...</option>
                        {values.accountFrom !== "" && values.accountFrom !== "0"
                          ? tradingAccounts
                              .filter(
                                (account: accountType) =>
                                  account.currency ===
                                  investorAccounts.filter(
                                    (acc: any) => acc.id === values.accountFrom
                                  )[0].currency
                              )
                              .map((account: accountType) => (
                                <option
                                  key={account.account}
                                  value={account.account}
                                >
                                  {account.account}
                                </option>
                              ))
                          : tradingAccounts.map((account: accountType) => (
                              <option
                                key={account.account}
                                value={account.account}
                              >
                                {account.account}
                              </option>
                            ))}
                      </MuiSelect>
                    </Grid>
                    <Grid item xs={4}>
                      <MuiTextField
                        required
                        label="Quantity"
                        type="text"
                        name="quantity"
                        variant="outlined"
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <MuiTextField
                        label="Description"
                        type="text"
                        name="description"
                        variant="outlined"
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </DialogContent>
                <Divider />
                <DialogActions>
                  <Button
                    onClick={handleCreateFundRequestModalClose}
                    variant="contained"
                  >
                    Cancel
                  </Button>
                  <div className={classes.progressButtonWrapper}>
                    <Button
                      variant="contained"
                      color="primary"
                      type="submit"
                      disabled={fundRequestCreating}
                    >
                      Create
                    </Button>
                    {fundRequestCreating && (
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
          open={createRefundRequestModalOpen}
          onClose={handleCreateRefundRequestModalClose}
          aria-labelledby="form-dialog-title"
        >
          <Form
            onSubmit={handleRefundRequestCreate}
            mutators={{
              ...arrayMutators,
            }}
            initialValues={defaultRefundRequest}
            validate={validateRefundRequest}
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
                <DialogTitle id="form-dialog-title">
                  Create refund request
                </DialogTitle>
                <Divider />
                <DialogContent>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <MuiSelect
                        native
                        name="accountFrom"
                        label="Account From"
                        variant="outlined"
                        fullWidth
                      >
                        <option value="0">Select...</option>
                        {tradingAccounts.map((account: accountType) => (
                          <option key={account.account} value={account.account}>
                            {account.account}
                          </option>
                        ))}
                      </MuiSelect>
                    </Grid>
                    <Grid item xs={4}>
                      <MuiSelect
                        native
                        name="accountTo"
                        label="Account To"
                        variant="outlined"
                        fullWidth
                      >
                        <option value="0" selected>
                          Select...
                        </option>
                        {values.accountFrom !== "" && values.accountFrom !== "0"
                          ? investorAccounts
                              .filter(
                                (account: any) =>
                                  account.currency ===
                                  tradingAccounts.filter(
                                    (acc: accountType) =>
                                      acc.account === values.accountFrom
                                  )[0].currency
                              )
                              .map((account: any) => (
                                <option key={account.id} value={account.id}>
                                  {account.id}
                                </option>
                              ))
                          : investorAccounts.map((account: any) => (
                              <option key={account.id} value={account.id}>
                                {account.id}
                              </option>
                            ))}
                      </MuiSelect>
                    </Grid>
                    <Grid item xs={4}>
                      <MuiTextField
                        required
                        label="Quantity"
                        type="text"
                        name="quantity"
                        variant="outlined"
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <MuiTextField
                        label="Description"
                        type="text"
                        name="description"
                        variant="outlined"
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </DialogContent>
                <Divider />
                <DialogActions>
                  <Button
                    onClick={handleCreateRefundRequestModalClose}
                    variant="contained"
                  >
                    Cancel
                  </Button>
                  <div className={classes.progressButtonWrapper}>
                    <Button
                      variant="contained"
                      color="primary"
                      type="submit"
                      disabled={refundRequestCreating}
                    >
                      Create
                    </Button>
                    {refundRequestCreating && (
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
          open={createMoveRequestModalOpen}
          onClose={handleCreateMoveRequestModalClose}
          aria-labelledby="form-dialog-title"
        >
          <Form
            onSubmit={handleMoveRequestCreate}
            mutators={{
              ...arrayMutators,
            }}
            initialValues={defaultMoveRequest}
            validate={validateMoveRequest}
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
                <DialogTitle id="form-dialog-title">
                  Create move request
                </DialogTitle>
                <Divider />
                <DialogContent>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <MuiTextField
                        required
                        label="Public address"
                        type="text"
                        name="publicAddressTo"
                        variant="outlined"
                        fullWidth
                      />
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
                    <Grid item xs={12}>
                      <MuiTextField
                        label="Description"
                        type="text"
                        name="description"
                        variant="outlined"
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </DialogContent>
                <Divider />
                <DialogActions>
                  <Button
                    onClick={handleCreateMoveRequestModalClose}
                    variant="contained"
                  >
                    Cancel
                  </Button>
                  <div className={classes.progressButtonWrapper}>
                    <Button
                      variant="contained"
                      color="primary"
                      type="submit"
                      disabled={moveRequestCreating}
                    >
                      Create
                    </Button>
                    {moveRequestCreating && (
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
