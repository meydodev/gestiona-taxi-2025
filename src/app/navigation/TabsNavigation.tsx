import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ConfigScreen from '../screens/ConfigScreen';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AlarmComponent from '../screens/AlarmScreen'; // Asegúrate de que esta ruta sea correcta



const Tab = createBottomTabNavigator();

export default function TabsNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: string = 'help-circle-outline'; // Icono por defecto

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'account' : 'account-outline';
                    } else if (route.name === 'Config') {
                        iconName = focused ? 'cog' : 'cog-outline';
                    }else if (route.name === 'Alarm') {
                        iconName = focused ? 'alarm-light' : 'alarm-light-outline';
                    }
                    else if (route.name === 'PrivacyPolicy') {
                        iconName = focused ? 'book' : 'book-outline';
                    }
                    else if (route.name === 'LegalNotice') {
                        iconName = focused ? 'book' : 'book-outline';
                    }
                    else if (route.name === 'TermsOfUse') {
                        iconName = focused ? 'book' : 'book-outline';
                    }


                    return <Icon name={iconName} size={size} color={color} />;
                }
                ,
                tabBarActiveTintColor: '#fff',
                tabBarActiveBackgroundColor: '#eca053', // Fondo para la pestaña activa
                tabBarInactiveTintColor: '#fff',
                tabBarStyle: {
                    backgroundColor: 'orange', // Fondo de la barra inferior
                },
            })}
        >
            {/* Pantalla Inicio */}
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    headerTitle: 'Gestiona Taxi 2025',
                    headerStyle: {
                        backgroundColor: '#eca053',
                    },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                        textAlign: 'center',
                    },
                    tabBarLabel: 'Inicio',
                    headerTitleAlign: 'center',
                }}
            />
    
            
            <Tab.Screen
                name="Alarm"
                component={AlarmComponent}
                options={{
                    headerTitle: 'Alarma',
                    headerStyle: {
                        backgroundColor: '#eca053',
                    },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                        textAlign: 'center',
                    },
                    tabBarLabel: 'Alarma',
                    headerTitleAlign: 'center',
                    tabBarHideOnKeyboard: true,
                }}
            />
           
            {/* Pantalla Perfil */}
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    headerTitle: 'Perfil',
                    headerStyle: {
                        backgroundColor: '#eca053',
                    },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                        textAlign: 'center',
                    },
                    tabBarLabel: 'Perfil',
                    headerTitleAlign: 'center',
                    tabBarHideOnKeyboard: true, //ocultar barra inferior al abrir teclado
                }}
            />

            {/* Pantalla Configuración */}
            <Tab.Screen
                name="Config"
                component={ConfigScreen}
                options={{
                    headerTitle: 'Configuración',
                    headerStyle: {
                        backgroundColor: '#eca053',
                    },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                        textAlign: 'center',
                    },
                    tabBarLabel: 'Configuración',
                    headerTitleAlign: 'center',
                }}
            />          
        </Tab.Navigator>
    );
}
