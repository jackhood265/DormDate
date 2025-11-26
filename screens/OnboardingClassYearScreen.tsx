import React, { useState } from "react";
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

const OPTIONS = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"];

export default function OnboardingClassYearScreen() {
  const navigation = useNavigation<any>();
  const [selected, setSelected] = useState<string | null>(null);

  async function handleNext() {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "Session expired. Please log in again.");
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
      return;
    }

    if (!selected) {
      Alert.alert("Hold up", "Pick your class year.");
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        classYear: selected,
        updatedAt: Date.now(),
      });
      navigation.navigate("OnboardingGreek");
    } catch (err: any) {
      console.log("OnboardingClassYear error", err);
      Alert.alert("Error", "Could not save your class year. Try again.");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>What’s your class year?</Text>
      <Text style={styles.subheading}>We’re starting with Auburn students.</Text>

      {OPTIONS.map((opt) => (
        <Pressable
          key={opt}
          onPress={() => setSelected(opt)}
          style={[
            styles.option,
            selected === opt && styles.optionSelected,
          ]}
        >
          <Text
            style={[
              styles.optionText,
              selected === opt && styles.optionTextSelected,
            ]}
          >
            {opt}
          </Text>
        </Pressable>
      ))}

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
    marginBottom: 24,
  },
  option: {
    borderWidth: 1,
    borderColor: COLORS.muted,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  optionSelected: {
    borderColor: COLORS.accent,
    backgroundColor: "#FFF3E8",
  },
  optionText: {
    color: COLORS.text,
    fontSize: 15,
  },
  optionTextSelected: {
    color: COLORS.accent,
    fontWeight: "600",
  },
  button: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
