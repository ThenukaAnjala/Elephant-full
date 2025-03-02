import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import apiClient, { setToken } from "../services/apiClient";

interface LoginPayload {
  email: string;
  password: string;
  cameraId?: string;
}

export default function LoginScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cameraId, setCameraId] = useState("");

  const handleLogin = async () => {
    try {
      const payload: LoginPayload = { email, password };
      if (cameraId) payload.cameraId = cameraId;
      const resp = await apiClient.post("/login", payload);
      const { token, role, user } = resp.data;
      setToken(token);

      if (role === "driver") {
        Alert.alert("Driver Login", `Welcome ${user.name}`);
        router.push({
          pathname: "/driverLanding",
          params: { driverId: user._id, driverName: user.name },
        });
      } else if (role === "station") {
        Alert.alert("Station Login", `Welcome ${user.name}`);
        router.push({
          pathname: "/stationLanding",
          params: { stationName: user.stationName, stationNo: user.stationNo, stationId: user._id },
        });
      } else if (role === "camera") {
        Alert.alert("Camera Login", `Welcome camera user: ${user.email}`);
        router.push({
          pathname: "/cameraLanding",
          params: { cameraEmail: user.email, cameraId: user.cameraId },
        });
      } else {
        Alert.alert("Unknown role", role);
      }
    } catch (err) {
      console.error("Login error:", err);
      Alert.alert("Login Failed", "Check credentials");
    }
  };

  return (
    <View style={styles.container}>
      {/* <Image source={require("../assets/unicorn.png")} style={styles.image} /> */}
      <View style={styles.loginContainer}>
        <Text style={styles.header}>Login</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="Camera ID (optional)"
          value={cameraId}
          onChangeText={setCameraId}
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.registerButton} onPress={() => router.push("/registerDriver")}> 
          <Text style={styles.registerButtonText}>Register as Driver</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.registerButton} onPress={() => router.push("/registerStation")}> 
          <Text style={styles.registerButtonText}>Register as Station Master</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.registerButton} onPress={() => router.push("/registerCamera")}> 
          <Text style={styles.registerButtonText}>Register as Camera User</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FCE77D",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: "contain",
  },
  loginContainer: {
    backgroundColor: "#FFF",
    width: "90%",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#000",
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  registerButton: {
    backgroundColor: "#FFF",
    paddingVertical: 10,
    paddingHorizontal: 50,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: "#000",
    marginBottom: 5,
  },
  registerButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  signupLink: {
    fontWeight: "bold",
    color: "#000",
  },
});
