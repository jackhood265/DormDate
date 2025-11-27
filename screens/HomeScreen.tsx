// screens/HomeScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { auth, db } from "../firebase/config";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";

const COLORS = {
  background: "#ffffff",
  primary: "#0A1D37",
  accent: "#E87722",
  text: "#0A1D37",
  muted: "#6b7280",
};

export default function HomeScreen() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadProfiles() {
    try {
      const user = auth.currentUser;

      // 🔒 TS-safe: we null-check *inside* this function
      if (!user) {
        console.log("No user logged in — skipping profile load.");
        setProfiles([]);
        setLoading(false);
        return;
      }

      // Get current user's document (if you need it later)
      const currentUserDocRef = doc(db, "users", user.uid);
      const currentUserSnap = await getDoc(currentUserDocRef);

      if (!currentUserSnap.exists()) {
        console.log("Current user doc not found");
        setProfiles([]);
        setLoading(false);
        return;
      }

      const currentUserData = currentUserSnap.data();
      // You can use currentUserData later for filters if you want

      // Query: Only Auburn students (classYear exists)
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("classYear", "!=", null));

      const snap = await getDocs(q);

      const results: any[] = [];
      snap.forEach((d) => {
        if (d.id !== user.uid) {
          results.push({ id: d.id, ...d.data() });
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
    <View style={styles.container}>
      <Text style={styles.heading}>Potential Matches</Text>

      {profiles.map((p) => (
        <View key={p.id} style={styles.profileCard}>
          <Text style={styles.profileName}>{p.firstName || "Unknown"}</Text>
          <Text style={styles.profileDetail}>
            {p.classYear || "Class year unknown"}
          </Text>
          <Text style={styles.profileDetail}>
            {p.greekStatus || "Greek life: N/A"}
          </Text>
        </View>
      ))}
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
  loadingText: {
    marginTop: 12,
    color: COLORS.muted,
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
    color: COLORS.primary,
    alignSelf: "flex-start",
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
  profileCard: {
    width: "100%",
    backgroundColor: "#f7f7f7",
    padding: 16,
    borderRadius: 10,
    marginBottom: 14,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primary,
  },
  profileDetail: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 4,
  },
});
