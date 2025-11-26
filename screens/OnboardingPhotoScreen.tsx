import React from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
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

export default function OnboardingPhotoScreen() {
  const navigation = useNavigation<any>();

  async function handleFinish() {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "Session expired. Please log in again.");
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        onboardingComplete: true,
        updatedAt: Date.now(),
      });

      navigation.reset({
        index: 0,
        routes: [{ name: "MainTabs" }],
      });
    } catch (err: any) {
      console.log("OnboardingPhoto error", err);
      Alert.alert("Error", "Could not finish onboarding. Try again.");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Add a profile photo</Text>
      <Text style={styles.subheading}>
        Profiles with photos get way more attention. You can always add or
        change your photos later.
      </Text>

      {/* Placeholder card */}
      <View style={styles.photoPlaceholder}>
        <Text style={styles.photoPlaceholderText}>Photo upload coming soon</Text>
      </View>

      <Pressable style={styles.buttonPrimary} onPress={handleFinish}>
        <Text style={styles.buttonPrimaryText}>Skip for now & Finish</Text>
      </Pressable>

      {/* Later we can add a real "Upload photo" button here */}
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
    marginBottom: 24,
  },
  photoPlaceholder: {
    height: 180,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: COLORS.muted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  photoPlaceholderText: {
    color: COLORS.muted,
    fontSize: 14,
  },
  buttonPrimary: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
  },
  buttonPrimaryText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
