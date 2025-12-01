import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as Location from "expo-location";
import { useNavigation } from "@react-navigation/native";
import { auth, db } from "../firebase/config";
import { doc, updateDoc } from "firebase/firestore";

const COLORS = {
  background: "#ffffff",
  primary: "#0A1D37",
  accent: "#E87722",
  text: "#0A1D37",
  muted: "#6b7280",
};

export default function OnboardingLocationScreen() {
  const navigation = useNavigation<any>();

  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [loading, setLoading] = useState(false);

  async function detectLocation() {
    try {
      setLoading(true);

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Please enter your location manually.");
        return;
      }

      const pos = await Location.getCurrentPositionAsync({});
      const geocode = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });

      if (geocode.length > 0) {
        let info = geocode[0];
        setCity(info.city || "");
        setState(info.region || "");
      }
    } catch (err) {
      Alert.alert("Error", "Could not detect location. Enter it manually.");
    } finally {
      setLoading(false);
    }
  }

  async function handleNext() {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "Session expired. Please log in again.");
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
      return;
    }

    if (!city.trim() || !state.trim()) {
      Alert.alert("Missing Info", "Enter your city & state before continuing.");
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        location: {
          city: city.trim(),
          state: state.trim(),
        },
        updatedAt: Date.now(),
      });

      navigation.navigate("OnboardingBio");
    } catch (err) {
      console.log("Location error:", err);
      Alert.alert("Error", "Could not save your location.");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Where are you located?</Text>
      <Text style={styles.subheading}>
        Detect automatically or enter it manually.
      </Text>

      <Pressable style={styles.detectButton} onPress={detectLocation}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.detectButtonText}>Detect My Location</Text>
        )}
      </Pressable>

      <TextInput
        placeholder="City"
        value={city}
        onChangeText={setCity}
        style={styles.input}
      />

      <TextInput
        placeholder="State"
        value={state}
        onChangeText={setState}
        style={styles.input}
      />

      <Pressable style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Next</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 24,
    justifyContent: "center",
  },
  heading: {
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 10,
  },
  subheading: {
    fontSize: 14,
    color: COLORS.muted,
    marginBottom: 20,
  },
  detectButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
    marginBottom: 20,
  },
  detectButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.muted,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  button: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
