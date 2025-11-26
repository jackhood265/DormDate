import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { auth, db } from "../firebase/config";
import { doc, setDoc } from "firebase/firestore";

const COLORS = {
  background: "#ffffff",
  primary: "#0A1D37", // Auburn navy
  accent: "#E87722", // Auburn orange
  text: "#0A1D37",
  muted: "#6b7280",
};

export default function OnboardingNameScreen() {
  const navigation = useNavigation<any>();
  const [name, setName] = useState("");

  async function handleNext() {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "Session expired. Please log in again.");
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
      return;
    }

    if (!name.trim()) {
      Alert.alert("Hold up", "Please enter your first name.");
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(
        userRef,
        {
          firstName: name.trim(),
          email: user.email ?? "",
          updatedAt: Date.now(),
        },
        { merge: true }
      );
      navigation.navigate("OnboardingGender");
    } catch (err: any) {
      console.log("OnboardingName error", err);
      Alert.alert("Error", "Could not save your name. Try again.");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Welcome to DormDate</Text>
      <Text style={styles.subheading}>
        Let’s start with your first name. This is how other Auburn students will
        see you.
      </Text>

      <TextInput
        placeholder="First name"
        style={styles.input}
        value={name}
        onChangeText={setName}
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
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 12,
  },
  subheading: {
    fontSize: 14,
    color: COLORS.muted,
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.muted,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 24,
  },
  button: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
