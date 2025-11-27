import React, { useState } from "react";
import { View, Text, Pressable, Image, StyleSheet, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { auth, db, storage } from "../firebase/config";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const COLORS = {
  background: "#ffffff",
  primary: "#0A1D37",
  accent: "#E87722",
  text: "#0A1D37",
  muted: "#6b7280",
};

export default function OnboardingPhotoScreen() {
  const navigation = useNavigation<any>();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function pickImage() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!res.canceled) {
      setSelectedImage(res.assets[0].uri);
    }
  }

  async function handleFinish() {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "Session expired. Please log in again.");
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
      return;
    }

    let photoURL = null;

    try {
      setUploading(true);

      // If user added a photo, upload it
      if (selectedImage) {
        const response = await fetch(selectedImage);
        const blob = await response.blob();

        const storageRef = ref(storage, `profilePhotos/${user.uid}.jpg`);
        await uploadBytes(storageRef, blob);

        photoURL = await getDownloadURL(storageRef);
      }

    } catch (err) {
      console.log("Photo upload error:", err);
      Alert.alert("Error", "Could not upload your photo.");
    }

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        photoURL: photoURL ?? null,
        onboardingComplete: true,
        updatedAt: Date.now(),
      });

      navigation.reset({
        index: 0,
        routes: [{ name: "MainTabs" }],
      });
    } catch (err) {
      console.log("OnboardingPhoto error", err);
      Alert.alert("Error", "Could not finish onboarding.");
    }

    setUploading(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Add a profile photo</Text>
      <Text style={styles.subheading}>
        Profiles with photos get way more attention.
      </Text>

      {selectedImage ? (
        <Image source={{ uri: selectedImage }} style={styles.preview} />
      ) : (
        <View style={styles.photoPlaceholder}>
          <Text style={styles.photoPlaceholderText}>No photo selected</Text>
        </View>
      )}

      <Pressable style={styles.uploadButton} onPress={pickImage}>
        <Text style={styles.uploadButtonText}>
          {selectedImage ? "Change Photo" : "Upload Photo"}
        </Text>
      </Pressable>

      <Pressable style={styles.buttonPrimary} onPress={handleFinish}>
        <Text style={styles.buttonPrimaryText}>
          {uploading ? "Finishing..." : "Finish"}
        </Text>
      </Pressable>

      {!selectedImage && (
        <Pressable style={styles.skipButton} onPress={handleFinish}>
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </Pressable>
      )}
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
  preview: {
    width: "100%",
    height: 260,
    borderRadius: 20,
    marginBottom: 16,
  },
  photoPlaceholder: {
    height: 260,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: COLORS.muted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  photoPlaceholderText: {
    color: COLORS.muted,
    fontSize: 14,
  },
  uploadButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 16,
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
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
  skipButton: {
    marginTop: 12,
    alignItems: "center",
  },
  skipButtonText: {
    color: COLORS.muted,
    fontSize: 14,
  },
});
