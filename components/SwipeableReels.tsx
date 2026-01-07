import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
} from "react-native";
import ReelsCard from "./ReelsCard";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const SWIPE_THRESHOLD = 80;

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

interface SwipeableReelsProps {
  profiles: Profile[];
  onLike: (profileId: string) => void;
  onPass: (profileId: string) => void;
  onShowBio: (profile: Profile) => void;
  onEnd: () => void;
}

export default function SwipeableReels({
  profiles,
  onLike,
  onPass,
  onShowBio,
  onEnd,
}: SwipeableReelsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const pan = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to vertical swipes
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        // Update pan value based on vertical movement
        pan.setValue(gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dy, vy } = gestureState;

        // Swipe up (next profile)
        if (dy < -SWIPE_THRESHOLD || vy < -0.5) {
          handleSwipeUp();
        }
        // Swipe down (previous profile)
        else if (dy > SWIPE_THRESHOLD || vy > 0.5) {
          handleSwipeDown();
        }
        // Reset position if swipe was not strong enough
        else {
          Animated.spring(pan, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const handleSwipeUp = () => {
    Animated.timing(pan, {
      toValue: -SCREEN_HEIGHT,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      goToNext();
      pan.setValue(0);
    });
  };

  const handleSwipeDown = () => {
    if (currentIndex > 0) {
      Animated.timing(pan, {
        toValue: SCREEN_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        goToPrevious();
        pan.setValue(0);
      });
    } else {
      // Can't go back further, reset
      Animated.spring(pan, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  };

  const goToNext = () => {
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // End of profiles
      onEnd();
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleLike = () => {
    const profile = profiles[currentIndex];
    if (profile) {
      onLike(profile.id);
      handleSwipeUp();
    }
  };

  const handlePass = () => {
    const profile = profiles[currentIndex];
    if (profile) {
      onPass(profile.id);
      handleSwipeUp();
    }
  };

  const handleDoubleTapLike = () => {
    handleLike();
  };

  const handleShowBio = () => {
    const profile = profiles[currentIndex];
    if (profile) {
      onShowBio(profile);
    }
  };

  if (profiles.length === 0 || currentIndex >= profiles.length) {
    return null;
  }

  const currentProfile = profiles[currentIndex];

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.cardContainer,
          {
            transform: [{ translateY: pan }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <ReelsCard
          profile={currentProfile}
          onInfoPress={handleShowBio}
          onPassPress={handlePass}
          onLikePress={handleLike}
          onDoubleTap={handleDoubleTapLike}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  cardContainer: {
    flex: 1,
  },
});
