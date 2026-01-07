import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Pressable,
} from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const COLORS = {
  background: "#ffffff",
  primary: "#0A1D37",
  accent: "#E87722",
  text: "#0A1D37",
  muted: "#6b7280",
};

interface ReelsCardProps {
  profile: {
    id: string;
    firstName?: string;
    lastName?: string;
    photoURL?: string | null;
    classYear?: string;
    greekStatus?: string;
    location?: { city: string; state: string };
    bio?: string;
  };
  onInfoPress: () => void;
  onPassPress: () => void;
  onLikePress: () => void;
  onDoubleTap: () => void;
}

export default function ReelsCard({
  profile,
  onInfoPress,
  onPassPress,
  onLikePress,
  onDoubleTap,
}: ReelsCardProps) {
  const [lastTap, setLastTap] = React.useState<number>(0);

  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTap < DOUBLE_TAP_DELAY) {
      onDoubleTap();
    }
    setLastTap(now);
  };

  const displayName = profile.firstName || "Unknown";
  const locationText = profile.location
    ? `${profile.location.city}, ${profile.location.state}`
    : "Location unknown";

  return (
    <View style={styles.container}>
      {/* Full Screen Photo */}
      <Pressable onPress={handleDoubleTap} style={styles.imageContainer}>
        {profile.photoURL ? (
          <Image source={{ uri: profile.photoURL }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>No Photo</Text>
          </View>
        )}

        {/* Gradient Overlay for readability */}
        <View style={styles.gradientOverlay} />
      </Pressable>

      {/* Profile Info Overlay */}
      <View style={styles.infoOverlay}>
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{displayName}</Text>
          {profile.classYear && (
            <Text style={styles.classYear}> • {profile.classYear}</Text>
          )}
        </View>

        {profile.greekStatus && (
          <Text style={styles.detail}>{profile.greekStatus}</Text>
        )}
        <Text style={styles.detail}>{locationText}</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Pressable style={styles.infoButton} onPress={onInfoPress}>
          <Text style={styles.buttonText}>ℹ️</Text>
        </Pressable>

        <Pressable style={styles.passButton} onPress={onPassPress}>
          <Text style={styles.buttonText}>✕</Text>
        </Pressable>

        <Pressable style={styles.likeButton} onPress={onLikePress}>
          <Text style={styles.buttonText}>💚</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: "#000",
  },
  imageContainer: {
    width: "100%",
    height: "100%",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    backgroundColor: COLORS.muted,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "600",
  },
  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 300,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  infoOverlay: {
    position: "absolute",
    bottom: 120,
    left: 20,
    right: 20,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  name: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
  },
  classYear: {
    fontSize: 24,
    fontWeight: "400",
    color: "#fff",
  },
  detail: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 4,
  },
  actionButtons: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  infoButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  passButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(220,38,38,0.9)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  likeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(34,197,94,0.9)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  buttonText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
});
