import { useState, useEffect } from 'react';
import * as SQLite from 'expo-sqlite';
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
        const database = await DatabaseConnection.getConnection(); // Esperar la conexión
        setDb(database);

        // Crear la tabla si no existe (esto es opcional, porque ya se creó en RegisterHook)
        await database.execAsync(`
          CREATE TABLE IF NOT EXISTS users (
            id_user INTEGER PRIMARY KEY AUTOINCREMENT, 
            name TEXT,
            surNames TEXT,
            email TEXT, 
            password TEXT
          );
        `);
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
      // Consulta para verificar si el usuario existe
      const results = await db.getAllAsync(
        'SELECT * FROM users WHERE email = ? AND password = ?',
        [email, password]
      );

      if (results.length > 0) {
        console.log('Inicio de sesión exitoso');
        setError('');
        navigation.navigate('Home'); // Puedes cambiar a la pantalla que necesites
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

  return { email, setEmail, password, setPassword, handleLogin, error, setError, showPassword, togglePasswordVisibility };
}
