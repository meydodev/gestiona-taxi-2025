import { useState, useEffect } from 'react';
import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto'; // ✅ Importar expo-crypto para generar hashes
import { DatabaseConnection } from '../database/database-connection';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/Types';
import { NavigationProp } from '@react-navigation/native';

// 🔐 Función para generar hash SHA-256 usando `expo-crypto`
const hashPassword = async (password: string) => {
  return await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, password);
};

export default function LoginHook() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const initDb = async () => {
      try {
        const database = await DatabaseConnection.getConnection();
        setDb(database);
      } catch (err) {
        console.error('Error al conectar con la base de datos:', err);
      }
    };
    initDb();
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Todos los campos son obligatorios');
      return;
    }
  
    if (!db) {
      setError('Error en la base de datos');
      return;
    }
  
    try {
      // 🔍 Obtener el usuario de la BD
      const result = await db.getFirstAsync<{ password?: string }>(
        'SELECT password FROM users WHERE email = ? LIMIT 1',
        [email.trim().toLowerCase()]
      );
  
      if (!result || !result.password) { // Verifica si result es undefined o vacío
        setError('Email o contraseña incorrectos');
        return;
      }
  
      const storedHashedPassword = result.password;
      const hashedInputPassword = await hashPassword(password.trim()); // 🔐 Generar hash

      if (hashedInputPassword === storedHashedPassword) {
        console.log('Inicio de sesión exitoso');
        setError('');
        navigation.navigate('Tabs');
      } else {
        setError('Email o contraseña incorrectos');
      }
    } catch (error) {
      console.error('Error al verificar usuario:', error);
      setError('Hubo un problema al iniciar sesión');
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return {
    email, setEmail, password, setPassword,
    handleLogin, error, setError,
    showPassword, togglePasswordVisibility
  };
}
