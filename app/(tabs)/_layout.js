import { MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import AuthGuard from "../../src/components/AuthGuard";

export default function TabsLayout() {
  return (
    <AuthGuard>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#e91e63",
          tabBarInactiveTintColor: "#999",
          headerShown: true,
          headerStyle: {
            backgroundColor: "#e91e63",
          },
          headerTintColor: "#fff",
          tabBarStyle: {
            backgroundColor: "#fff",
            borderTopWidth: 1,
            borderTopColor: "#e0e0e0",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Lịch",
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="calendar-today" size={size} color={color} />
            ),
            headerTitle: "Theo dõi chu kỳ",
          }}
        />
        <Tabs.Screen
          name="insights"
          options={{
            title: "Thống kê",
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="bar-chart" size={size} color={color} />
            ),
            headerTitle: "Thống kê chu kỳ",
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Cài đặt",
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="settings" size={size} color={color} />
            ),
            headerTitle: "Cài đặt",
          }}
        />
      </Tabs>
    </AuthGuard>
  );
}
