import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import HomeScreen from "../screens/HomeScreen";
import DiscoverScreen from "../screens/DiscoverScreen";
import MessagesScreen from "../screens/MessagesScreen";
import ProfileScreen from "../screens/ProfileScreen";
// import CustomTabBar from "../components/CustomTabBar"; // optional

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // Hide tab bar on Home screen for immersive Reels experience
        tabBarStyle: route.name === 'Home' ? { display: 'none' } : undefined,
        // Hide header on Home screen too
        headerShown: route.name === 'Home' ? false : true,
      })}
      // tabBar={(props) => <CustomTabBar {...props} />} // enable if you have CustomTabBar
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
