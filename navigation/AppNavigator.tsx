import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/LoginScreen";
import BottomTabs from "./BottomTabs";
import ChatScreen from "../screens/ChatScreen";
import EditProfileScreen from "../screens/EditProfileScreen";

import OnboardingNameScreen from "../screens/OnboardingNameScreen";
import OnboardingGenderScreen from "../screens/OnboardingGenderScreen";
import OnboardingClassYearScreen from "../screens/OnboardingClassYearScreen";
import OnboardingGreekScreen from "../screens/OnboardingGreekScreen";
import OnboardingLocationScreen from "../screens/OnboardingLocationScreen";
import OnboardingBioScreen from "../screens/OnboardingBioScreen";
import OnboardingPhotoScreen from "../screens/OnboardingPhotoScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Auth */}
      <Stack.Screen name="Login" component={LoginScreen} />

      {/* Onboarding */}
      <Stack.Screen name="OnboardingName" component={OnboardingNameScreen} />
      <Stack.Screen name="OnboardingGender" component={OnboardingGenderScreen} />
      <Stack.Screen name="OnboardingClassYear" component={OnboardingClassYearScreen} />
      <Stack.Screen name="OnboardingGreek" component={OnboardingGreekScreen} />
      <Stack.Screen name="OnboardingLocation" component={OnboardingLocationScreen} />
      <Stack.Screen name="OnboardingBio" component={OnboardingBioScreen} />
      <Stack.Screen name="OnboardingPhoto" component={OnboardingPhotoScreen} />

      {/* Main App */}
      <Stack.Screen name="MainTabs" component={BottomTabs} />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={({ route }) => ({
          headerShown: true,
          title: (route.params as any)?.matchName || "Chat",
          headerStyle: { backgroundColor: "#0A1D37" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "600" },
        })}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          headerShown: true,
          title: "Edit Profile",
          headerStyle: { backgroundColor: "#0A1D37" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "600" },
        }}
      />
    </Stack.Navigator>
  );
}
