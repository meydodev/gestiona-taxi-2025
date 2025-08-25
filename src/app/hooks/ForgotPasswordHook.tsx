import { useState } from 'react';
import { DatabaseConnection } from '../database/database-connection';
import { Alert } from 'react-native';
import * as Crypto from 'expo-crypto';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/Types';
import { NavigationProp } from '@react-navigation/native';
import { RouteProp, useRoute } from '@react-navigation/native';


export default function ForgotPasswordHook() {

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(true);
    const [error, setError] = useState('');
    type ForgotPasswordRouteProp = RouteProp<RootStackParamList, 'ForgotPassword'>;
    const route = useRoute<ForgotPasswordRouteProp>();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const email = route.params?.email || '';

    const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

    const handleChangePassword = async () => {
        setError('');

        if (!newPassword || !confirmPassword) {
            setError('Todos los campos son obligatorios');
            return;
        }

        if (newPassword.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        try {
            const hashedPassword = await Crypto.digestStringAsync(
                Crypto.CryptoDigestAlgorithm.SHA256,
                newPassword.trim()
            );

            const db = await DatabaseConnection.getConnection();
            await db.runAsync('UPDATE users SET password = ? WHERE email = ?', [
                hashedPassword,
                email,
            ]);

            Alert.alert('Éxito', 'Contraseña actualizada correctamente');
            navigation.navigate('Login'); // ✅ Ya no dará error
        } catch (err) {
            console.error('Error al cambiar la contraseña:', err);
            setError('Hubo un error al cambiar la contraseña');
        }
    };

    return {
        newPassword,
        setNewPassword,
        confirmPassword,
        setConfirmPassword,
        showPassword,
        togglePasswordVisibility,
        error,
        handleChangePassword,
        setError,
    }


}