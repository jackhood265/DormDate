import React from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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

interface BioModalProps {
  visible: boolean;
  profile: Profile | null;
  onClose: () => void;
  onLike: () => void;
  onPass: () => void;
}

export default function BioModal({
  visible,
  profile,
  onClose,
  onLike,
  onPass,
}: BioModalProps) {
  if (!profile) return null;

  const displayName = profile.firstName
    ? `${profile.firstName}${profile.lastName ? " " + profile.lastName : ""}`
    : "Unknown";
  const locationText = profile.location
    ? `${profile.location.city}, ${profile.location.state}`
    : "Location unknown";

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
      statusBarTranslucent={false}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        {/* Close Button */}
        <Pressable style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </Pressable>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Profile Photo */}
          {profile.photoURL ? (
            <Image
              source={{ uri: profile.photoURL }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>No Photo</Text>
            </View>
          )}

          {/* Profile Info */}
          <View style={styles.infoSection}>
            <Text style={styles.name}>{displayName}</Text>

            {profile.classYear && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Class Year:</Text>
                <Text style={styles.value}>{profile.classYear}</Text>
              </View>
            )}

            {profile.greekStatus && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Greek Life:</Text>
                <Text style={styles.value}>{profile.greekStatus}</Text>
              </View>
            )}

            <View style={styles.infoRow}>
              <Text style={styles.label}>Location:</Text>
              <Text style={styles.value}>{locationText}</Text>
            </View>

            {/* Bio */}
            {profile.bio && (
              <View style={styles.bioSection}>
                <Text style={styles.bioLabel}>About</Text>
                <Text style={styles.bioText}>{profile.bio}</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Pressable style={styles.passButton} onPress={onPass}>
            <Text style={styles.passButtonText}>Pass ✕</Text>
          </Pressable>

          <Pressable style={styles.likeButton} onPress={onLike}>
            <Text style={styles.likeButtonText}>Like 💚</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  profileImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 1.2,
    resizeMode: "cover",
  },
  placeholderImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 1.2,
    backgroundColor: COLORS.muted,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "600",
  },
  infoSection: {
    padding: 20,
  },
  name: {
    fontSize: 32,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
    width: 100,
  },
  value: {
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
  },
  bioSection: {
    marginTop: 20,
  },
  bioLabel: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 10,
  },
  bioText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
  },
  actionButtons: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: 20,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  passButton: {
    flex: 1,
    backgroundColor: "#dc2626",
    paddingVertical: 16,
    borderRadius: 999,
    marginRight: 10,
    alignItems: "center",
  },
  passButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  likeButton: {
    flex: 1,
    backgroundColor: "#22c55e",
    paddingVertical: 16,
    borderRadius: 999,
    marginLeft: 10,
    alignItems: "center",
  },
  likeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
