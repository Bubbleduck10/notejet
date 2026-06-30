import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import CreateScreen from "./src/screens/CreateScreen";
import DecksScreen from "./src/screens/DecksScreen";
import AccountScreen from "./src/screens/AccountScreen";
import { colors } from "./src/theme";

const Tab = createBottomTabNavigator();

const ICONS = { Create: "sparkles", Decks: "albums", Account: "person" };

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerStyle: { backgroundColor: colors.card },
            headerTitleStyle: { color: colors.text, fontWeight: "800" },
            headerShadowVisible: false,
            tabBarActiveTintColor: colors.indigo,
            tabBarInactiveTintColor: colors.muted,
            tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.line },
            tabBarIcon: ({ color, size }) => (
              <Ionicons name={ICONS[route.name]} size={size} color={color} />
            ),
          })}
        >
          <Tab.Screen name="Create" component={CreateScreen} options={{ title: "NoteJet" }} />
          <Tab.Screen name="Decks" component={DecksScreen} />
          <Tab.Screen name="Account" component={AccountScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
