import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Snackbar } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import { useAuth } from "../../hooks";
import {
  open,
  listKeys,
  close,
  SavedKeyObject,
} from "../../util/keyStore/keystore";
import { globalActions } from "../../slice";
import { selectKeyList } from "../../slice/selectors";
import {
  publicKeyToString,
} from "../../util/keyStore/functions";
import messages from "./messages";

const CertificationBanner = (): React.ReactElement => {
  const dispatch = useDispatch();
  const [showBanner, setShowBanner] = useState(true);
  const [bannerMessage, setBannerMessage] = useState('');
  const { isAuthenticated, checkPublicKey } = useAuth();
  const keyList = useSelector(selectKeyList);

  useEffect(() => {
    const getKeyList = async () => {
      await open();
      await listKeys()
        .then((list) => {
          const storedKeyList: Array<SavedKeyObject> = [];
          list.forEach((item: { id: number; value: SavedKeyObject }) =>
            storedKeyList.push(item.value)
          );
          dispatch(globalActions.setKeyList(storedKeyList));
        })
        .catch((err) => {
          alert(`Could not list keys: ${err.message}`);
        });
      await close();
    };

    getKeyList();
  }, []);

  const displayBanner = async () => {
    let remoteKey = '';
    const res = await checkPublicKey();
    if(res.success) {
      remoteKey = res.data;
    }

    if(!keyList.length && !remoteKey) {
      setShowBanner(true);
      setBannerMessage(messages.key_not_created);
    } else if(!keyList.length && remoteKey) {
      setShowBanner(true);
      setBannerMessage(messages.missing_browser_key);
    } else if(keyList.length && remoteKey) {
      const localKey = await publicKeyToString(keyList[0].publicKey);
      if(localKey !== remoteKey) {
        setShowBanner(true);
        setBannerMessage(messages.key_mismatch);
      }
    }
  }

  useEffect(() => {
    setShowBanner(false);
    setBannerMessage(``);

    if(isAuthenticated) {
      displayBanner();
    }
  }, [isAuthenticated, keyList]);

  const onCloseBanner = () => {
    setShowBanner(false);
  };

  return (
    <Snackbar open={showBanner}>
      <Alert
        onClose={onCloseBanner}
        severity="warning"
        variant="filled"
      >
        {bannerMessage}
      </Alert>
    </Snackbar>
  );
};

export default CertificationBanner;
