import { io, Socket } from "socket.io-client";

const socket: Socket = io("http://172.28.22.161:3000", {
  transports: ["websocket"],
});

// DRIVER
export function driverJoin(driverId: string) {
  socket.emit("driverJoin", driverId);
}
export function onDriverWarning(callback: (msg: string) => void) {
  socket.on("driverWarning", callback);
}

// CAMERA
export function cameraJoin(cameraEmail: string) {
  socket.emit("cameraJoin", cameraEmail);
}
export function cameraLogout(cameraEmail: string) {
  socket.emit("cameraLogout", cameraEmail);
}
export function cameraStatus(cameraEmail: string, elephants: boolean) {
  socket.emit("cameraStatus", { cameraEmail, elephants });
}
export function cameraUpdate(cameraEmail: string, elephants: boolean) {
  socket.emit("cameraUpdate", { cameraEmail, elephants });
}

// STATION -> DRIVER
export function stationToDriver(driverId: string, message: string) {
  socket.emit("stationToDriver", { driverId, message });
}

// STATION listens for camera states
export function onCameraStates(callback: (states: any) => void) {
  socket.on("cameraStates", callback);
}

export default socket;
