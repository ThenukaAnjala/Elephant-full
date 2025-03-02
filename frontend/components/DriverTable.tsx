import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";

export interface Driver {
  _id: string;
  name: string;
  trainNo: string;
  routeNumber: string;
}

interface Props {
  drivers: Driver[];
  onWarnDriver: (driver: Driver) => void;
}

export default function DriverTable({ drivers, onWarnDriver }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.subHeader}>🚆 Train Drivers</Text>
      <FlatList
        data={drivers}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.rowText}>
              {item.name} / Train: {item.trainNo}
            </Text>
            <TouchableOpacity style={styles.warnButton} onPress={() => onWarnDriver(item)}>
              <Text style={styles.warnText}>⚠️ Warn</Text>
            </TouchableOpacity>
          </View>
        )}
        nestedScrollEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F8E18E", // HCI principle: Good contrast & readability
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
    backgroundColor: "#FFFFFF", // White for better visibility
    borderWidth: 1,
    borderColor: "#ddd",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  rowText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  warnButton: {
    backgroundColor: "#FF5733", // Red-orange for urgency
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  warnText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },
});
