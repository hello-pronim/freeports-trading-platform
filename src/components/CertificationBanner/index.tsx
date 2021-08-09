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
import { selectKeyList, selectRemoteKey } from "../../slice/selectors";
import {
  publicKeyToString,
} from "../../util/keyStore/functions";
import messages from "./messages";
import { userPublicKeyStatus } from "../../util/constants";

const CertificationBanner = (): React.ReactElement => {
  const dispatch = useDispatch();
  const [showBanner, setShowBanner] = useState(true);
  const [bannerMessage, setBannerMessage] = useState('');
  const { isAuthenticated, checkPublicKey } = useAuth();
  const keyList = useSelector(selectKeyList);
  const remoteKey = useSelector(selectRemoteKey);

  useEffect(() => {
    const getCertification = async () => {
      const storedKeyList: Array<SavedKeyObject> = [];
      await open();
      await listKeys()
        .then((list) => {
          list.forEach((item: { id: number; value: SavedKeyObject }) =>
            storedKeyList.push(item.value)
          );
        })
        .catch((err) => {
          alert(`Could not list keys: ${err.message}`);
        });
      await close();

      const res = await checkPublicKey();
      dispatch(globalActions.setCertification({
        keyList: storedKeyList, 
        remoteKey: res.success ? res.data : null
      }));
    };

    getCertification();
  }, []);

  const displayBanner = async () => {
    let remoteKeyStr = '';
    if(remoteKey && remoteKey.status !== userPublicKeyStatus.revoked) {
      remoteKeyStr = remoteKey.key;
    }
    
    if(!keyList.length && !remoteKeyStr) {
      setShowBanner(true);
      setBannerMessage(messages.key_not_created);
    } else if(!keyList.length && remoteKeyStr) {
      setShowBanner(true);
      setBannerMessage(messages.missing_browser_key);
    } else if(keyList.length && remoteKeyStr) {
      const localKey = await publicKeyToString(keyList[0].publicKey);
      if(localKey !== remoteKeyStr) {
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
  }, [isAuthenticated, keyList, remoteKey]);

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
