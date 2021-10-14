/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState } from "react";
import Lockr from "lockr";
import { Link } from "react-router-dom";
import { Form } from "react-final-form";
import arrayMutators from "final-form-arrays";
import { TextField, Select, Radios } from "mui-rff";
import { useSelector, useDispatch } from "react-redux";
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
  makeStyles,
  CircularProgress,
  Theme,
  Typography,
  Snackbar,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";
import red from "@material-ui/core/colors/red";
import MaterialTable from "material-table";
import MuiAlert, { AlertProps } from "@material-ui/lab/Alert";

import { useAccountsSlice } from "./slice";
import {
  selectAccounts,
  selectIsAccountsLoading,
  selectIsAccountCreating,
  selectIsAccountDeleting,
} from "./slice/selectors";
import Loader from "../../../components/Loader";
import vault from "../../../vault";
import {
  selectClearerSettings,
} from "../Settings/slice/selectors";
import { useClearerSettingsSlice } from "../Settings/slice";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    actionButton: { marginRight: theme.spacing(2) },
    deleteButton: { color: Lockr.get("THEME") === "dark" ? "#FFF" : red[500] },
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

interface accountType {
  name: string;
  currency: string;
  type: string;
  balance?: number;
  iban?: string;
  publicAddress?: string;
  vaultWalletId?: string;
}

