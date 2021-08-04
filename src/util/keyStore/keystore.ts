// Key Storage with Web Cryptography API
//
// Copyright 2014 Info Tech, Inc.
// Provided under the MIT license.
// See LICENSE file for details.

// Saves cryptographic key pairs in IndexedDB.

// The only global name in this library is openKeyStore.
// openKeyStore takes no parameters, and returns a Promise.
// If the key storage database can be opened, the promise
// is fulfilled with the value of a key store object. If
// it cannot be opened, it is rejected with an Error.
//
// The key store object has methods getKey, saveKey, listKeys
// to manage stored keys, and close, to close the key storage
// database, freeing it for other code to use.
//
// The key storage database name is hard coded as KeyStore. It
// uses one object store, called keys.
//
import vault from "../../vault";

let db: any = null;
const dbName = "KeyStore";
const objectStoreName = "keys";

const open = (): Promise<any> => {
  return new Promise((fulfill, reject) => {
    if (!window.indexedDB) {
      reject(new Error("IndexedDB is not supported by this browser."));
    }

    const req: IDBOpenDBRequest = indexedDB.open(dbName, 1);
    req.onsuccess = (evt: any) => {
      db = evt.target.result;
      fulfill(this);
    };
    req.onerror = (evt: any) => {
      reject(evt.error);
    };
    req.onblocked = () => {
      reject(new Error("Database already open"));
    };

    // If the database is being created or upgraded to a new version,
    // see if the object store and its indexes need to be created.
    req.onupgradeneeded = (evt: any) => {
      db = evt.target.result;
      if (!db.objectStoreNames.contains(objectStoreName)) {
        const objStore = db.createObjectStore(objectStoreName, {
          autoIncrement: true,
        });
        objStore.createIndex("name", "name", { unique: false });
        objStore.createIndex("spki", "spki", { unique: false });
      }
    };
  });
};
// close method
//
// Takes no parameters.
//
// Simply closes the database and returns immediately. Note that
// the IndexedDB system actually closes the database in a separate
// thread, and there is no way to know when that process is complete.
//
const close = (): Promise<void> => {
  return new Promise((fulfill, reject) => {
    if (!db) {
      console.warn("KeyStore is not open.");
      fulfill();
      return;
    }
    db.close();
    db = null;
    fulfill();
  });
};

export interface SavedKeyObject {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
  name: any;
  spki?: ArrayBuffer;
}

// saveKey method
//
// Takes the public and private keys, and an arbitrary name
// for the saved key. The private key can be passed as null if unavailable.
//
// Returns a Promise. If a key can be saved, the
// Promise is fulfilled with a copy of the object
// that was saved. Otherwise, it is rejected with an Error.
//
const saveKey = async (
  publicKey: CryptoKey,
  privateKey: CryptoKey,
  name: any
): Promise<SavedKeyObject> => {
  console.log("open store ", db);
  await open();
  console.log("open store ", db);

  const result = await new Promise((fulfill, reject) => {
    if (!db) {
      reject(new Error("KeyStore is not open."));
    }

    if (publicKey) {
      const format = "spki";
      const key = publicKey;
      window.crypto.subtle
        .exportKey(format, key)
        .then((spki) => {
          const savedObject = {
            publicKey,
            privateKey,
            name,
            spki,
          };

          const transaction = db.transaction([objectStoreName], "readwrite");
          transaction.onerror = (evt: any) => {
            reject(evt.error);
          };
          transaction.onabort = (evt: any) => {
            reject(evt.error);
          };
          transaction.oncomplete = (evt: any) => {
            fulfill(savedObject);
          };

          const objectStore = transaction.objectStore(objectStoreName);
          const request = objectStore.add(savedObject);
          vault.init().then().catch(console.error);
        })
        .catch((err) => {
          reject(err);
        });
    } else {
      const savedObject = {
        publicKey,
        privateKey,
        name,
      };

      const transaction = db.transaction([objectStoreName], "readwrite");
      transaction.onerror = (evt: any) => {
        reject(evt.error);
      };
      transaction.onabort = (evt: any) => {
        reject(evt.error);
      };
      transaction.oncomplete = (evt: any) => {
        fulfill(savedObject);
      };

      const objectStore = transaction.objectStore(objectStoreName);
      const request = objectStore.add(savedObject);
      vault.init().then().catch(console.error);
    }
  });
  await close();
  return result as SavedKeyObject;
};

// getKey method
//
// Takes the name of a property (one of id, name, or spki), and
// the value of that property to search for.
//
// Returns a Promise. If a key with the given propertyValue of
// the specified propertyName exists in the database, the Promise
// is fulfilled with the saved object, otherwise it is rejected
// with an Error.
//
// If there are multiple objects with the requested propertyValue,
// only one of them is passed to the fulfill function.
//
const getKey = (propertyName: string, propertyValue: string): Promise<any> => {
  return new Promise((fulfill, reject) => {
    if (!db) {
      reject(new Error("KeyStore is not open."));
    }

    const transaction = db.transaction([objectStoreName], "readonly");
    const objectStore = transaction.objectStore(objectStoreName);

    let request;
    if (propertyName === "id") {
      request = objectStore.get(propertyValue);
    } else if (propertyName === "name") {
      request = objectStore.index("name").get(propertyValue);
    } else if (propertyName === "spki") {
      request = objectStore.index("spki").get(propertyValue);
    } else {
      reject(new Error(`No such property: ${propertyName}`));
    }

    request.onsuccess = (evt: any) => {
      fulfill(evt.target.result);
    };

    request.onerror = (evt: any) => {
      reject(evt.target.error);
    };
  });
};

// listKeys method
//
// Takes no parameters.
//
// Returns a Promise. Unless there is an error, fulfills the
// Promise with an array of all objects from the key storage
// database. Otherwise it rejects it with an Error.
//
const listKeys = (): Promise<any> => {
  return new Promise((fulfill, reject) => {
    if (!db) {
      reject(new Error("KeyStore is not open."));
    }

    const list: Array<{ id: string; value: string }> = [];

    const transaction = db.transaction([objectStoreName], "readonly");
    transaction.onerror = (evt: any) => {
      reject(evt.error);
    };
    transaction.onabort = (evt: any) => {
      reject(evt.error);
    };

    const objectStore = transaction.objectStore(objectStoreName);
    const cursor = objectStore.openCursor();

    cursor.onsuccess = (evt: any) => {
      if (evt.target.result) {
        list.push({
          id: evt.target.result.key,
          value: evt.target.result.value,
        });
        evt.target.result.continue();
      } else {
        fulfill(list);
      }
    };
  });
};

// Clear the keys saved in IndexedDB

const clearKey = async (
): Promise<any> => {
  const result = await new Promise((fulfill, reject) => {
    if (!db) {
      reject(new Error("KeyStore is not open."));
    }
    
    const transaction = db.transaction([objectStoreName], "readwrite");
    
    transaction.onerror = (evt: any) => {
      reject(evt.error);
    };
    transaction.onabort = (evt: any) => {
      reject(evt.error);
    };
    transaction.oncomplete = (evt: any) => {
      fulfill(true);
    };

    transaction.objectStore(objectStoreName).clear();
  });

  return result;
};

export { open as default, open, saveKey, getKey, listKeys, close, clearKey };
