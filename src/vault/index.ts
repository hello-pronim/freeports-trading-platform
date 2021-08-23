/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */
import axios, { AxiosResponse } from "axios";

import { VaultAccountType } from "./enum/vault-account-type";
import { PermissionOwnerType } from "./enum/permission-owner-type";
import sendRequest, { Method, VaultRequestDto } from "../services/vaultService";
import arrayBufferToBase64, { spki2String } from "../util/keyStore/functions";
import {
  open,
  listKeys,
  close,
  SavedKeyObject,
} from "../util/keyStore/keystore";
// eslint-disable-next-line no-shadow
export enum VaultPermissions {
  "CreateDeleteOrganization" = "CreateDeleteOrganization",
  "GetOrganizations" = "GetOrganizations",
  "GrantRevokeVaultPermission" = "GrantRevokeVaultPermission",
  "AddRemoveAddress" = "AddRemoveAddress",
  "CreateDeleteAddressBook" = "CreateDeleteAddressBook",
  "GetAddressBookDetails" = "GetAddressBookDetails",
  "GetAddressBooks" = "GetAddressBooks",
  "AddRemoveUser" = "AddRemoveUser",
  "CreateDeleteGroup" = "CreateDeleteGroup",
  "GetGroups" = "GetGroups",
  "BackupMnemonic" = "BackupMnemonic",
  "RestoreMnemonic" = "RestoreMnemonic",
  "GetUserPermissions" = "GetUserPermissions",
  "GrantRevokePermission" = "GrantRevokePermission",
  "GetPublicKey" = "GetPublicKey",
  "CreateDeleteUser" = "CreateDeleteUser",
  "GetUsers" = "GetUsers",
  "GetOrganizationUsers" = "GetOrganizationUsers",
  "WalletExecution" = "WalletExecution",
  "Transaction" = "Transaction",
  "CreateWallet" = "CreateWallet",
  "DeleteWallet" = "DeleteWallet",
  "GetWallets" = "GetWallets",
  "GetWalletDetails" = "GetWalletDetails",
  "CreateOrganizationUser" = "CreateOrganizationUser",
  "JoinOrganizationUser" = "JoinOrganizationUser",
  "CreateAccount" = "CreateAccount",
  "WalletTransaction" = "WalletTransaction",
  // 'Wipe' = 'Wipe',
}

const roleVaultPermission = {
  'clearer.organization.create': ['CreateDeleteOrganization'],
  
  'clearer.role.create': ['CreateDeleteGroup', 'GrantRevokePermission'],
  'organization.#organizationId#.role.create': ['CreateDeleteGroup', 'GrantRevokePermission'],
  'desk.#deskId#.role.create': ['CreateDeleteGroup', 'GrantRevokePermission'],

  'clearer.role.update': ['GrantRevokePermission'],
  'organization.#organizationId#.role.update': ['GrantRevokePermission'],
  'desk.#deskId#.role.update': ['GrantRevokePermission'],

  'clearer.role.delete': ['GrantRevokePermission'],
  'organization.#organizationId#.role.delete': ['GrantRevokePermission'],
  'desk.#deskId#.role.delete': ['GrantRevokePermission'],

  'clearer.role.assign': ['AddRemoveUser'],
  'organization.#organizationId#.role.assign': ['AddRemoveUser'],
  'desk.#deskId#.role.assign': ['AddRemoveUser'],

  'clearer.account.create': ['CreateWallet'],
  'desk.#deskId#.account.create': ['CreateWallet'],

  'clearer.account.delete': ['DeleteWallet'],
  'desk.#deskId#.account.delete': ['DeleteWallet'],
};

interface AuthenticateResponse {
  tokenString: string;
}

interface VaultError {
  name: "ValidationError" | "VaultError" | "VaultUnreachable";
  message: string;
  statusCode: number;
  error: string;
  details: string;
}

interface RequestBody {
  [key: string]: string | RequestBody;
}

export class Vault {
  private API_PREFIX = "/api/v1";

  publicKey!: string;

  privateKey!: CryptoKey;

  accessToken: string | undefined;

  tokenObtainedAt = 0;

  private hashingAlgorithm = "SHA-256";

  private static _instance: Vault;

  constructor() {
    if (Vault._instance) {
      throw new Error(
        "Singleton classes can't be instantiated more than once."
      );
    }
    Vault._instance = this;
  }

