import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

export interface Camera {
  _id: string;
  email: string;    // used as the key in the state object
  cameraId: string; // displayed to the user
  detectedElephants?: boolean;
}

export interface CameraState {
  online?: boolean;
  elephants?: boolean;
}

interface Props {
  cameras: Camera[];
  cameraStates: { [email: string]: CameraState };
}

export default function CameraStatusTable({ cameras, cameraStates }: Props) {
  const getCameraColor = (camEmail: string): string => {
    const state = cameraStates[camEmail];
    if (!state || !state.online) return "#444"; // Dark grey for offline
    if (state.elephants) return "#D32F2F"; // Bright red for elephants detected
    return "#388E3C"; // Green for online, no elephants
  };

  return (
    <View style={styles.container}>
      <Text style={styles.subHeader}>📷 Camera Status</Text>
      <FlatList
        data={cameras}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          // Use email as the key for state lookup; display cameraId only.
          const bgColor = getCameraColor(item.email);
          let statusText = "Offline";
          if (cameraStates[item.email]) {
            statusText = cameraStates[item.email].elephants
              ? "🚨 Elephants Detected!"
              : cameraStates[item.email].online
              ? "✅ Online"
              : "Offline";
          }
          return (
            <View style={[styles.row, { backgroundColor: bgColor }]}> 
              <Text style={styles.rowText}>🎥 ID: {item.cameraId}</Text>
              <Text style={styles.rowText}>{statusText}</Text>
            </View>
          );
        }}
        nestedScrollEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F8E18E", // HCI principle: High contrast and readability
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  subHeader: {
    fontSize: 20,
    marginBottom: 12,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    marginVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  rowText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
