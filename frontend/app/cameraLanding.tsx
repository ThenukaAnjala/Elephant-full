"use client";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { cameraJoin, cameraLogout } from "../services/socket";

export default function CameraLanding() {
  // Example route params => { cameraEmail, cameraId, token }
  const { cameraEmail: rawEmail, cameraId: rawId } = useLocalSearchParams();
  const cameraEmail = Array.isArray(rawEmail) ? rawEmail[0] : (rawEmail || "");
  const cameraId = Array.isArray(rawId) ? rawId[0] : (rawId || "");

  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(true);
  const [statusMessage, setStatusMessage] = useState("Camera online.");

  // On mount => mark camera as online by email
  useEffect(() => {
    if (cameraEmail) {
      cameraJoin(cameraEmail);
    }
    // Optionally: mark offline on unmount
    // return () => {
    //   cameraLogout(cameraEmail);
    // };
  }, [cameraEmail]);

  // Logout => mark offline => navigate back to login
  const handleLogout = () => {
    cameraLogout(cameraEmail);
    setLoggedIn(false);
    setStatusMessage("Camera offline.");
    router.push("/");
  };

  if (!loggedIn) {
    return (
      <div style={{ padding: 16 }}>
        <h2>Camera Landing</h2>
        <p>{statusMessage}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ fontSize: 24, marginBottom: 16 }}>Camera Landing</h2>
      <p>Email: {cameraEmail}</p>
      <p>Camera ID: {cameraId}</p>

      {/* Live detection feed example */}
      <div style={{ marginTop: 20, marginBottom: 20 }}>
        <h3>Live Detection Feed</h3>
        <img
          src={`http://127.0.0.1:5000/video_feed?cameraEmail=${encodeURIComponent(cameraEmail)}`}
          alt="Live YOLO feed"
          style={{ width: "100%", maxHeight: 400, border: "1px solid #ccc" }}
        />
      </div>

      <p style={{ color: "green", marginBottom: 10 }}>{statusMessage}</p>

      <button
        onClick={handleLogout}
        style={{
          padding: "8px 16px",
          backgroundColor: "#d9534f",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </div>
  );
}
