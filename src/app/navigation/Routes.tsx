import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './Types'; // Ajusta la ruta si es necesario
import LoginScreen from '../screens/LoginScreen';
import { NavigationContainer } from '@react-navigation/native';
import RegisterScreen from '../screens/RegisterScreen';

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
                
            </Stack.Navigator>
        </NavigationContainer>
    );
}
