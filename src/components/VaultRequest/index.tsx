/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Avatar,
  Button,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  makeStyles,
  Snackbar,
  TextField,
  Typography,
} from "@material-ui/core";
import MuiAlert, { AlertProps } from "@material-ui/lab/Alert";
import { Form } from "react-final-form";
import { TextField as MuiTextField, Select } from "mui-rff";
import { useVaultRequestSlice } from "./slice";
import {
  selectError,
  selectLoading,
  selectRequest,
  selectResponse,
} from "./slice/selectors";

import { open, close, clearKey, saveKey } from "../../util/keyStore/keystore";
import {
  generateKeyPair,
  importPrivateKeyFromFile,
  publicKeyToString,
} from "../../util/keyStore/functions";

import { selectKeyList, selectRemoteKey } from "../../slice/selectors";
import { globalActions } from "../../slice";
import { Method } from "../../services/vaultService";

const useStyles = makeStyles((theme) => ({}));

const VaultRequest = (): React.ReactElement => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { actions } = useVaultRequestSlice();
  const response = useSelector(selectResponse);
  const vaultError = useSelector(selectError);
  const loading = useSelector(selectLoading);

  const validate = (values: any) => {
    const errors: { [key: string]: string } = {};

    if (values.body) {
      try {
        JSON.parse(values.body);
      } catch (error) {
        errors.body = "Body must be a valid JSON";
      }
    }
    if (!values.path) {
      errors.path = "Path is required";
    }
    return errors;
  };
  const handleOnSubmit = (values: any) => {
    console.log("values ", values);
    const body = JSON.parse(values.body || "{}");
    dispatch(
      actions.sendRequest({
        method: values.method,
        path: values.path,
        body,
      })
    );
  };
  return (
    <div className="main-wrapper">
      <Container>
        <Card>
          <CardHeader title="Make a request to the Vault" />
          <Divider />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Form
                  onSubmit={handleOnSubmit}
                  initialValues={{ method: Method.GET }}
                  validate={validate}
                  render={({
                    handleSubmit,
                    submitting,
                    pristine,
                    form,
                    values,
                  }) => (
                    <form onSubmit={handleSubmit} noValidate>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <Select
                            native
                            name="method"
                            fullWidth
                            label="Method"
                            variant="outlined"
                            required
                          >
                            {Object.keys(Method).map((method) => (
                              <option key={method} value={method}>
                                {method}
                              </option>
                            ))}
                          </Select>
                        </Grid>
                        <Grid item xs={12}>
                          <MuiTextField
                            required
                            id="path"
                            name="path"
                            type="text"
                            label="path /api/v1:"
                            variant="outlined"
                            fullWidth
                          />
                        </Grid>

                        {values.method === Method.POST && (
                          <Grid item xs={12}>
                            <MuiTextField
                              id="vault-request-body"
                              label="Body"
                              multiline
                              rows={8}
                              variant="outlined"
                              name="body"
                            />
                          </Grid>
                        )}

                        <Grid item xs={12}>
                          <Button
                            color="primary"
                            variant="contained"
                            type="submit"
                          >
                            Send
                          </Button>
                        </Grid>
                      </Grid>
                    </form>
                  )}
                />
              </Grid>
              <Grid item xs={6} spacing={2}>
                <CardHeader title="Response" />
                {loading && <CircularProgress size={24} />}
                {!loading && response && (
                  <pre>{JSON.stringify(response, null, 2)}</pre>
                )}
                {!loading && vaultError && (
                  <Grid item>
                    <pre>{vaultError.status}</pre>
                    <pre>{vaultError.message}</pre>
                    <pre>{JSON.stringify(vaultError.response?.data)}</pre>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
};

export default VaultRequest;
