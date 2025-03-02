import React, { useEffect, useState } from "react";
import { View, Text, Button, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { driverJoin, onDriverWarning } from "../services/socket";
import { useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

export default function DriverLanding() {
  const { driverId = "", driverName = "Unknown" } = useLocalSearchParams();
  const [warnings, setWarnings] = useState<string[]>([]);
  const navigation = useNavigation();
  const router = useRouter();

  useEffect(() => {
    navigation.setOptions({ headerShown: false }); // 🔥 Remove default header
  }, [navigation]);

  useEffect(() => {
    if (driverId) {
      driverJoin(driverId.toString());
    }
    onDriverWarning((msg) => {
      setWarnings((prev) => [...prev, msg]);
    });
  }, [driverId]);

  const handleLogout = () => {
    router.push("/");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out" size={24} color="white" />
      </TouchableOpacity>
      <Text style={styles.header}>{driverName}</Text>
      {warnings.length === 0 ? (
        <Text style={styles.info}>No active warnings</Text>
      ) : (
        <>
          <FlatList
            data={warnings}
            keyExtractor={(_, idx) => idx.toString()}
            renderItem={({ item }) => <Text style={styles.warnItem}>⚠️ {item}</Text>}
          />
          <TouchableOpacity style={styles.clearButton} onPress={() => setWarnings([])}>
            <Text style={styles.clearButtonText}>CLEAR WARNINGS</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#FFFFFF", // Updated background to white
    alignItems: "center",
  },
  header: {
    fontSize: 28,
    marginBottom: 16,
    textAlign: "center",
    fontWeight: "bold",
    color: "#DC3545", // Dark grey for readability
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  info: {
    fontSize: 20,
    color: "#008000", // Dark green for active info
    textAlign: "center",
    fontWeight: "bold",
  },
  warnItem: {
    fontSize: 18,
    marginVertical: 8,
    color: "#FF8C00", // Dark orange for better visibility
    fontWeight: "bold",
    backgroundColor: "#FFF3CD", // Light yellow background
    padding: 12,
    borderRadius: 8,
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#FFA500",
    width: "90%",
  },
  logoutButton: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "#DC3545", // Bootstrap-like danger red
    padding: 12,
    borderRadius: 50,
    elevation: 5,
  },
  clearButton: {
    backgroundColor: "#FF5733", // More appealing red-orange
    paddingVertical: 14,
    paddingHorizontal: 35,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  clearButtonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});
