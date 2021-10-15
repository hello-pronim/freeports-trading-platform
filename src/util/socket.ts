import { io, Socket } from "socket.io-client";

let socket: Socket;
const WEBSOCKET_URL = process.env.REACT_APP_WEBSOCKET_URL;
const jwtToken = Lockr.get("ACCESS_TOKEN");

export const createSocket = (): Socket => {
  socket = io(WEBSOCKET_URL as string, {
    extraHeaders: { Authorization: jwtToken as string },
  });
  return socket;
};