const validate = (values: any) => {
  const errors: Partial<accountType> = {};
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

const cryptoAddressFormvalidate = (values: any) => {
  const errors: Partial<accountType> = {};
  if (!values.name) {
    errors.name = "This Field Required";
  }
  return errors;
};

const NostroAccounts = (): React.ReactElement => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { actions } = useAccountsSlice();
  const accounts = useSelector(selectAccounts);
  const loadingAccounts = useSelector(selectIsAccountsLoading);
  const creatingAccount = useSelector(selectIsAccountCreating);
  const deletingAccount = useSelector(selectIsAccountDeleting);
  const [declareAccountModalOpen, setDeclareAccountModalOpen] =
    React.useState(false);
  const [account, setAccount] = useState<accountType>({
    name: "",
    currency: "CHF",
    type: "fiat",
    balance: 0,
    iban: "",
    publicAddress: "",
    vaultWalletId: "",
  });
  const fiat: Array<string> = ["CHF", "EUR", "USD"];
  const crypto: Array<string> = ["BTC", "ETH"];

  const [cryptoAdrDlgView, setCryptoAdrDlgView] = useState(false);
  const [creatingCryptoAdr, setCreatingCryptoAdr] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [submitResponse, setSubmitResponse] = useState({
    type: "success",
    message: "",
  });
  const clearerSettings = useSelector(selectClearerSettings);
  const { actions: clearerSettingsActions } = useClearerSettingsSlice();

  const handleDeclareAccountModalOpen = () => {
    setDeclareAccountModalOpen(true);
  };

  const handleDeclareAccountModalClose = () => {
    setDeclareAccountModalOpen(false);
  };

  useEffect(() => {
    dispatch(actions.getAccounts());
    dispatch(clearerSettingsActions.retrieveClearerSettings());
  }, []);

  const handleAccountCreate = async (values: accountType) => {
    const newAccount = { ...values };
    delete newAccount.vaultWalletId;
    if (fiat.includes(newAccount.currency)) {
      newAccount.type = "fiat";
      delete newAccount.publicAddress;
    } else if (crypto.includes(newAccount.currency)) {
      newAccount.type = "crypto";
      delete newAccount.iban;
    }

    await dispatch(actions.addAccount(newAccount));
    setDeclareAccountModalOpen(false);
  };

  const handleAccountDelete = async (id: string) => {
    dispatch(actions.removeAccount(id));
  };

  const columns = [
    {
      field: "name",
      title: "Name",
      cellStyle: {
        width: "20%",
      },
      sortable: false,
      render: (rowData: any) => {
        const { id, name } = rowData;

        return <Link to={`nostro-accounts/${id}`}>{name}</Link>;
      },
    },
    {
      field: "iban",
      title: "IBAN",
      cellStyle: {
        width: "15%",
      },
    },
    {
      field: "publicAddress",
      title: "Public Address",
      cellStyle: {
        width: "15%",
      },
    },
    {
      field: "balance",
      title: "Balance",
      cellStyle: {
        width: "15%",
      },
    },
    {
      field: "type",
      title: "Type",
      cellStyle: {
        width: "15%",
      },
    },
    {
      field: "currency",
      title: "Currency",
      cellStyle: {
        width: "15%",
      },
    },
    {
      title: "Action",
      render: (rowData: any) => {
        const { id } = rowData;
        return (
          <IconButton
            className={classes.deleteButton}
            onClick={() => handleAccountDelete(id)}
            disabled={deletingAccount}
          >
            <DeleteIcon />
          </IconButton>
        );
      },
    },
  ];

  const onSubmitCryptoAdr = async (values: accountType) => {
    setCreatingCryptoAdr(true);
    const newAccount = { ...values };
    newAccount.type = "crypto";
    delete newAccount.iban;

    try {
      await vault.authenticate(clearerSettings.vaultOrganizationId);
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
      vault.clearToken();

      await dispatch(actions.addAccount(newAccount));
      setCryptoAdrDlgView(false);
    } catch (err) {
      setSubmitResponse({
        type: "error",
        message: err.message,
      });
      setShowAlert(true);
    }
    setCreatingCryptoAdr(false);
  };

  return (
    <div className="main-wrapper">
      <Container>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Grid container justify="space-between">
              <Grid item>
                <Typography variant="h5">NOSTRO ACCOUNTS</Typography>
              </Grid>
              <Grid item>
                <Grid container>
                  <Grid item>
                    <Button
                      variant="contained"
                      color="primary"
                      className={classes.actionButton}
                      onClick={handleDeclareAccountModalOpen}
                    >
                      <AddIcon fontSize="small" />
                      New Account
                    </Button>
                    <Dialog
                      open={declareAccountModalOpen}
                      onClose={handleDeclareAccountModalClose}
                      aria-labelledby="form-dialog-title"
                    >
                      <Form
                        onSubmit={handleAccountCreate}
                        mutators={{
                          ...arrayMutators,
                        }}
                        initialValues={account}
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
                            <DialogTitle id="form-dialog-title">
                              Create New Account
                            </DialogTitle>
                            <Divider />
                            <DialogContent>
                              <Grid container spacing={2}>
                                <Grid item xs={6}>
                                  <TextField
                                    required
                                    label="Account name"
                                    type="text"
                                    name="name"
                                    variant="outlined"
                                    fullWidth
                                  />
                                </Grid>
                                <Grid item xs={6}>
                                  <Select
                                    native
                                    name="currency"
                                    label="Currency"
                                    variant="outlined"
                                    fullWidth
                                  >
                                    <option value="CHF">CHF</option>
                                    <option value="EUR">EUR</option>
                                    <option value="USD">USD</option>
                                    <option value="BTC">BTC</option>
                                    <option value="ETH">ETH</option>
                                  </Select>
                                </Grid>
                              </Grid>
                              <Grid container spacing={2}>
                                <Grid item xs={6}>
                                  {fiat.includes(values.currency) && (
                                    <TextField
                                      label="Account number"
                                      variant="outlined"
                                      name="iban"
                                      fullWidth
                                    />
                                  )}
                                  {crypto.includes(values.currency) && (
                                    <TextField
                                      label="Account number"
                                      variant="outlined"
                                      name="publicAddress"
                                      fullWidth
                                    />
                                  )}
                                </Grid>
                                <Grid item xs={6}>
                                  <TextField
                                    label="Initial balance"
                                    type="number"
                                    variant="outlined"
                                    name="balance"
                                    fieldProps={{
                                      parse: (value) => parseInt(value, 10),
                                    }}
                                    fullWidth
                                  />
                                </Grid>
                              </Grid>
                            </DialogContent>
                            <Divider />
                            <DialogActions>
                              <Button
                                onClick={handleDeclareAccountModalClose}
                                variant="contained"
                              >
                                Cancel
                              </Button>
                              <div className={classes.progressButtonWrapper}>
                                <Button
                                  variant="contained"
                                  color="primary"
                                  type="submit"
                                  disabled={creatingAccount}
                                >
                                  Create account
                                </Button>
                                {creatingAccount && (
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
                  </Grid>
                  <Grid item>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        setCryptoAdrDlgView(true);
                      }}
                    >
                      <AddIcon fontSize="small" />
                      New Crypto Address
                    </Button>
                    <Dialog
                      open={cryptoAdrDlgView}
                      onClose={() => {
                        setCryptoAdrDlgView(false);
                      }}
                      aria-labelledby="form-dialog-title"
                    >
                      <Form
                        onSubmit={onSubmitCryptoAdr}
                        validate={cryptoAddressFormvalidate}
                        initialValues={{
                          name: "",
                          currency: "BTC"
                        }}
                        render={({ handleSubmit, pristine }) => (
                          <form onSubmit={handleSubmit} noValidate>
                            <DialogTitle id="form-dialog-title">
                              New Crypto Address
                            </DialogTitle>
                            <Divider />
                            <DialogContent>
                              <Grid container spacing={2}>
                                <Grid item xs={6}>
                                  <TextField
                                    required
                                    label="Account name"
                                    type="text"
                                    name="name"
                                    variant="outlined"
                                    fullWidth
                                  />
                                </Grid>
                                <Grid item xs={6}>
                                  <Select
                                    native
                                    name="currency"
                                    label="Type"
                                    variant="outlined"
                                    fullWidth
                                  >
                                    <option value="BTC">Bitcoin</option>
                                    <option value="ETH">Ethereum</option>
                                  </Select>
                                </Grid>
                              </Grid>
                            </DialogContent>
                            <Divider />
                            <DialogActions>
                              <Button
                                onClick={() => {
                                  setCryptoAdrDlgView(false);
                                }}
                                variant="contained"
                              >
                                Cancel
                              </Button>
                              <div className={classes.progressButtonWrapper}>
                                <Button
                                  variant="contained"
                                  color="primary"
                                  type="submit"
                                  disabled={creatingCryptoAdr || pristine}
                                >
                                  Create
                                </Button>
                                {creatingCryptoAdr && (
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
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          {loadingAccounts && <Loader />}
          {!loadingAccounts && (
            <Grid item xs={12}>
              <MaterialTable
                columns={columns}
                data={accounts.map((acc: any) => ({ ...acc }))}
                options={{
                  pageSize: 10,
                  search: true,
                  showTitle: false,
                }}
              />
            </Grid>
          )}
        </Grid>
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

export default NostroAccounts;
