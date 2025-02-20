import { useState, useEffect } from 'react';
import * as SQLite from 'expo-sqlite';
import bcrypt from 'react-native-bcrypt'; 
import { DatabaseConnection } from '../database/database-connection';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/Types';
import { NavigationProp } from '@react-navigation/native';

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
    if (!email || !password) {
      setError('Todos los campos son obligatorios');
      return;
    }
  
    if (!db) {
      setError('Error en la base de datos');
      return;
    }
  
    try {
      const results: { password: string }[] = await db.getAllAsync(
        'SELECT password FROM users WHERE email = ?',
        [email]
      );
  
      if (!results || results.length === 0) {
        setError('Email o contraseña incorrectos');
        return;
      }
  
      const storedHashedPassword = results[0].password;
  
      // Comparar contraseñas con bcrypt (versión segura)
      const isPasswordValid = bcrypt.compareSync(password, storedHashedPassword);
  
      if (isPasswordValid) {
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
