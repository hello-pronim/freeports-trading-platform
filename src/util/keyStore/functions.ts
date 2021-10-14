import {
  decryptMegolmKeyFile,
  encryptMegolmKeyFile,
  readFileAsArrayBuffer,
} from "./MegolmExportEncryption";
import {
  open,
  saveKey,
  getKey,
  listKeys,
  close,
  SavedKeyObject,
} from "./keystore";

const algorithmName = "ECDSA";
const usages: Array<KeyUsage> = ["sign", "verify"];
const params = { name: algorithmName, namedCurve: "P-256" };
const arrayBufferToBase64 = (arrayBuffer: ArrayBuffer): string => {
  const byteArray = new Uint8Array(arrayBuffer);
  let byteString = "";
  for (let i = 0; i < byteArray.byteLength; i += 1) {
    byteString += String.fromCharCode(byteArray[i]);
  }
  const b64 = window.btoa(byteString);

  return b64;
};

const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i += 1) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

const createDataUrlFromByteArray = (byteArray: Uint8Array): string => {
  let binaryString = "";

  for (let i = 0; i < byteArray.byteLength; i += 1) {
    binaryString += String.fromCharCode(byteArray[i]);
  }
  const exportedAsBase64 = window.btoa(binaryString);

  const pemExported = `-----BEGIN PUBLIC KEY-----\n${exportedAsBase64}\n-----END PUBLIC KEY-----`;

  return `data:application/octet-stream;base64,${btoa(pemExported)}`;
};

/*
Convert a string into an ArrayBuffer
from https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
*/
function str2ab(str: string) {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  // eslint-disable-next-line no-plusplus
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

function spki2String(byteArray: Uint8Array): string {
  let binaryString = "";

  for (let i = 0; i < byteArray.byteLength; i += 1) {
    binaryString += String.fromCharCode(byteArray[i]);
  }
  const exportedAsBase64 = window.btoa(binaryString);
  return exportedAsBase64;
}

async function publicKeyToString(key: CryptoKey): Promise<string> {
  const spki = await window.crypto.subtle.exportKey("spki", key);
  return spki2String(new Uint8Array(spki));
}
const downloadString = (
  text: ArrayBufferLike,
  fileType: string,
  fileName: string
): void => {
  const blob = new Blob([text], { type: fileType });

  const a = document.createElement("a");
  a.download = fileName;
  a.href = URL.createObjectURL(blob);
  a.dataset.downloadurl = [fileType, a.download, a.href].join(":");
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
  }, 1500);
};

const generatePublicKeyFromPrivateKey = async (
  privateKey: CryptoKey
): Promise<CryptoKey> => {
  // export private key to JWK
  const jwk = await crypto.subtle.exportKey("jwk", privateKey);

  // remove private data from JWK
  delete jwk.d;
  delete jwk.dp;
  delete jwk.dq;
  delete jwk.q;
  delete jwk.qi;
  jwk.key_ops = ["verify"];

  // import public key
  const publicKey = await crypto.subtle.importKey("jwk", jwk, params, true, [
    "verify",
  ]);
  console.log("derived public key ", publicKey);

  return publicKey;
};
const importPrivateKeyFromFile = async (
  importedFile: File,
  importKeyPassword: string
): Promise<SavedKeyObject> => {
  const arrayBuffer = await readFileAsArrayBuffer(importedFile);
  const decryptedKey = await decryptMegolmKeyFile(
    arrayBuffer,
    importKeyPassword
  );

  console.log("decrypted key", decryptedKey);
  const keyArrayBuffer = base64ToArrayBuffer(decryptedKey);
  const format = "pkcs8";

  const privateKeyExtractable = await window.crypto.subtle.importKey(
    format,
    keyArrayBuffer,
    params,
    true,
    ["sign"]
  );

  const publicKey = await generatePublicKeyFromPrivateKey(
    privateKeyExtractable
  );

  const privateKey = await window.crypto.subtle.importKey(
    format,
    keyArrayBuffer,
    params,
    true,
    ["sign"]
  );

  // await open();
  // const results = await saveKey(publicKey, privateKey, importedFile.name);

  // await close();
  return { publicKey, privateKey, name: importedFile.name };
};

const generateKeyPair = async (
  name: string,
  passphrase: string
): Promise<SavedKeyObject | undefined> => {
  const keyPair = await crypto.subtle.generateKey(params, true, usages);
  if (keyPair.privateKey) {
    const keyArrayBuffer = await window.crypto.subtle.exportKey(
      "pkcs8",
      keyPair.privateKey
    );
    const exportedAsBase64 = arrayBufferToBase64(keyArrayBuffer);
    console.log("exported key ", exportedAsBase64, passphrase);
    const encryptedKey = await encryptMegolmKeyFile(
      exportedAsBase64,
      passphrase,
      {}
    );

    downloadString(encryptedKey, "pem", name);

    const privateKey = await window.crypto.subtle.importKey(
      "pkcs8",
      keyArrayBuffer,
      params,
      false,
      ["sign"]
    );

    console.log("generatePublicKeyFromPrivateKey ");
    const publicKey = await generatePublicKeyFromPrivateKey(keyPair.privateKey);
    return { publicKey, privateKey, name };
  }
  return undefined;
};

const escapeHTML = (s: string): string => {
  return s
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
};

export {
  arrayBufferToBase64 as default,
  arrayBufferToBase64,
  base64ToArrayBuffer,
  createDataUrlFromByteArray,
  downloadString,
  escapeHTML,
  importPrivateKeyFromFile,
  generateKeyPair,
  generatePublicKeyFromPrivateKey,
  str2ab,
  spki2String,
  publicKeyToString,
};
