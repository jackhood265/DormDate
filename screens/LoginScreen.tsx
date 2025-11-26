// screens/LoginScreen.tsx
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { auth, db } from "../firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function LoginScreen() {
  const navigation = useNavigation<any>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>DormDate Login</Text>

      <TextInput
        placeholder="Email"
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />

      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, textAlign: "center", marginBottom: 20 },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
});
