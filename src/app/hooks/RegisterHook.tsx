import { useState, useEffect } from 'react';
import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto'; // ✅ Usa expo-crypto para encriptar contraseñas
import { DatabaseConnection } from '../database/database-connection';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/Types';
import { NavigationProp } from '@react-navigation/native';

// 🔐 Función para generar hash SHA-256
const hashPassword = async (password: string) => {
  return await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, password);
};

export default function RegisterHook() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [name, setName] = useState('');
  const [surNames, setSurNames] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [showConfirmPassword, setShowConfirmPassword] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const initDb = async () => {
      try {
        const database = await DatabaseConnection.getConnection();
        setDb(database);

        // 🗄️ Crear tabla de usuarios si no existe
        await database.execAsync(`
          CREATE TABLE IF NOT EXISTS users (
            id_user INTEGER PRIMARY KEY AUTOINCREMENT, 
            name TEXT,
            surNames TEXT,
            email TEXT UNIQUE, 
            password TEXT
          );
        `);
      } catch (err) {
        console.error('Error al conectar con la base de datos:', err);
      }
    };
    initDb();
  }, []);

  const handleRegister = async () => {
    if (!name || !surNames || !email || !password || !confirmPassword) {
      setError('Todos los campos son obligatorios');
      return;
    }
  
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
  
    if (!db) {
      setError('Error en la base de datos');
      return;
    }
  
    try {
      setError('');
  
      // 🔍 Verificar si ya existe un usuario
      const result = await db.getFirstAsync<{ userCount?: number }>(
        'SELECT COUNT(*) as userCount FROM users'
      );
  
      const userCount = result?.userCount ?? 0; // 🔥 Si result es undefined, asigna 0
  
      if (userCount > 0) {
        alert('Ya existe un usuario registrado. No puedes registrar más.');
        return;
      }
  
      // 🔒 Encriptar la contraseña antes de guardarla
      const hashedPassword = await hashPassword(password.trim());
  
      // 📝 Insertar nuevo usuario
      await db.runAsync(
        'INSERT INTO users (name, surNames, email, password) VALUES (?, ?, ?, ?)',
        [name, surNames, email, hashedPassword]
      );
  
      console.log('Usuario registrado con éxito');
      alert('Usuario registrado con éxito'); // Opcional
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      setError('Hubo un error al registrar el usuario');
    }
  };
  

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword((prev) => !prev);

  return {
    name, setName, surNames, setSurNames, email, setEmail,
    password, setPassword, confirmPassword, setConfirmPassword,
    showPassword, togglePasswordVisibility, showConfirmPassword, toggleConfirmPasswordVisibility,
    handleRegister, error, setError
  };
}
