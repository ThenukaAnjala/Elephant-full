"use client";
import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet, Dimensions, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import apiClient from "../services/apiClient";
import { stationToDriver, onCameraStates } from "../services/socket";
import DriverTable, { Driver } from "../components/DriverTable";
import CameraStatusTable, { Camera, CameraState } from "../components/CameraStatusTable";

const { width, height } = Dimensions.get("window");

export default function StationLanding() {
  const { stationName = "Unknown", stationNo = "???" } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [cameraStates, setCameraStates] = useState<{ [email: string]: CameraState }>({});

  useEffect(() => {
    (async () => {
      try {
        const resp = await apiClient.get("/station/dashboard");
        setDrivers(resp.data.drivers);
        setCameras(resp.data.cameras);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    })();

    // Listen for realtime camera state updates via socket
    onCameraStates((states) => {
      setCameraStates(states);
    });
  }, []);

  // Function to send a warning message to a driver (unchanged)
  const handleWarnDriver = async (driver: Driver) => {
    try {
      await apiClient.post(`/station/train/${driver._id}/warn`);
      const msg = `⚠️ Warning from Station ${stationName} => ${driver.name} (Train: ${driver.trainNo})`;
      stationToDriver(driver._id, msg);
      alert(`Warning message successfully sent to ${driver.name}`);
    } catch (err) {
      console.error("Warn error:", err);
      alert("Could not send warning");
    }
  };

  if (loading) {
    return <ActivityIndicator style={styles.loading} size="large" color="#FF5733" />;
  }

  return (
    <ScrollView contentContainerStyle={styles.fullScreen}>
      <Text style={styles.header}>🚉 Station: {stationName} (No: {stationNo})</Text>

      <View style={styles.card}>
        
        <DriverTable drivers={drivers} onWarnDriver={handleWarnDriver} />
      </View>

      <View style={styles.card}>
        
        <CameraStatusTable cameras={cameras} cameraStates={cameraStates} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    width: "100%",
    minHeight: height,
    padding: 20,
    backgroundColor: "#F8E18E", // Light yellow background for readability
    alignItems: "center",
  },
  header: {
    fontSize: 22,
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "bold",
    color: "#333", // Dark grey for contrast
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#FFF3CD", // Light warm color for emphasis
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: "center",
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
    textTransform: "uppercase",
  },
  hiddenElement: {
    display: "none", // This hides the unwanted part
  },
});
