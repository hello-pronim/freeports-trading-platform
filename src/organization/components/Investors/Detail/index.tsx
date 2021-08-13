/* eslint-disable @typescript-eslint/no-use-before-define */
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
  Container,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  ListItem,
  ListItemText,
  List,
  makeStyles,
  TextField,
  Theme,
  Typography,
} from "@material-ui/core";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import CompareArrowsIcon from "@material-ui/icons/CompareArrows";
import SearchIcon from "@material-ui/icons/Search";
import VisibilityIcon from "@material-ui/icons/Visibility";
import MaterialTable from "material-table";

import { trades } from "./data";
import { useInvestorsSlice } from "../slice";
import { useInvestorDetailSlice } from "./slice";
import { selectInvestors, selectIsInvestorsLoading } from "../slice/selectors";
import {
  selectInvestorDetail,
  selectIsDetailLoading,
  selectTradeRequests,
  selectIsTradeRequestsLoading,
} from "./slice/selectors";
import Loader from "../../../../components/Loader";
import { useOrganization } from "../../../../hooks";
import TradeRequest from "../../../../types/TradeRequest";
import { CryptoCurrencies } from "../../../../types/Currencies";

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

const validate = (values: any) => {
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
  console.log("tradeRequest", tradeRequests);
  const tradeRequestsLoading = useSelector(selectIsTradeRequestsLoading);
  const [searchText, setSearchText] = useState("");
  const [tradingAccounts, setTradingAccounts] = useState<
    Array<{ currency: string; iban: string; account: string; balance?: number }>
  >([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [tradeRequest, setTradeRequest] = useState<tradeType>({
    accountFrom: "",
    accountTo: "",
    type: "",
    quantity: "",
    limitPrice: "",
    limitTime: "",
  });

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
  }, [investorId]);

  const onSearchTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setSearchText(value);
  };

  const handleCreateModalOpen = () => {
    setCreateModalOpen(true);
  };

  const handleCreateModalClose = () => {
    setCreateModalOpen(false);
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
    setCreateModalOpen(false);
  };

  const handleBackClick = () => {
    history.push("/investors");
  };

  return (
    <div className="main-wrapper">
      <Container>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <IconButton
              color="inherit"
              aria-label="Back"
              onClick={handleBackClick}
            >
              <ArrowBackIosIcon fontSize="large" color="primary" />
            </IconButton>
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
                    <Grid item xs={12}>
                      {tradeRequestsLoading && <Loader />}
                      {!tradeRequestsLoading && (
                        <MaterialTable
                          title="TRADES"
                          columns={[
                            {
                              title: "ID",
                              render: (rowData: any) => {
                                const { friendlyId } = rowData;

                                return (
                                  <Link to="/" className={classes.link}>
                                    {friendlyId}
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
                            search: false,
                          }}
                          components={{
                            Toolbar: (props) => (
                              <Grid
                                container
                                justify="space-between"
                                alignItems="center"
                                spacing={2}
                                className={classes.tableHeader}
                              >
                                <Grid item>
                                  <Typography variant="h5">TRADES</Typography>
                                </Grid>
                                <Grid item>
                                  <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleCreateModalOpen}
                                  >
                                    <Grid
                                      container
                                      alignItems="center"
                                      spacing={1}
                                    >
                                      <Grid item>
                                        <CompareArrowsIcon />
                                      </Grid>
                                      <Grid item>
                                        <Typography>
                                          INITIATE NEW TRADE
                                        </Typography>
                                      </Grid>
                                    </Grid>
                                  </Button>
                                </Grid>
                              </Grid>
                            ),
                          }}
                        />
                      )}
                    </Grid>
                    <Grid item xs={12}>
                      <Grid container spacing={4}>
                        <Grid item xs={12}>
                          <MaterialTable
                            title={
                              <Grid container alignItems="center" spacing={2}>
                                <Grid item>
                                  <Typography variant="h5">
                                    CURRENT ACCOUNTS
                                  </Typography>
                                </Grid>
                                <Grid item>
                                  <IconButton
                                    color="primary"
                                    aria-label="Add"
                                    className={classes.addButton}
                                  >
                                    <AddCircleIcon />
                                  </IconButton>
                                </Grid>
                              </Grid>
                            }
                            columns={[
                              {
                                field: "accountId",
                                title: "Account ID",
                                cellStyle: {
                                  width: "25%",
                                },
                              },
                              {
                                field: "cryptocurrency",
                                title: "Cryptocurrency",
                                cellStyle: {
                                  width: "25%",
                                },
                              },
                              {
                                field: "balance",
                                title: "Balance",
                                cellStyle: {
                                  width: "25%",
                                },
                              },
                              {
                                field: "rules",
                                title: "Rules",
                                cellStyle: {
                                  width: "25%",
                                },
                                render: (rowData: any) => {
                                  const { id } = rowData;

                                  return (
                                    <div>
                                      <IconButton
                                        color="inherit"
                                        aria-label="Add Role"
                                      >
                                        <VisibilityIcon
                                          fontSize="small"
                                          color="primary"
                                        />
                                      </IconButton>
                                      <Button color="primary">Transfer!</Button>
                                    </div>
                                  );
                                },
                              },
                            ]}
                            data={
                              selectedInvestor.accounts
                                ? selectedInvestor.accounts.map(
                                    (accItem: any) => ({
                                      ...accItem,
                                    })
                                  )
                                : []
                            }
                            options={{
                              search: false,
                              sorting: false,
                            }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <MaterialTable
                            title="TRADING ACCOUNTS"
                            columns={[
                              {
                                field: "account",
                                title: "Account ID",
                                cellStyle: {
                                  width: "30%",
                                },
                                render: (rowData: any) => {
                                  const { account } = rowData;

                                  return (
                                    <Link to="/" className={classes.link}>
                                      {account}
                                    </Link>
                                  );
                                },
                              },
                              {
                                field: "currency",
                                title: "Currency",
                                cellStyle: {
                                  width: "35%",
                                },
                              },
                              {
                                field: "balance",
                                title: "Balance",
                                cellStyle: {
                                  width: "35%",
                                },
                              },
                            ]}
                            data={tradingAccounts.map((accItem: any) => ({
                              ...accItem,
                            }))}
                            options={{
                              search: false,
                              sorting: false,
                            }}
                            components={{
                              Toolbar: (props) => (
                                <Grid
                                  container
                                  justify="space-between"
                                  alignItems="center"
                                  className={classes.tableHeader}
                                >
                                  <Grid item>
                                    <Typography variant="h5">TRADES</Typography>
                                  </Grid>
                                  <Grid item>
                                    <Button color="primary">Fund!</Button>
                                    <Button color="primary">Refund!</Button>
                                  </Grid>
                                </Grid>
                              ),
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
          open={createModalOpen}
          onClose={handleCreateModalClose}
          aria-labelledby="form-dialog-title"
        >
          <Form
            onSubmit={handleTradeCreate}
            mutators={{
              ...arrayMutators,
            }}
            initialValues={tradeRequest}
            validate={validate}
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
                  <Button onClick={handleCreateModalClose} variant="contained">
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={submitting || pristine}
                  >
                    Create
                  </Button>
                </DialogActions>
              </form>
            )}
          />
        </Dialog>
      </Container>
    </div>
  );
};

export default InvestorDetail;