  public async init(): Promise<any> {
    const keys = await this.getKeyList();
    if (!keys[0]) {
      console.warn("User has no keys");
      return;
    }
    this.publicKey = spki2String(new Uint8Array(keys[0].spki));
    if (keys[0].privateKey) {
      this.privateKey = keys[0].privateKey;
    } else {
      throw new Error("Stored keys have no privateKey");
    }
  }

  public async createOrganization(): Promise<VaultRequestDto> {
    const request = await this.createRequest(
      Method.POST,
      "/vault/organization"
    );

    return request;
  }

  public createVaultUser = async (
    publicKey: string
  ): Promise<VaultRequestDto> => {
    console.log("createVaultUser ", this);
    const request = await this.createRequest(Method.POST, "/vault/user", {
      publicKey,
    });
    return request;
  };

  public async createOrganizationManager(
    vaultOrganizationId: string,
    publicKey: string
  ): Promise<VaultRequestDto> {
    const request = await this.createRequest(
      Method.POST,
      `/vault/organization/${vaultOrganizationId}/user`,
      { publicKey }
    );
    return request;
  }

  public async deleteVaultUser(id: string): Promise<VaultRequestDto> {
    const request = await this.createRequest(Method.POST, `/vault/user/${id}`);
    return request;
  }

  public async deleteOrganizationUser(id: string): Promise<VaultRequestDto> {
    const request = await this.createRequest(
      Method.POST,
      `/organization/user/${id}`
    );
    return request;
  }

  public async grantAllPermissions(
    ownerType: PermissionOwnerType,
    ownerId: string
  ): Promise<VaultRequestDto[]> {
    return Promise.all(
      Object.keys(VaultPermissions).map((permission) => {
        return this.grantPermission(
          permission as VaultPermissions,
          ownerType,
          ownerId
        );
      })
    );
  }

  public async getAllOrganizations(): Promise<VaultRequestDto> {
    const request = await this.createRequest(Method.GET, "/vault/organization");
    return request;
  }

  public async getAllVaultUsers(): Promise<VaultRequestDto> {
    const request = await this.createRequest(Method.GET, "/vault/user");
    return request;
  }

  public async getAllOrganizationUsers(): Promise<VaultRequestDto> {
    const request = await this.createRequest(Method.GET, `/organization/user`);
    return request;
  }

  public async joinOrganizationUser(
    organization: string,
    publicKey: string
  ): Promise<VaultRequestDto> {
    const request = await this.createRequest(
      Method.POST,
      `/vault/organization/${organization}/user`,
      { publicKey }
    );
    return request;
  }

  public async getPermissionsByOwner(
    ownerId: string
  ): Promise<VaultRequestDto> {
    const request = await this.createRequest(
      Method.GET,
      `/vault/owner/${ownerId}/user/permission`
    );
    return request;
  }

  public async createAccount(type: VaultAccountType): Promise<VaultRequestDto> {
    const request = await this.createRequest(
      Method.POST,
      "/vault/organization/account",

      { type }
    );
    return request;
  }

  public async authenticate(): Promise<string> {
    const { tokenString } = await this.createToken("0");
    this.accessToken = tokenString;
    this.tokenObtainedAt = Date.now();

    // const reqs = await this.grantAllPermissions(PermissionOwnerType.user, "1");

    // const result = await Promise.all(reqs.map((r) => this.sendRequest(r)));

    // const request = await this.createOrganization();

    // const result = await this.sendRequest(request);
    // console.log("Organization created ", result);

    return tokenString;
  }

  private async createRequest(
    method: Method,
    path: string,
    body?: any,
    headers: any = {}
  ): Promise<VaultRequestDto> {
    if (
      (!this.accessToken ||
        Date.now() - this.tokenObtainedAt > 14 * 60 * 60 * 1000) &&
      path !== "/token"
    ) {
      await this.authenticate();
    }
    const signature = await this.hashRequest(method, path, body);
    return {
      method,
      path,
      body,
      headers: {
        "signature-type": "raw",
        ...headers,
        authorization: this.accessToken,
        signature,
      },
    };
  }

  public async sendRequest<T>(
    request: VaultRequestDto
  ): Promise<AxiosResponse<T> | any> {
    try {
      return await sendRequest(request);
    } catch (error) {
      console.error(error);
      if (axios.isAxiosError(error)) {
        if (error?.response?.data.message === "ExpiredToken") {
          try {
            await this.authenticate();
            return this.sendRequest<T>(request);
          } catch (err) {
            console.error(err);
          }
        }
      }
      return Promise.reject(error);
    }
  }

