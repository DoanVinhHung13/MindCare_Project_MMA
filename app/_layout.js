import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppProvider } from "../src/contexts/AppContext";
import Toast from "react-native-toast-message";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <AppProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="login" options={{ title: "Đăng nhập" }} />
            <Stack.Screen name="(tabs)" options={{ title: "MindCare" }} />
          </Stack>
          <Toast /> 
        </AppProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}