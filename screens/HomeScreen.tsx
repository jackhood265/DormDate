// screens/HomeScreen.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  runOnJS,
} from "react-native-reanimated";

import { auth, db } from "../firebase/config";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  limit,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

type UserProfile = {
  id: string;
  name: string;
  major?: string;
  year?: string;
  bio?: string;
  photoUrl?: string;
};

const { width } = Dimensions.get("window");
const SWIPE_THRESHOLD = width * 0.25;
const OFFSCREEN = width * 1.5;

type ContextType = {
  startX: number;
  startY: number;
};

export default function HomeScreen() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // Card animation style
  const animatedCardStyle = useAnimatedStyle(() => {
    const rotate = (translateX.value / width) * 20; // degrees
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const removeTopProfile = useCallback(() => {
    setProfiles((current) => current.slice(1));
    translateX.value = 0;
    translateY.value = 0;
  }, [translateX, translateY]);

  const handleSwipeResult = useCallback(
    async (direction: "left" | "right", swipedProfile: UserProfile | undefined) => {
      if (!swipedProfile) return;
      const me = auth.currentUser;
      if (!me) return;

      try {
        if (direction === "right") {
          // Save like
          await setDoc(doc(db, "users", me.uid, "likes", swipedProfile.id), {
            createdAt: serverTimestamp(),
          });

          // Check if they already liked me
          const reciprocalRef = doc(db, "users", swipedProfile.id, "likes", me.uid);
          const reciprocalSnap = await getDoc(reciprocalRef);

          if (reciprocalSnap.exists()) {
            const matchId =
              me.uid < swipedProfile.id
                ? `${me.uid}_${swipedProfile.id}`
                : `${swipedProfile.id}_${me.uid}`;

            await setDoc(doc(db, "matches", matchId), {
              users: [me.uid, swipedProfile.id],
              createdAt: serverTimestamp(),
            });

            console.log("MATCH with", swipedProfile.name);
          }
        } else {
          // Save pass
          await setDoc(doc(db, "users", me.uid, "passes", swipedProfile.id), {
            createdAt: serverTimestamp(),
          });
        }
      } catch (e) {
        console.log("Error saving swipe result", e);
      }
    },
    []
  );

  // This runs on the JS thread after the animation finishes
  const onSwipeComplete = useCallback(
    (direction: "left" | "right") => {
      const swipedProfile = profiles[0];
      if (!swipedProfile) return;
      handleSwipeResult(direction, swipedProfile);
      removeTopProfile();
    },
    [profiles, handleSwipeResult, removeTopProfile]
  );

  const gestureHandler = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    ContextType
  >({
    onStart: (_, ctx) => {
      ctx.startX = translateX.value;
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx) => {
      translateX.value = ctx.startX + event.translationX;
      translateY.value = ctx.startY + event.translationY;
    },
    onEnd: (event) => {
      const swipedRight = translateX.value > SWIPE_THRESHOLD;
      const swipedLeft = translateX.value < -SWIPE_THRESHOLD;

      if (swipedRight || swipedLeft) {
        const direction: "left" | "right" = swipedRight ? "right" : "left";
        const toX = swipedRight ? OFFSCREEN : -OFFSCREEN;

        translateX.value = withSpring(
          toX,
          { velocity: event.velocityX },
          (finished) => {
            if (finished) {
              runOnJS(onSwipeComplete)(direction);
            }
          }
        );
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    },
  });

  // Fetch profiles (Auburn only for now)
  useEffect(() => {
    const fetchProfiles = async () => {
      const me = auth.currentUser;
      if (!me) {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "users"),
          where("school", "==", "Auburn"),
          limit(25)
        );
        const snapshot = await getDocs(q);

        const list: UserProfile[] = [];
        snapshot.forEach((docSnap) => {
          if (docSnap.id === me.uid) return;
          const data = docSnap.data() as any;
          list.push({
            id: docSnap.id,
            name: data.name || "No name",
            major: data.major,
            year: data.year,
            bio: data.bio,
            photoUrl:
              data.photoUrl ||
              "https://via.placeholder.com/400x600.png?text=DormDate",
          });
        });

        setProfiles(list);
      } catch (e) {
        console.log("Error fetching profiles", e);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (!profiles.length) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.emptyTitle}>No more profiles nearby 👀</Text>
        <Text style={styles.emptySubtitle}>
          Once more Auburn students sign up, they’ll appear here.
        </Text>
      </SafeAreaView>
    );
  }

  const visibleProfiles = profiles.slice(0, 3); // top 3 stacked

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.deckContainer}>
        {visibleProfiles
          .slice()
          .reverse()
          .map((profile, index) => {
            const isTop = index === visibleProfiles.length - 1;
            const cardOffset = isTop ? 0 : (visibleProfiles.length - 1 - index) * 8;
            const cardStyle = isTop ? animatedCardStyle : undefined;

            const Card = (
              <Animated.View
                key={profile.id}
                style={[
                  styles.card,
                  { top: cardOffset, left: cardOffset, right: cardOffset },
                  cardStyle,
                ]}
              >
                <Image
                  source={{ uri: profile.photoUrl }}
                  style={styles.photo}
                  resizeMode="cover"
                />
                <View style={styles.info}>
                  <Text style={styles.name}>{profile.name}</Text>
                  {(profile.major || profile.year) && (
                    <Text style={styles.details}>
                      {[profile.year, profile.major].filter(Boolean).join(" • ")}
                    </Text>
                  )}
                  {profile.bio ? (
                    <Text style={styles.bio} numberOfLines={3}>
                      {profile.bio}
                    </Text>
                  ) : null}
                </View>
              </Animated.View>
            );

            if (isTop) {
              return (
                <PanGestureHandler key={profile.id} onGestureEvent={gestureHandler}>
                  {Card}
                </PanGestureHandler>
              );
            }

            return Card;
          })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  deckContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    position: "absolute",
    width: width * 0.9,
    height: "80%",
    borderRadius: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 5,
    overflow: "hidden",
  },
  photo: {
    flex: 1,
  },
  info: {
    padding: 16,
    backgroundColor: "#fff",
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  details: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: "#333",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});