  private orderObject(original: RequestBody) {
    return Object.keys(original)
      .sort()
      .reduce((ordered: RequestBody, key: string) => {
        let val = original[key];
        if (typeof original[key] === "object" && original[key] !== null) {
          val = this.orderObject(val as RequestBody);
        }
        // eslint-disable-next-line
        ordered[key as string] = val;
        return ordered;
      }, {});
  }

  // eslint-disable-next-line class-methods-use-this
  private stringToArrayBuffer(byteString: any) {
    const byteArray = new Uint8Array(byteString.length);
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < byteString.length; i++) {
      byteArray[i] = byteString.codePointAt(i);
    }
    return byteArray;
  }

  private async hashRequest(method: string, path: string, body: any) {
    console.log(
      "hash message ",
      method.toUpperCase() +
        this.API_PREFIX +
        path +
        (body ? JSON.stringify(this.orderObject(body)) : "")
    );
    let messageString = method.toUpperCase() + this.API_PREFIX + path;
    if (body) {
      messageString += JSON.stringify(this.orderObject(body));
    }
    const enc = new TextEncoder();

    const message = enc.encode(messageString);
    // const message = await this.string2ArrayBuffer(messageString);

    console.log("encode message", message);
    const signature = await this.signMessage(message);

    return signature;
  }

  private async createToken(organizationId: string) {
    // const publicKeyDER = this.publicKey.export({ type: "spki", format: "der" });

    const reqBody = {
      publicKey: this.publicKey,
      organizationId,
    };

    const request = await this.createRequest(Method.POST, "/token", reqBody);

    const response = await sendRequest(request);

    return response;
  }

  private async grantPermission(
    permissionType: VaultPermissions,
    ownerType: PermissionOwnerType,
    ownerId: string
  ) {
    const request = await this.createRequest(Method.POST, "/vault/permission", {
      permissionType,
      ownerType,
      ownerId,
    });
    return request;
  }

  private async signMessage(message: ArrayBuffer): Promise<string> {
    console.log("sign message ", message);
    const signature = await window.crypto.subtle.sign(
      {
        name: "ECDSA",
        hash: { name: this.hashingAlgorithm },
      },
      this.privateKey,
      message
    );

    const byteArray = new Uint8Array(signature);
    let byteString = "";
    for (let i = 0; i < byteArray.byteLength; i += 1) {
      byteString += String.fromCharCode(byteArray[i]);
    }
    const b64Signature = window.btoa(byteString);

    console.log(
      "Signture ",
      arrayBufferToBase64(signature),
      signature,
      b64Signature
    );
    return b64Signature;
  }

  // eslint-disable-next-line class-methods-use-this
  string2ArrayBuffer(string: string): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const bb = new Blob([string], {
        type: "text/plain",
      });
      const f = new FileReader();
      f.onload = function (e) {
        resolve(e.target?.result as ArrayBuffer);
      };
      f.readAsArrayBuffer(bb);
    });
  }

  async getKeyList(): Promise<
    Array<{
      publicKey: CryptoKey | null;
      privateKey: CryptoKey | null;
      name: string;
      spki: ArrayBuffer;
    }>
  > {
    await open();
    const keysList = await listKeys();

    await close();
    return keysList.map(
      (key: { id: number; value: SavedKeyObject }) => key.value
    );
  }

  public async createGroup(): Promise<VaultRequestDto> {
    const request = await this.createRequest(
      Method.POST,
      "/vault/group"
    );

    return request;
  }

  public async grantPermissions(
    ownerType: PermissionOwnerType,
    ownerId: string,
    rolePermissions: Array<string>,
  ): Promise<VaultRequestDto[]> {
    const permissions: Array<VaultPermissions> = [];

    rolePermissions.forEach((rPermission) => {
      const vPermissions = roleVaultPermission[rPermission as keyof typeof roleVaultPermission];
      if (vPermissions) {
        vPermissions.forEach((vPermission) => {
          if (!permissions.includes(vPermission as VaultPermissions)) {
            permissions.push(vPermission as VaultPermissions);
          }
        });
      }
    })

    return Promise.all(
      permissions.map((permission) => {
        return this.grantPermission(
          permission as VaultPermissions,
          ownerType,
          ownerId
        );
      })
    );
  }
}

const vault = new Vault();
vault.init().then();
(window as any).vault = vault;

export default vault;
