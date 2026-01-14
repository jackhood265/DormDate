import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { auth, db } from "../firebase/config";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

const COLORS = {
  background: "#ffffff",
  primary: "#0A1D37",
  accent: "#E87722",
  text: "#0A1D37",
  muted: "#6b7280",
};

interface Match {
  id: string;
  firstName?: string;
  lastName?: string;
  photoURL?: string | null;
  lastMessage?: string;
  lastMessageTime?: number;
}

export default function MessagesScreen() {
  const navigation = useNavigation<any>();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  // Reload matches every time the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadMatches();
    }, [])
  );

  async function loadMatches() {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.log("📭 MessagesScreen: No user logged in");
        setLoading(false);
        return;
      }

      console.log(`📬 MessagesScreen: Loading matches for user ${user.uid}`);

      // Get current user's matches
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        console.log("📭 MessagesScreen: User document doesn't exist");
        setLoading(false);
        return;
      }

      const userData = userSnap.data();
      const matchIds = userData?.matches || [];

      console.log(`📊 MessagesScreen: Found ${matchIds.length} match IDs:`, matchIds);

      // DEBUG: ALWAYS show this alert to see what's in the database
      Alert.alert(
        "📬 Messages Debug (ALWAYS SHOWS)",
        `User: ${user.uid.substring(0, 8)}...\n\nMatch IDs found: ${matchIds.length}\n\nIDs: ${matchIds.length > 0 ? matchIds.map((id: string) => id.substring(0, 8)).join(", ") : "NONE"}`,
        [{ text: "OK" }]
      );

      if (matchIds.length === 0) {
        console.log("📭 MessagesScreen: No matches found");
        setLoading(false);
        return;
      }

      // Fetch each match's profile
      const matchProfiles: Match[] = [];
      for (const matchId of matchIds) {
        console.log(`👤 MessagesScreen: Fetching profile for ${matchId}`);
        const matchRef = doc(db, "users", matchId);
        const matchSnap = await getDoc(matchRef);

        if (matchSnap.exists()) {
          const matchData = matchSnap.data();
          matchProfiles.push({
            id: matchId,
            firstName: matchData.firstName,
            lastName: matchData.lastName,
            photoURL: matchData.photoURL,
            lastMessage: "Start chatting!", // Placeholder for now
            lastMessageTime: Date.now(),
          });
          console.log(`✅ MessagesScreen: Added ${matchData.firstName} to matches`);
        }
      }

      console.log(`✅ MessagesScreen: Loaded ${matchProfiles.length} match profiles`);
      setMatches(matchProfiles);
    } catch (err) {
      console.error("❌ MessagesScreen: Error loading matches:", err);
      Alert.alert("Error Loading Matches", String(err));
    } finally {
      setLoading(false);
    }
  }

  function handleMatchPress(match: Match) {
    navigation.navigate("Chat", { matchId: match.id, matchName: match.firstName });
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>Loading matches...</Text>
      </View>
    );
  }

  if (matches.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyTitle}>No Matches Yet</Text>
        <Text style={styles.emptySubtitle}>
          Start swiping to find your matches!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.matchCard}
            onPress={() => handleMatchPress(item)}
          >
            {item.photoURL ? (
              <Image source={{ uri: item.photoURL }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {item.firstName?.charAt(0) || "?"}
                </Text>
              </View>
            )}

            <View style={styles.matchInfo}>
              <Text style={styles.matchName}>
                {item.firstName || "Unknown"} {item.lastName || ""}
              </Text>
              <Text style={styles.lastMessage} numberOfLines={1}>
                {item.lastMessage}
              </Text>
            </View>

            <Text style={styles.chevron}>›</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: 20,
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
  matchCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.accent,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  matchInfo: {
    flex: 1,
  },
  matchName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: COLORS.muted,
  },
  chevron: {
    fontSize: 24,
    color: COLORS.muted,
  },
});
