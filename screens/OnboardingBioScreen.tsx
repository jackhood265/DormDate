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
import { doc, updateDoc } from "firebase/firestore";

const COLORS = {
  background: "#ffffff",
  primary: "#0A1D37",
  accent: "#E87722",
  text: "#0A1D37",
  muted: "#6b7280",
};

export default function OnboardingBioScreen() {
  const navigation = useNavigation<any>();
  const [bio, setBio] = useState("");

  async function handleNext() {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "Session expired. Please log in again.");
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        bio: bio.trim() || null,
        updatedAt: Date.now(),
      });

      navigation.navigate("OnboardingPhoto");
    } catch (err) {
      console.log("OnboardingBio error:", err);
      Alert.alert("Error", "Could not save your bio. Try again.");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Add a short bio</Text>
      <Text style={styles.subheading}>
        Optional, but helps people get to know you.
      </Text>

      <TextInput
        placeholder="Write something about yourself..."
        style={styles.input}
        multiline
        maxLength={200}
        value={bio}
        onChangeText={setBio}
      />

      <Text style={styles.counter}>{bio.length}/200</Text>

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
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.muted,
    borderRadius: 12,
    padding: 12,
    height: 120,
    textAlignVertical: "top",
    fontSize: 14,
    marginBottom: 8,
  },
  counter: {
    color: COLORS.muted,
    fontSize: 12,
    marginBottom: 16,
    textAlign: "right",
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
