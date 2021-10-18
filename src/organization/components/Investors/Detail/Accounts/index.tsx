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
  TextField,
  Theme,
  Tooltip,
  Typography,
} from "@material-ui/core";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import SearchIcon from "@material-ui/icons/Search";
import VisibilityIcon from "@material-ui/icons/Visibility";
import MaterialTable from "material-table";

import { snackbarActions } from "../../../../../components/Snackbar/slice";
import { useInvestorDetailSlice } from "../slice";
import { useInvestorAccountDetailSlice } from "./slice";
import {
  selectInvestorAccounts,
  selectInvestorAccount,
  selectIsInvestorAccountsLoading,
  selectIsInvestorAccountCreating,
  selectIsInvestorAccountDetailLoading,
} from "../slice/selectors";
import {
  selectInvestorAccountOperations,
  selectIsInvestorAccountOperationsLoading,
  selectInvestorAccountBalance,
  selectIsInvestorAccountBalanceLoading,
} from "./slice/selectors";
import Loader from "../../../../../components/Loader";
import Account from "../../../../../types/Account";
import vault from "../../../../../vault";
import { InvestorAccountAddressTx } from "../../../../../types/InvestorAccountOperation";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    addButton: {
      color: theme.palette.primary.main,
      fontWeight: "bold",
      padding: 0,
    },
    linkItem: {
      color: "#599DE9",
      fontWeight: "bold",
      cursor: "pointer",
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

  return `${[day, month, year].join(".")} ${[hour, minute, second].join(":")}`;
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

const InvestorDetail = (): React.ReactElement => {
  const classes = useStyles();
  const history = useHistory();
  const dispatch = useDispatch();
  const { organizationId } = Lockr.get("USER_DATA");
  const { deskId } = useParams<{ deskId: string }>();
  const { investorId } = useParams<{ investorId: string }>();
  const { accountId } = useParams<{ accountId: string }>();
  const { actions: investorDetailActions } = useInvestorDetailSlice();
  const { actions: investorAccountDetailActions } =
    useInvestorAccountDetailSlice();
  const investorAccounts = useSelector(selectInvestorAccounts);
  const investorAccountOperations = useSelector(
    selectInvestorAccountOperations
  );
  const investorAccountBalance = useSelector(selectInvestorAccountBalance);
  const selectedInvestorAccount = useSelector(selectInvestorAccount);
  const { currency } = selectedInvestorAccount;
  const investorAccountsLoading = useSelector(selectIsInvestorAccountsLoading);
  const investorAccountCreating = useSelector(selectIsInvestorAccountCreating);
  const investorAccountDetailLoading = useSelector(
    selectIsInvestorAccountDetailLoading
  );
  const investorAccountOperationsLoading = useSelector(
    selectIsInvestorAccountOperationsLoading
  );
  const investorAccountBalanceLoading = useSelector(
    selectIsInvestorAccountBalanceLoading
  );
  const [searchText, setSearchText] = useState("");
  const [createAccountModalOpen, setCreateAccountModalOpen] = useState(false);
  const [accountCreating, setAccountCreating] = useState(false);
  const [defaultAccount, setDefaultAccount] = useState<Account>({
    name: "",
    currency: "",
    type: "crypto",
  });
  const [selectedOperationDetail, setSelectedOperationDetail] =
    useState<InvestorAccountAddressTx>({
      txHash: "",
      blockHeight: 0,
      txInputN: 0,
      txOutputN: 0,
      value: 0,
      refBalance: 0,
      spent: false,
      confirmations: 0,
      confirmed: "",
      doubleSpend: false,
    });
  const [operationDetailDialogOpen, setOperationDetailDialogOpen] =
    useState(false);
  const btcRate = 100000000;
  const ethRate = 1000000000000000000;
  const [whitelist, setWhitelist] = useState([]);
  const [loadingWhitelist, setLoadingWhitelist] = useState(false);

  useEffect(() => {
    dispatch(
      investorDetailActions.getInvestorAccounts({
        organizationId,
        deskId,
        investorId,
      })
    );
  }, []);

  useEffect(() => {
    dispatch(
      investorDetailActions.getInvestorAccount({
        organizationId,
        deskId,
        investorId,
        accountId,
      })
    );
    dispatch(
      investorAccountDetailActions.getInvestorAccountOperations({
        organizationId,
        deskId,
        investorId,
        accountId,
      })
    );
    dispatch(
      investorAccountDetailActions.getInvestorAccountBalance({
        organizationId,
        deskId,
        investorId,
        accountId,
      })
    );
  }, [accountId]);

  useEffect(() => {
    const loadWhitelist = async () => {
      if (selectedInvestorAccount.vaultAddressbookId) {
        setLoadingWhitelist(true);
        try {
          const vaultRequest = await vault.getAddressbook(
            selectedInvestorAccount.vaultAddressbookId
          );
          const response = await vault.sendRequest(vaultRequest);
          setWhitelist(response.addresses); 
        } catch (error) {
          dispatch(
            snackbarActions.showSnackbar({
              message: "You don't have permissions to get whitelist.",
              type: "error",
            })
          );
        }
        setLoadingWhitelist(false);
      }
    };
    loadWhitelist();
  }, [selectedInvestorAccount]);

  const onSearchTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setSearchText(value);
  };

  const handleCreateAccountModalOpen = () => {
    setCreateAccountModalOpen(true);
  };

  const handleCreateAccountModalClose = () => {
    setCreateAccountModalOpen(false);
  };

  const handleAccountCreate = async (values: Account) => {
    const sameAccount = investorAccounts.filter(x => x.currency === values.currency);
    if (sameAccount.length) {
      dispatch(
        snackbarActions.showSnackbar({
          message: "The account with same currency is already existing.",
          type: "error",
        })
      );
    } else {
      setAccountCreating(true);
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

        const createAddressbookRequest = await vault.createAddressbook();
        const response3 = await vault.sendRequest(createAddressbookRequest);
        newAccount.vaultAddressbookId = response3.addressBook.id;

        // Manage asset permission
  
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
        dispatch(
          snackbarActions.showSnackbar({
            message: error.message,
            type: "error",
          })
        );
      }
      setAccountCreating(false);
    }
  };

  const handleBackClick = () => {
    history.push(`/desks/${deskId}/investors/${investorId}`);
  };

  const getShortForm = (id: string) => {
    return `${id.substring(0, 10)}...${id.substr(id.length - 10)}`;
  };

  const handleOperationView = (rowData: any) => {
    setSelectedOperationDetail(rowData);
    setOperationDetailDialogOpen(true);
  };

  const handleOperationDetailDialogClose = () => {
    setOperationDetailDialogOpen(false);
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
              {investorAccountBalanceLoading && <Loader />}
              {!investorAccountBalanceLoading && (
                <Grid item xs={9}>
                  <Grid
                    container
                    item
                    alignItems="center"
                    justify="space-between"
                  >
                    {currency === "BTC" && (
                      <Typography variant="h5">
                        {`Balance: ${currency} ${
                          investorAccountBalance.balance / btcRate
                        }`}
                      </Typography>
                    )}
                    {currency === "ETH" && (
                      <Typography variant="h5">
                        {`Balance: ${currency} ${
                          investorAccountBalance.balance / ethRate
                        }`}
                      </Typography>
                    )}
                    <Typography variant="body2" color="textSecondary">
                      {`Account ID: ${accountId}`}
                    </Typography>
                  </Grid>
                  <Divider />
                </Grid>
              )}
            </Grid>
          </Grid>
          <Grid item xs={12}>
            {investorAccountDetailLoading && <Loader />}
            {!investorAccountDetailLoading && (
              <Grid container spacing={4}>
                <Grid item xs={3}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Grid container alignItems="center" spacing={2}>
                        <Grid item>
                          <Typography variant="h6">ACCOUNTS</Typography>
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
                      {investorAccountsLoading && <Loader />}
                      {!investorAccountsLoading && (
                        <List component="nav" aria-label="Investor's Accounts">
                          {investorAccounts
                            .filter((investorAccountItem) =>
                              investorAccountItem.name
                                .toLowerCase()
                                .includes(searchText.toLowerCase())
                            )
                            .map((investorAccountItem) => (
                              <ListItem
                                component={Link}
                                button
                                key={investorAccountItem.id}
                                selected={investorAccountItem.id === accountId}
                                to={`/desks/${deskId}/investors/${investorId}/accounts/${investorAccountItem.id}`}
                              >
                                <ListItemText
                                  primary={investorAccountItem.name}
                                />
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
                          <Grid container alignItems="center" spacing={1}>
                            <Grid item>
                              <Typography variant="h6">Operations</Typography>
                            </Grid>
                            {/* <Grid item>
                              <IconButton
                                color="primary"
                                aria-label="Add"
                                className={classes.addButton}
                                onClick={handleCreateAccountModalOpen}
                              >
                                <Icon fontSize="large">add_circle</Icon>
                              </IconButton>
                            </Grid> */}
                          </Grid>
                        </Grid>
                        <Grid item xs={12}>
                          {investorAccountOperationsLoading && <Loader />}
                          {!investorAccountOperationsLoading && (
                            <MaterialTable
                              columns={[
                                {
                                  field: "txHash",
                                  title: "Hash",
                                  render: (rowData: any) => {
                                    const { txHash } = rowData;
                                    return (
                                      <Tooltip
                                        title={txHash}
                                        placement="top"
                                        arrow
                                      >
                                        <Typography
                                          className={classes.linkItem}
                                          onClick={() =>
                                            handleOperationView(rowData)
                                          }
                                        >
                                          {getShortForm(txHash)}
                                        </Typography>
                                      </Tooltip>
                                    );
                                  },
                                },
                                {
                                  field: "confirmed",
                                  title: "Confirmed date",
                                  render: (rowData: any) => {
                                    const { confirmed } = rowData;
                                    return convertDateToDMYHIS(confirmed);
                                  },
                                },
                                {
                                  field: "value",
                                  title: "Value",
                                  render: (rowData: any) => {
                                    const { value, sent } = rowData;

                                    if (currency === "BTC")
                                      return `${sent ? "-" : " "} ${currency} ${
                                        value / btcRate
                                      }`;
                                    if (currency === "ETH")
                                      return `${sent ? "-" : " "} ${currency} ${
                                        value / ethRate
                                      }`;
                                    return value;
                                  },
                                },
                              ]}
                              data={
                                investorAccountOperations.txrefs
                                  ? investorAccountOperations.txrefs.map(
                                      (operation: any) => ({
                                        ...operation,
                                      })
                                    )
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
                    <Grid item xs={12}>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Grid container alignItems="center" spacing={1}>
                            <Grid item>
                              <Typography variant="h6">Whitelist</Typography>
                            </Grid>
                          </Grid>
                        </Grid>
                        <Grid item xs={12}>
                          {loadingWhitelist && <Loader />}
                          {!loadingWhitelist && (
                            <MaterialTable
                              columns={[
                                {
                                  field: "name",
                                  title: "Name",
                                  render: (rowData: any) => {
                                    const { name } = rowData;
                                    return name;
                                  },
                                },
                                {
                                  field: "address",
                                  title: "Address",
                                  render: (rowData: any) => {
                                    const { address } = rowData;
                                    return address;
                                  },
                                }
                              ]}
                              data={whitelist}
                              options={{
                                sorting: false,
                                toolbar: false,
                              }}
                            />
                          )}
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
                      disabled={investorAccountCreating || accountCreating}
                    >
                      Create
                    </Button>
                    {(investorAccountCreating || accountCreating) && (
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
          open={operationDetailDialogOpen}
          onClose={handleOperationDetailDialogClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">
            View operation details
          </DialogTitle>
          <Divider />
          <DialogContent>
            <Grid container>
              {Object.keys(selectedOperationDetail)
                .filter((key: string) => key !== "tableData")
                .map((key: string) => (
                  <Grid item xs={12} key={key}>
                    <Typography variant="body2">
                      {`${key}: ${(selectedOperationDetail as any)[key]}`}
                    </Typography>
                  </Grid>
                ))}
            </Grid>
          </DialogContent>
          <Divider />
          <DialogActions>
            <Button
              onClick={handleOperationDetailDialogClose}
              variant="contained"
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </div>
  );
};

export default InvestorDetail;
