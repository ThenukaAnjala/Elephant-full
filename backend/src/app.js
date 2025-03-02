require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./utils/db");

const authRoutes = require("./routes/authRoutes");
const stationRoutes = require("./routes/stationRoutes");
const driverRoutes = require("./routes/driverRoutes");

const CameraUser = require("./models/CameraUser");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

// We store driver sockets so we can direct warnings to them
const driverSockets = {};

connectDB();

app.use(cors());
app.use(bodyParser.json());

// REST routes
app.use("/api", authRoutes);
app.use("/api", stationRoutes);
app.use("/api", driverRoutes);

/**
 * broadcastCameraStates:
 * Load all cameras from DB, create cameraStates keyed by email,
 * e.g. cameraStates["camera@example.com"] = { online: true, elephants: false }.
 * Then emit "cameraStates" to all connected clients (station pages).
 */
async function broadcastCameraStates() {
  try {
    const cameras = await CameraUser.find().lean(); // e.g. { email, cameraId, isOnline, detectedElephants }
    const cameraStates = {};
    cameras.forEach((cam) => {
      cameraStates[cam.email] = {
        online: cam.isOnline,
        elephants: cam.detectedElephants,
      };
    });
    io.emit("cameraStates", cameraStates);
  } catch (err) {
    console.error("Error broadcasting camera states:", err);
  }
}

io.on("connection", (socket) => {
  console.log("New socket connection:", socket.id);

  // DRIVER
  socket.on("driverJoin", (driverId) => {
    driverSockets[driverId] = socket;
    console.log("Driver joined:", driverId, " => socket:", socket.id);
  });

  // STATION => driver (warn)
  socket.on("stationToDriver", ({ driverId, message }) => {
    const drvSocket = driverSockets[driverId];
    if (drvSocket) {
      drvSocket.emit("driverWarning", message);
    } else {
      console.log("No active socket for driverId", driverId);
    }
  });

  // CAMERA: cameraJoin => mark isOnline = true by email
  socket.on("cameraJoin", async (cameraEmail) => {
    console.log("Camera joined:", cameraEmail);
    try {
      await CameraUser.findOneAndUpdate(
        { email: cameraEmail },
        { isOnline: true }
      );
    } catch (err) {
      console.error("cameraJoin DB error:", err);
    }
    broadcastCameraStates();
  });

  // CAMERA: cameraLogout => mark isOnline = false
  socket.on("cameraLogout", async (cameraEmail) => {
    console.log("Camera logout:", cameraEmail);
    try {
      await CameraUser.findOneAndUpdate(
        { email: cameraEmail },
        { isOnline: false }
      );
    } catch (err) {
      console.error("cameraLogout DB error:", err);
    }
    broadcastCameraStates();
  });

  // CAMERA: cameraStatus => e.g. sets detectedElephants
  socket.on("cameraStatus", async ({ cameraEmail, elephants }) => {
    console.log("CameraStatus from:", cameraEmail, " => elephants?", elephants);
    try {
      await CameraUser.findOneAndUpdate(
        { email: cameraEmail },
        { isOnline: true, detectedElephants: !!elephants }
      );
    } catch (err) {
      console.error("cameraStatus DB error:", err);
    }
    broadcastCameraStates();
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
    // If it was a driver, remove from driverSockets
    for (const driverId in driverSockets) {
      if (driverSockets[driverId].id === socket.id) {
        console.log("Removing driver socket for", driverId);
        delete driverSockets[driverId];
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));
