import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Form } from "react-final-form";
import arrayMutators from "final-form-arrays";
import { TextField, Select } from "mui-rff";
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
  Theme,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";
import red from "@material-ui/core/colors/red";
import MaterialTable from "material-table";

import { useAccountsSlice } from "./slice";
import { selectAccounts } from "./slice/selectors";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    actionButton: { marginRight: theme.spacing(2) },
    deleteButton: { color: red[500] },
    link: {
      color: theme.palette.primary.main,
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

const NostroAccounts = (): React.ReactElement => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { actions } = useAccountsSlice();
  const accounts = useSelector(selectAccounts);
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
  const crypto: Array<string> = ["BTC", "ETHER"];

  const handleDeclareAccountModalOpen = () => {
    setDeclareAccountModalOpen(true);
  };

  const handleDeclareAccountModalClose = () => {
    setDeclareAccountModalOpen(false);
  };

  useEffect(() => {
    dispatch(actions.getAccounts());
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

        return (
          <Link to={`nostro-accounts/${id}`} className={classes.link}>
            {name}
          </Link>
        );
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
          >
            <DeleteIcon />
          </IconButton>
        );
      },
    },
  ];

  return (
    <div className="main-wrapper">
      <Container>
        <Grid container spacing={3}>
          <Grid container item justify="flex-end" xs={12}>
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
                              <option value="ETHER">ETHER</option>
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
                        <Button
                          variant="contained"
                          color="primary"
                          type="submit"
                          disabled={submitting || pristine}
                        >
                          Create account
                        </Button>
                      </DialogActions>
                    </form>
                  )}
                />
              </Dialog>
            </Grid>
            <Grid item>
              <Button variant="contained" color="primary">
                <AddIcon fontSize="small" />
                New Crypto Address
              </Button>
            </Grid>
          </Grid>
          <Grid container>
            <Grid item xs={12}>
              <MaterialTable
                columns={columns}
                data={accounts.map((acc: any) => ({ ...acc }))}
                title="NOSTRO ACCOUNTS"
                options={{
                  search: true,
                  pageSize: 10,
                }}
              />
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default NostroAccounts;
