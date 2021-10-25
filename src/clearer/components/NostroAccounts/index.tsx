/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState } from "react";
import Lockr from "lockr";
import { Link } from "react-router-dom";
import { Form, Field } from "react-final-form";
import arrayMutators from "final-form-arrays";
import { TextField, Select, Radios } from "mui-rff";
import { useSelector, useDispatch } from "react-redux";
import {
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormGroup,
  FormLabel,
  Grid,
  IconButton,
  CircularProgress,
  Theme,
  Typography,
} from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import Lock from "@mui/icons-material/Lock";
import MaterialTable from "material-table";
import { red } from "@mui/material/colors";
import { useAccountsSlice } from "./slice";

import {
  selectAccounts,
  selectIsAccountsLoading,
  selectIsAccountCreating,
  selectIsAccountDeleting,
} from "./slice/selectors";
import Loader from "../../../components/Loader";
import vault, { VaultPermissions } from "../../../vault";
import { VaultAssetType } from "../../../vault/enum/asset-type";
import { PermissionOwnerType } from "../../../vault/enum/permission-owner-type";
import { selectClearerSettings } from "../Settings/slice/selectors";
import { useClearerSettingsSlice } from "../Settings/slice";
import { selectUser } from "../../../slice/selectors";
import { snackbarActions } from "../../../components/Snackbar/slice";
import { useRole } from "../../../hooks";
import PatchedPagination from "../../../util/patchedPagination";

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
    permissionContainer: {
      padding: theme.spacing(2),
    },
    permissionName: {
      fontWeight: "bold",
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
  const clearerSettings = useSelector(selectClearerSettings);
  const { actions: clearerSettingsActions } = useClearerSettingsSlice();
  const currentUser = useSelector(selectUser);
  const [lockModalView, setLockModalView] = useState(false);
  const [lockPermissions, setLockPermissions] = useState<any>({
    execution: [],
    getWalletDetails: [],
    transaction: [],
    wCreateDeleteRuleTree: [],
    wGetRuleTrees: [],
    signMessage: [],
  });
  const [lockModalProcessing, setLockModalProcessing] = useState(false);
  const [lockingAccount, setLockingAccount] = useState<any>({
    name: "",
    vaultWalletId: ""
  });
  const { retrieveRoles } = useRole();
  const [roles, setRoles] = useState([] as any[]);

  const handleDeclareAccountModalOpen = () => {
    setDeclareAccountModalOpen(true);
  };

  const handleDeclareAccountModalClose = () => {
    setDeclareAccountModalOpen(false);
  };

  useEffect(() => {
    let unmounted = false;

    const init = async () => {
      if (!unmounted) {
        const rolesList = await retrieveRoles();
        setRoles(rolesList);
        dispatch(actions.getAccounts());
        dispatch(clearerSettingsActions.retrieveClearerSettings());
      }
    };

    init();

    return () => {
      unmounted = true;
    };
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
    } catch (error) {
      dispatch(
        snackbarActions.showSnackbar({
          message: error.message,
          type: "error",
        })
      );
    }
    setCreatingCryptoAdr(false);
  };

  const openLockModal = async (accnt: accountType) => {
    setLockingAccount(accnt);
    try {
      await vault.authenticate(clearerSettings.vaultOrganizationId);
      const request2 = await vault.getAssetPermissions(
        VaultAssetType.WALLET,
        accnt.vaultWalletId as string,
        true
      );
      const permissions2 = await vault.sendRequest(request2);
      vault.clearToken();

      const execution: string[] = [];
      const getWalletDetails: string[] = [];
      const transaction: string[] = [];
      const wCreateDeleteRuleTree: string[] = [];
      const wGetRuleTrees: string[] = [];
      const signMessage: string[] = [];
      permissions2.groupPermissions.forEach((x: any) => {
        switch (x.permissionType) {
          case VaultPermissions.Execution:
            execution.push(x.groupId);
            break;
          case VaultPermissions.GetWalletDetails:
            getWalletDetails.push(x.groupId);
            break;
          case VaultPermissions.Transaction:
            transaction.push(x.groupId);
            break;
          case VaultPermissions.CreateDeleteRuleTree:
            wCreateDeleteRuleTree.push(x.groupId);
            break;
          case VaultPermissions.GetRuleTrees:
            wGetRuleTrees.push(x.groupId);
            break;
          case VaultPermissions.SignMessage:
            signMessage.push(x.groupId);
            break;
          default:
            break;
        }
      });

      setLockPermissions({
        execution,
        getWalletDetails,
        transaction,
        wCreateDeleteRuleTree,
        wGetRuleTrees,
        signMessage,
      });
      setLockModalView(true);
    } catch (error) {
      dispatch(
        snackbarActions.showSnackbar({
          message: error.message,
          type: "error",
        })
      );
    }
  };

  const handleLockPermission = async (values: any) => {
    setLockModalProcessing(true);
    try {
      await vault.authenticate(clearerSettings.vaultOrganizationId);
      
      const executionOld = [...lockPermissions.execution];
      const executionNew: string[] = [];
      values.execution.forEach((x: string) => {
        const index = executionOld.indexOf(x);
        if (index !== -1) {
          executionOld.splice(index, 1);
        } else {
          executionNew.push(x);
        }
      });
      await Promise.all(
        executionOld.map(async (vaultGroupId: string) => {
          const request = await vault.revokePermissionFromAsset(
            VaultAssetType.WALLET,
            lockingAccount.vaultWalletId,
            PermissionOwnerType.group,
            vaultGroupId,
            VaultPermissions.Execution,
            true
          );
          await vault.sendRequest(request);
        })
      );
      await Promise.all(
        executionNew.map(async (vaultGroupId: string) => {
          const request = await vault.grantPermissionToAsset(
            VaultAssetType.WALLET,
            lockingAccount.vaultWalletId,
            PermissionOwnerType.group,
            vaultGroupId,
            VaultPermissions.Execution,
            true
          );
          await vault.sendRequest(request);
        })
      );

      const getWalletDetailsOld = [...lockPermissions.getWalletDetails];
      const getWalletDetailsNew: string[] = [];
      values.getWalletDetails.forEach((x: string) => {
        const index = getWalletDetailsOld.indexOf(x);
        if (index !== -1) {
          getWalletDetailsOld.splice(index, 1);
        } else {
          getWalletDetailsNew.push(x);
        }
      });
      await Promise.all(
        getWalletDetailsOld.map(async (vaultGroupId: string) => {
          const request = await vault.revokePermissionFromAsset(
            VaultAssetType.WALLET,
            lockingAccount.vaultWalletId,
            PermissionOwnerType.group,
            vaultGroupId,
            VaultPermissions.GetWalletDetails,
            true
          );
          await vault.sendRequest(request);
        })
      );
      await Promise.all(
        getWalletDetailsNew.map(async (vaultGroupId: string) => {
          const request = await vault.grantPermissionToAsset(
            VaultAssetType.WALLET,
            lockingAccount.vaultWalletId,
            PermissionOwnerType.group,
            vaultGroupId,
            VaultPermissions.GetWalletDetails,
            true
          );
          await vault.sendRequest(request);
        })
      );

      const transactionOld = [...lockPermissions.transaction];
      const transactionNew: string[] = [];
      values.transaction.forEach((x: string) => {
        const index = transactionOld.indexOf(x);
        if (index !== -1) {
          transactionOld.splice(index, 1);
        } else {
          transactionNew.push(x);
        }
      });
      await Promise.all(
        transactionOld.map(async (vaultGroupId: string) => {
          const request = await vault.revokePermissionFromAsset(
            VaultAssetType.WALLET,
            lockingAccount.vaultWalletId,
            PermissionOwnerType.group,
            vaultGroupId,
            VaultPermissions.Transaction,
            true
          );
          await vault.sendRequest(request);
        })
      );
      await Promise.all(
        transactionNew.map(async (vaultGroupId: string) => {
          const request = await vault.grantPermissionToAsset(
            VaultAssetType.WALLET,
            lockingAccount.vaultWalletId,
            PermissionOwnerType.group,
            vaultGroupId,
            VaultPermissions.Transaction,
            true
          );
          await vault.sendRequest(request);
        })
      );

      const wCreateDeleteRuleTreeOld = [
        ...lockPermissions.wCreateDeleteRuleTree,
      ];
      const wCreateDeleteRuleTreeNew: string[] = [];
      values.wCreateDeleteRuleTree.forEach((x: string) => {
        const index = wCreateDeleteRuleTreeOld.indexOf(x);
        if (index !== -1) {
          wCreateDeleteRuleTreeOld.splice(index, 1);
        } else {
          wCreateDeleteRuleTreeNew.push(x);
        }
      });
      await Promise.all(
        wCreateDeleteRuleTreeOld.map(async (vaultGroupId: string) => {
          const request = await vault.revokePermissionFromAsset(
            VaultAssetType.WALLET,
            lockingAccount.vaultWalletId,
            PermissionOwnerType.group,
            vaultGroupId,
            VaultPermissions.CreateDeleteRuleTree,
            true
          );
          await vault.sendRequest(request);
        })
      );
      await Promise.all(
        wCreateDeleteRuleTreeNew.map(async (vaultGroupId: string) => {
          const request = await vault.grantPermissionToAsset(
            VaultAssetType.WALLET,
            lockingAccount.vaultWalletId,
            PermissionOwnerType.group,
            vaultGroupId,
            VaultPermissions.CreateDeleteRuleTree,
            true
          );
          await vault.sendRequest(request);
        })
      );

      const wGetRuleTreesOld = [...lockPermissions.wGetRuleTrees];
      const wGetRuleTreesNew: string[] = [];
      values.wGetRuleTrees.forEach((x: string) => {
        const index = wGetRuleTreesOld.indexOf(x);
        if (index !== -1) {
          wGetRuleTreesOld.splice(index, 1);
        } else {
          wGetRuleTreesNew.push(x);
        }
      });
      await Promise.all(
        wGetRuleTreesOld.map(async (vaultGroupId: string) => {
          const request = await vault.revokePermissionFromAsset(
            VaultAssetType.WALLET,
            lockingAccount.vaultWalletId,
            PermissionOwnerType.group,
            vaultGroupId,
            VaultPermissions.GetRuleTrees,
            true
          );
          await vault.sendRequest(request);
        })
      );
      await Promise.all(
        wGetRuleTreesNew.map(async (vaultGroupId: string) => {
          const request = await vault.grantPermissionToAsset(
            VaultAssetType.WALLET,
            lockingAccount.vaultWalletId,
            PermissionOwnerType.group,
            vaultGroupId,
            VaultPermissions.GetRuleTrees,
            true
          );
          await vault.sendRequest(request);
        })
      );

      const signMessageOld = [...lockPermissions.signMessage];
      const signMessageNew: string[] = [];
      values.signMessage.forEach((x: string) => {
        const index = signMessageOld.indexOf(x);
        if (index !== -1) {
          signMessageOld.splice(index, 1);
        } else {
          signMessageNew.push(x);
        }
      });
      await Promise.all(
        signMessageOld.map(async (vaultGroupId: string) => {
          const request = await vault.revokePermissionFromAsset(
            VaultAssetType.WALLET,
            lockingAccount.vaultWalletId,
            PermissionOwnerType.group,
            vaultGroupId,
            VaultPermissions.SignMessage,
            true
          );
          await vault.sendRequest(request);
        })
      );
      await Promise.all(
        signMessageNew.map(async (vaultGroupId: string) => {
          const request = await vault.grantPermissionToAsset(
            VaultAssetType.WALLET,
            lockingAccount.vaultWalletId,
            PermissionOwnerType.group,
            vaultGroupId,
            VaultPermissions.SignMessage,
            true
          );
          await vault.sendRequest(request);
        })
      );

      vault.clearToken();

      dispatch(
        snackbarActions.showSnackbar({
          message: "Successfully updated!",
          type: "success",
        })
      );
      setLockModalView(false);
    } catch (error) {
      dispatch(
        snackbarActions.showSnackbar({
          message: error.message,
          type: "error",
        })
      );
    }
    setLockModalProcessing(false);
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
        const { id, type } = rowData;
        return (
          <>
            {type === "crypto" && (
              <IconButton
                style={{ padding: 0 }}
                onClick={() => {
                  openLockModal(rowData);
                }}
                disabled={
                  !vault.checkUserLockUsability(currentUser)
                }
                size="large"
              >
                <Lock fontSize="medium" />
              </IconButton>
            )}
            <IconButton
              style={{ padding: 0 }}
              className={classes.deleteButton}
              onClick={() => handleAccountDelete(id)}
              disabled={deletingAccount}
              size="large"
            >
              <DeleteIcon />
            </IconButton>
          </>
        );
      },
    },
  ];

  return (
    <div className="main-wrapper">
      <Container>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Grid container justifyContent="space-between">
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
                          currency: "BTC",
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
                components={{ Pagination: PatchedPagination }}
              />
            </Grid>
          )}
        </Grid>
      </Container>
      <Dialog
        open={lockModalView}
        onClose={() => {
          setLockModalView(false);
        }}
        aria-labelledby="form-dialog-title"
      >
        <Form
          onSubmit={handleLockPermission}
          initialValues={lockPermissions}
          render={({ handleSubmit }) => (
            <form onSubmit={handleSubmit} noValidate>
              <DialogTitle id="form-dialog-title">
                Unlock Permissions ({lockingAccount.name})
              </DialogTitle>
              <Divider />
              <DialogContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormGroup className={classes.permissionContainer}>
                      <FormLabel
                        component="legend"
                        className={classes.permissionName}
                      >
                        Execution
                      </FormLabel>
                      <Grid container>
                        {roles.filter(x=>x.vaultType === "organization").map((x) => (
                            <Grid item key={x.vaultGroupId} xs={2}>
                              <Grid container alignItems="center" spacing={1}>
                                <Grid item>
                                  <Field
                                    name="execution[]"
                                    component="input"
                                    type="checkbox"
                                    value={x.vaultGroupId}
                                  />
                                </Grid>
                                <Grid item>
                                  <Typography variant="body1">
                                    {x.name}
                                  </Typography>
                                </Grid>
                              </Grid>
                            </Grid>
                          ))}
                      </Grid>
                    </FormGroup>
                  </Grid>
                  <Grid item xs={12}>
                    <FormGroup className={classes.permissionContainer}>
                      <FormLabel
                        component="legend"
                        className={classes.permissionName}
                      >
                        GetWalletDetails
                      </FormLabel>
                      <Grid container>
                        {roles.filter(x=>x.vaultType === "organization").map((x) => (
                            <Grid item key={x.vaultGroupId} xs={2}>
                              <Grid container alignItems="center" spacing={1}>
                                <Grid item>
                                  <Field
                                    name="getWalletDetails[]"
                                    component="input"
                                    type="checkbox"
                                    value={x.vaultGroupId}
                                  />
                                </Grid>
                                <Grid item>
                                  <Typography variant="body1">
                                    {x.name}
                                  </Typography>
                                </Grid>
                              </Grid>
                            </Grid>
                          ))}
                      </Grid>
                    </FormGroup>
                  </Grid>
                  <Grid item xs={12}>
                    <FormGroup className={classes.permissionContainer}>
                      <FormLabel
                        component="legend"
                        className={classes.permissionName}
                      >
                        Transaction
                      </FormLabel>
                      <Grid container>
                        {roles.filter(x=>x.vaultType === "organization").map((x) => (
                            <Grid item key={x.vaultGroupId} xs={2}>
                              <Grid container alignItems="center" spacing={1}>
                                <Grid item>
                                  <Field
                                    name="transaction[]"
                                    component="input"
                                    type="checkbox"
                                    value={x.vaultGroupId}
                                  />
                                </Grid>
                                <Grid item>
                                  <Typography variant="body1">
                                    {x.name}
                                  </Typography>
                                </Grid>
                              </Grid>
                            </Grid>
                          ))}
                      </Grid>
                    </FormGroup>
                  </Grid>
                  <Grid item xs={12}>
                    <FormGroup className={classes.permissionContainer}>
                      <FormLabel
                        component="legend"
                        className={classes.permissionName}
                      >
                        Create Rules (CreateDeleteRuleTree)
                      </FormLabel>
                      <Grid container>
                        {roles.filter(x=>x.vaultType === "organization").map((x) => (
                            <Grid item key={x.vaultGroupId} xs={2}>
                              <Grid container alignItems="center" spacing={1}>
                                <Grid item>
                                  <Field
                                    name="wCreateDeleteRuleTree[]"
                                    component="input"
                                    type="checkbox"
                                    value={x.vaultGroupId}
                                  />
                                </Grid>
                                <Grid item>
                                  <Typography variant="body1">
                                    {x.name}
                                  </Typography>
                                </Grid>
                              </Grid>
                            </Grid>
                          ))}
                      </Grid>
                    </FormGroup>
                  </Grid>
                  <Grid item xs={12}>
                    <FormGroup className={classes.permissionContainer}>
                      <FormLabel
                        component="legend"
                        className={classes.permissionName}
                      >
                        Display Rules (GetRuleTrees)
                      </FormLabel>
                      <Grid container>
                        {roles.filter(x=>x.vaultType === "organization").map((x) => (
                            <Grid item key={x.vaultGroupId} xs={2}>
                              <Grid container alignItems="center" spacing={1}>
                                <Grid item>
                                  <Field
                                    name="wGetRuleTrees[]"
                                    component="input"
                                    type="checkbox"
                                    value={x.vaultGroupId}
                                  />
                                </Grid>
                                <Grid item>
                                  <Typography variant="body1">
                                    {x.name}
                                  </Typography>
                                </Grid>
                              </Grid>
                            </Grid>
                          ))}
                      </Grid>
                    </FormGroup>
                  </Grid>
                  <Grid item xs={12}>
                    <FormGroup className={classes.permissionContainer}>
                      <FormLabel
                        component="legend"
                        className={classes.permissionName}
                      >
                        SignMessage
                      </FormLabel>
                      <Grid container>
                        {roles.filter(x=>x.vaultType === "organization").map((x) => (
                            <Grid item key={x.vaultGroupId} xs={2}>
                              <Grid container alignItems="center" spacing={1}>
                                <Grid item>
                                  <Field
                                    name="signMessage[]"
                                    component="input"
                                    type="checkbox"
                                    value={x.vaultGroupId}
                                  />
                                </Grid>
                                <Grid item>
                                  <Typography variant="body1">
                                    {x.name}
                                  </Typography>
                                </Grid>
                              </Grid>
                            </Grid>
                          ))}
                      </Grid>
                    </FormGroup>
                  </Grid>
                </Grid>
              </DialogContent>
              <Divider />
              <DialogActions>
                <Button
                  onClick={() => {
                    setLockModalView(false);
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
                    disabled={lockModalProcessing}
                  >
                    Save
                  </Button>
                  {lockModalProcessing && (
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

export default NostroAccounts;
