import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Pressable,
  Image,
  Animated,
  Dimensions,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const COLORS = {
  background: "#ffffff",
  primary: "#0A1D37",
  accent: "#E87722",
  text: "#0A1D37",
  muted: "#6b7280",
};

interface MatchModalProps {
  visible: boolean;
  matchedProfile: {
    id: string;
    firstName?: string;
    photoURL?: string | null;
  } | null;
  onSendMessage: () => void;
  onKeepSwiping: () => void;
}

export default function MatchModal({
  visible,
  matchedProfile,
  onSendMessage,
  onKeepSwiping,
}: MatchModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
    }
  }, [visible]);

  if (!matchedProfile) return null;

  const displayName = matchedProfile.firstName || "Someone";

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onKeepSwiping}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Match Celebration */}
          <Text style={styles.matchTitle}>It's a Match! 🎉</Text>
          <Text style={styles.matchSubtitle}>
            You and {displayName} liked each other
          </Text>

          {/* Profile Photo */}
          <View style={styles.photoContainer}>
            {matchedProfile.photoURL ? (
              <Image
                source={{ uri: matchedProfile.photoURL }}
                style={styles.profilePhoto}
              />
            ) : (
              <View style={styles.placeholderPhoto}>
                <Text style={styles.placeholderText}>
                  {displayName.charAt(0)}
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <Pressable style={styles.messageButton} onPress={onSendMessage}>
            <Text style={styles.messageButtonText}>Send a Message 💬</Text>
          </Pressable>

          <Pressable style={styles.continueButton} onPress={onKeepSwiping}>
            <Text style={styles.continueButtonText}>Keep Swiping</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: SCREEN_WIDTH - 40,
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
  },
  matchTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 10,
    textAlign: "center",
  },
  matchSubtitle: {
    fontSize: 16,
    color: COLORS.muted,
    marginBottom: 30,
    textAlign: "center",
  },
  photoContainer: {
    marginBottom: 30,
  },
  profilePhoto: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    borderColor: COLORS.accent,
  },
  placeholderPhoto: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: COLORS.muted,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: COLORS.accent,
  },
  placeholderText: {
    fontSize: 48,
    fontWeight: "700",
    color: "#fff",
  },
  messageButton: {
    width: "100%",
    backgroundColor: COLORS.accent,
    paddingVertical: 16,
    borderRadius: 999,
    marginBottom: 12,
    alignItems: "center",
  },
  messageButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  continueButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: "center",
  },
  continueButtonText: {
    color: COLORS.muted,
    fontSize: 16,
    fontWeight: "600",
  },
});
