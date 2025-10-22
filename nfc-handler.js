// nfc-handler.js
import { io } from "https://cdn.jsdelivr.net/npm/socket.io-client@4.7.2/dist/socket.io.esm.min.js";

export class NfcHandler {
  constructor(endpoint) {
    if (!endpoint) throw new Error("Socket endpoint is required.");
    this.endpoint = endpoint;
    this.socket = null;
    this.connected = false;
    this.callbacks = {};
  }

  open() {
    if (this.socket) {
      console.warn("Socket already open.");
      return;
    }

    this.socket = io(this.endpoint, {
      transports: ["websocket"],
      upgrade: false,
    });

    this.socket.on("connect", () => {
      this.connected = true;
      this.callbacks.connect?.(this.socket.id);
    });

    this.socket.on("disconnect", (reason) => {
      this.connected = false;
      this.callbacks.disconnect?.(reason);
    });

    this.socket.on("card-uid", (uid) => {
      this.callbacks.cardUid?.(uid);
    });

    this.socket.on("verified-user-detail", (uid) => {
      this.callbacks.verifiedUid?.(uid);
    });

    this.socket.on("reader-connect", (name) => {
      this.callbacks.readerConnect?.(name);
    });

    this.socket.on("reader-disconnect", (name) => {
      this.callbacks.readerDisconnect?.(name);
    });

    this.socket.on("read-error", (err) => {
      this.callbacks.readError?.(err);
    });

    this.socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });
  }

  close() {
    if (!this.socket) return;
    this.socket.disconnect();
    this.socket = null;
    this.connected = false;
  }

  onConnect(cb) {
    this.callbacks.connect = cb;
  }
  onDisconnect(cb) {
    this.callbacks.disconnect = cb;
  }
  onCardUid(cb) {
    this.callbacks.cardUid = cb;
  }
  onVerifiedUid(cb) {
    this.callbacks.verifiedUid = cb;
  }
  onReaderConnect(cb) {
    this.callbacks.readerConnect = cb;
  }
  onReaderDisconnect(cb) {
    this.callbacks.readerDisconnect = cb;
  }
  onReadError(cb) {
    this.callbacks.readError = cb;
  }

  isConnected() {
    return this.connected;
  }
}
