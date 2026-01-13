// screens/LoginScreen.tsx
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { auth, db } from "../firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";

const COLORS = {
  primary: "#0A1D37",
  accent: "#E87722",
  background: "#ffffff",
  muted: "#6b7280",
};

export default function LoginScreen() {
  const navigation = useNavigation<any>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUpMode, setIsSignUpMode] = useState(false);

  async function handlePostLogin(user: User) {
    try {
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        // First-time user doc
        await setDoc(
          userRef,
          {
            email: user.email ?? "",
            createdAt: Date.now(),
            onboardingComplete: false,
          },
          { merge: true }
        );
        navigation.reset({
          index: 0,
          routes: [{ name: "OnboardingName" }],
        });
        return;
      }

      const data = snap.data() as any;
      if (data?.onboardingComplete) {
        navigation.reset({
          index: 0,
          routes: [{ name: "MainTabs" }],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: "OnboardingName" }],
        });
      }
    } catch (err: any) {
      console.log("handlePostLogin error", err);
      Alert.alert(
        "Error",
        "There was a problem loading your profile. Please try again."
      );
    }
  }

  // Auto-login if already authenticated
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        handlePostLogin(user);
      }
    });
    return unsub;
  }, []);

  async function handleLogin() {
    try {
      const cred = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      await handlePostLogin(cred.user);
    } catch (err: any) {
      Alert.alert("Login Failed", err.message);
    }
  }

  async function handleSignUp() {
    if (!email.trim() || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      await handlePostLogin(cred.user);
    } catch (err: any) {
      Alert.alert("Sign Up Failed", err.message);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>DormDate</Text>
      <Text style={styles.subtitle}>Auburn University Dating</Text>

      {/* Toggle between Login and Sign Up */}
      <View style={styles.toggleContainer}>
        <Pressable
          style={[styles.toggleButton, !isSignUpMode && styles.toggleButtonActive]}
          onPress={() => setIsSignUpMode(false)}
        >
          <Text style={[styles.toggleText, !isSignUpMode && styles.toggleTextActive]}>
            Login
          </Text>
        </Pressable>
        <Pressable
          style={[styles.toggleButton, isSignUpMode && styles.toggleButtonActive]}
          onPress={() => setIsSignUpMode(true)}
        >
          <Text style={[styles.toggleText, isSignUpMode && styles.toggleTextActive]}>
            Sign Up
          </Text>
        </Pressable>
      </View>

      <TextInput
        placeholder="Email"
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Password (min 6 characters)"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />

      <Pressable
        style={styles.actionButton}
        onPress={isSignUpMode ? handleSignUp : handleLogin}
      >
        <Text style={styles.actionButtonText}>
          {isSignUpMode ? "Create Account" : "Login"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 36,
    fontWeight: "700",
    textAlign: "center",
    color: COLORS.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: COLORS.muted,
    marginBottom: 40,
  },
  toggleContainer: {
    flexDirection: "row",
    marginBottom: 30,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  toggleButtonActive: {
    backgroundColor: COLORS.primary,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.muted,
  },
  toggleTextActive: {
    color: "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 14,
    marginBottom: 15,
    borderRadius: 10,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  actionButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
