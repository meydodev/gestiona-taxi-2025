import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './Types'; // Ajusta la ruta si es necesario
import LoginScreen from '../screens/LoginScreen';
import { NavigationContainer } from '@react-navigation/native';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import CalendarScreen from '../screens/CalendarScreens';
import AgendaScreen from '../screens/AgendaSceen';
import PeriodicalSelectScreen from '../screens/PeriodicalSelect';
import MonthlySummaryScreen from '../screens/MonthlySummaryScreen';
import ResumePeriodicalSreen from '../screens/ResumePeriodicalSreen';
import TabsNavigator from './TabsNavigation';
import PrivacyPolicy from '../screens/PrivacyPolicy';
import LegalNotice from '../screens/LegalNoticeScreen';
import TermsOfUse from '../screens/TermsUseScreen';
import ForgotPassword from '../screens/ForgotPasswordScreen';

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
                    options={{ title: "Calendario",
                    headerStyle: { backgroundColor: '#eca053' },
                    headerTintColor: '#fff',
                    headerBackButtonDisplayMode: 'minimal',
                    headerTitleAlign: 'center',
                
                     }}
                />
                <Stack.Screen
                    name="AgendaScreen" // 🔹 Nueva pantalla de la agenda
                    component={AgendaScreen}
                    options={{ title: "Agenda del día",
                    headerStyle: { backgroundColor: '#eca053' },
                    headerTintColor: '#fff',
                    headerTitleAlign: 'center',
                    headerBackButtonDisplayMode: 'minimal',
                }
                    }
                />
                <Stack.Screen
                    name="PeriodicalSelect"
                    component={PeriodicalSelectScreen}
                    options={{ title: "Seleccionar periodicidad",
                    headerTitleAlign: 'center',
                    headerStyle: { backgroundColor: '#eca053' },
                    headerTintColor: '#fff',
                    headerBackButtonDisplayMode: 'minimal',
                     }}
                />
                <Stack.Screen
                    name="MonthlySummary"
                    component={MonthlySummaryScreen}
                    options={{ title: "Resúmenes Mensuales",
                    headerStyle: { backgroundColor: '#eca053' },
                    headerTintColor: '#fff',
                    headerTitleAlign: 'center',
                    headerBackButtonDisplayMode: 'minimal',
                     }}
                />
                <Stack.Screen
                    name="ResumePeriodicalScreen"
                    component={ResumePeriodicalSreen}
                    options={{ title: "Resúmenes Periodicos",
                    headerTitleAlign: 'center',
                    headerStyle: { backgroundColor: '#eca053' },
                    headerTintColor: '#fff',
                    headerBackButtonDisplayMode: 'minimal',
                     }}
                />
                <Stack.Screen
                    name="Tabs"
                    component={TabsNavigator}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="PrivacyPolicy"
                    component={PrivacyPolicy}
                    options={{ title: "Política de Privacidad",
                    headerStyle: { backgroundColor: '#eca053', },
                    headerTintColor: '#fff',
                     }}
                />
                <Stack.Screen
                    name="LegalNotice"
                    component={LegalNotice}
                    options={{ title: "Aviso Legal", 
                    headerStyle: { backgroundColor: '#eca053' },
                    headerTintColor: '#fff',
                     }}
                />
                <Stack.Screen
                    name="TermsOfUse"
                    component={TermsOfUse}
                    options={{ title: "Terminos de uso", 
                    headerStyle: { backgroundColor: '#eca053' },
                    headerTintColor: '#fff',
                     }}
                />
                <Stack.Screen
                    name="ForgotPassword"
                    component={ForgotPassword}
                    options={{ title: "Recuperar contraseña", 
                    headerTitleAlign: 'center',
                    headerBackButtonDisplayMode: 'minimal',
                    headerStyle: { backgroundColor: '#eca053' },
                    headerTintColor: '#fff',
                     }}
                />

            </Stack.Navigator>
        </NavigationContainer>
    );
}
