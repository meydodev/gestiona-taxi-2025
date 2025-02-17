import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './Types'; // Ajusta la ruta si es necesario
import LoginScreen from '../screens/LoginScreen';
import { NavigationContainer } from '@react-navigation/native';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import CalendarScreen from '../screens/CalendarScreens';
import AgendaScreen from '../screens/AgendaSceen';
import PeriodicalSummaryScreen from '../screens/PeriodicalSummaryScreen';
import MonthlySummaryScreen from '../screens/MonthlySummaryScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Routes() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Login">
                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Register"
                    component={RegisterScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Calendar"
                    component={CalendarScreen}
                    options={{ title: "Calendario" }}
                />
                <Stack.Screen
                    name="AgendaScreen" // 🔹 Nueva pantalla de la agenda
                    component={AgendaScreen}
                    options={{ title: "Agenda del día" }}
                />
                <Stack.Screen
                    name="PeriodicalSummary"
                    component={PeriodicalSummaryScreen}
                    options={{ title: "Resúmenes Periodicos" }}
                />
                <Stack.Screen
                    name="MonthlySummary"
                    component={MonthlySummaryScreen}
                    options={{ title: "Resúmenes Mensuales" }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
