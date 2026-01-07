// screens/HomeScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { auth, db } from "../firebase/config";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import SwipeableReels from "../components/SwipeableReels";
import BioModal from "../components/BioModal";
import MatchModal from "../components/MatchModal";

const COLORS = {
  background: "#ffffff",
  primary: "#0A1D37",
  accent: "#E87722",
  text: "#0A1D37",
  muted: "#6b7280",
};

interface Profile {
  id: string;
  firstName?: string;
  lastName?: string;
  photoURL?: string | null;
  classYear?: string;
  greekStatus?: string;
  location?: { city: string; state: string };
  bio?: string;
}

export default function HomeScreen() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [bioModalVisible, setBioModalVisible] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [matchModalVisible, setMatchModalVisible] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<Profile | null>(null);

  async function loadProfiles() {
    try {
      const user = auth.currentUser;

      if (!user) {
        console.log("No user logged in — skipping profile load.");
        setProfiles([]);
        setLoading(false);
        return;
      }

      // Get current user's swipes to filter already-seen profiles
      const currentUserDocRef = doc(db, "users", user.uid);
      const currentUserSnap = await getDoc(currentUserDocRef);

      if (!currentUserSnap.exists()) {
        console.log("Current user doc not found");
        setProfiles([]);
        setLoading(false);
        return;
      }

      const currentUserData = currentUserSnap.data();
      const likedIds = currentUserData?.likes || [];
      const passedIds = currentUserData?.passes || [];
      const seenIds = [...likedIds, ...passedIds];

      // Query: Only Auburn students (classYear exists)
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("classYear", "!=", null));

      const snap = await getDocs(q);

      const results: Profile[] = [];
      snap.forEach((d) => {
        // Filter out current user and already-seen profiles
        if (d.id !== user.uid && !seenIds.includes(d.id)) {
          results.push({ id: d.id, ...d.data() } as Profile);
        }
      });

      setProfiles(results);
    } catch (err) {
      console.log("HomeScreen loadProfiles error:", err);
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfiles();
  }, []);

  async function handleLike(profileId: string) {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      // Initialize likes array if it doesn't exist
      if (!userSnap.exists()) {
        await setDoc(userRef, { likes: [profileId] }, { merge: true });
      } else {
        await updateDoc(userRef, {
          likes: arrayUnion(profileId),
        });
      }

      // Check for mutual match
      await checkForMatch(profileId);
    } catch (err) {
      console.log("Error saving like:", err);
      Alert.alert("Error", "Could not save your like. Please try again.");
    }
  }

  async function handlePass(profileId: string) {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      // Initialize passes array if it doesn't exist
      if (!userSnap.exists()) {
        await setDoc(userRef, { passes: [profileId] }, { merge: true });
      } else {
        await updateDoc(userRef, {
          passes: arrayUnion(profileId),
        });
      }
    } catch (err) {
      console.log("Error saving pass:", err);
    }
  }

  async function checkForMatch(likedUserId: string) {
    const user = auth.currentUser;
    if (!user) return;

    try {
      // Check if the other user has liked us back
      const likedUserRef = doc(db, "users", likedUserId);
      const likedUserSnap = await getDoc(likedUserRef);

      if (likedUserSnap.exists()) {
        const likedUserData = likedUserSnap.data();
        const theirLikes = likedUserData?.likes || [];

        // If they liked us too, it's a match!
        if (theirLikes.includes(user.uid)) {
          // Save match for both users
          const currentUserRef = doc(db, "users", user.uid);
          await updateDoc(currentUserRef, {
            matches: arrayUnion(likedUserId),
          });

          await updateDoc(likedUserRef, {
            matches: arrayUnion(user.uid),
          });

          // Show match modal
          const matchProfile = profiles.find((p) => p.id === likedUserId);
          if (matchProfile) {
            setMatchedProfile(matchProfile);
            setMatchModalVisible(true);
          }
        }
      }
    } catch (err) {
      console.log("Error checking for match:", err);
    }
  }

  function handleShowBio(profile: Profile) {
    setSelectedProfile(profile);
    setBioModalVisible(true);
  }

  function handleBioLike() {
    if (selectedProfile) {
      handleLike(selectedProfile.id);
      setBioModalVisible(false);
      setSelectedProfile(null);
    }
  }

  function handleBioPass() {
    if (selectedProfile) {
      handlePass(selectedProfile.id);
      setBioModalVisible(false);
      setSelectedProfile(null);
    }
  }

  function handleKeepSwiping() {
    setMatchModalVisible(false);
    setMatchedProfile(null);
  }

  function handleSendMessage() {
    setMatchModalVisible(false);
    // TODO: Navigate to chat screen with matched user
    Alert.alert("Feature Coming Soon", "Messaging will be available soon!");
  }

  function handleEndOfProfiles() {
    // User has seen all profiles
    setProfiles([]);
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>Finding Auburn students...</Text>
      </View>
    );
  }

  if (profiles.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyTitle}>No more profiles nearby</Text>
        <Text style={styles.emptySubtitle}>
          Once more Auburn students sign up, they'll appear here.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.reelsContainer}>
      <SwipeableReels
        profiles={profiles}
        onLike={handleLike}
        onPass={handlePass}
        onShowBio={handleShowBio}
        onEnd={handleEndOfProfiles}
      />

      <BioModal
        visible={bioModalVisible}
        profile={selectedProfile}
        onClose={() => setBioModalVisible(false)}
        onLike={handleBioLike}
        onPass={handleBioPass}
      />

      <MatchModal
        visible={matchModalVisible}
        matchedProfile={matchedProfile}
        onSendMessage={handleSendMessage}
        onKeepSwiping={handleKeepSwiping}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  reelsContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.muted,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.primary,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: "center",
    marginTop: 8,
  },
});
