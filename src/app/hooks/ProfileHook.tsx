import { useState, useEffect } from 'react';
import * as SQLite from 'expo-sqlite';
import bcrypt from 'react-native-bcrypt';
import { DatabaseConnection } from '../database/database-connection';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/Types';
import { NavigationProp } from '@react-navigation/native';
import { Alert } from 'react-native';



export default function ProfileHook() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [name, setName] = useState('');
  const [surNames, setSurNames] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [showConfirmPassword, setShowConfirmPassword] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');


  useEffect(() => {
    const loadUserData = async () => {
      try {
        const database = await DatabaseConnection.getConnection();
        setDb(database);
  
        // Cargar los datos del único usuario registrado
        const results: { name: string; surNames: string; email: string }[] = database.getAllSync(
          'SELECT name, surNames, email FROM users'
        );  

        console.log('results:', results);
  
        // Extraer el primer usuario si existe
        if (results.length > 0) {
          const result = results[0]; // Primer usuario en la lista
          setName(result.name);
          setSurNames(result.surNames);
          setEmail(result.email);
        } else {
          setError('No se encontró un usuario en la base de datos');
        }
      } catch (error) {
        console.error('Error al cargar los datos del usuario:', error);
        setError('Hubo un error al cargar los datos');
      }
    };
  
    loadUserData();
  }, []); 
  

  const handleUpdate = async () => {
    if (!name || !surNames || !email) {
      setError('Todos los campos son obligatorios');
      return;
    }

    if (!db) {
      setError('Error en la base de datos');
      return;
    }

    try {
      setError('');
      setSuccess('');

      let hashedPassword = null;

      // Si el usuario ingresa una nueva contraseña, la encripta antes de actualizarla
      if (newPassword) {
        if (newPassword !== confirmNewPassword) {
          setError('Las contraseñas no coinciden');
          return;
        }
        const saltRounds = 10;
        hashedPassword = bcrypt.hashSync(newPassword, saltRounds);
      }

      if (hashedPassword) {
        await db.runAsync(
          'UPDATE users SET name = ?, surNames = ?, email = ?, password = ?',
          [name, surNames, email, hashedPassword]
        );
      } else {
        await db.runAsync(
          'UPDATE users SET name = ?, surNames = ?, email = ?',
          [name, surNames, email]
        );
      }

      console.log('Perfil actualizado con éxito');
      setSuccess('Perfil actualizado con éxito');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      setError('Hubo un error al actualizar el perfil');
    }
  };


 

const handleDelete = async () => {
  Alert.alert(
    'Confirmación', 
    '¿Estás seguro de que deseas eliminar todos los datos? Esta acción no se puede deshacer.', 
    [
      { text: 'Cancelar', style: 'cancel' }, // Opción para cancelar
      { 
        text: 'Eliminar', 
        style: 'destructive', // Color rojo en iOS
        onPress: async () => { // Solo ejecuta la eliminación si el usuario confirma
          if (!db) {
            setError('Error en la base de datos');
            return;
          }
        
          try {
            setError('');
            await db.runAsync('DELETE FROM users');
            await db.runAsync('DELETE FROM payments');
            await db.runAsync('DELETE FROM expenses');
            await db.runAsync('DELETE FROM kms');
            console.log('Perfil eliminado con éxito');
            navigation.navigate('Login');
          } catch (error) {
            console.error('Error al eliminar perfil:', error);
            setError('Hubo un error al eliminar el perfil');
          }
        }
      }
    ]
  );
};


  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword((prev) => !prev);

  return {
    name, setName, surNames, setSurNames, email, setEmail,
    newPassword, setNewPassword, confirmNewPassword, setConfirmNewPassword,
    showPassword, togglePasswordVisibility, showConfirmPassword, toggleConfirmPasswordVisibility,
    handleUpdate, error, setError, handleDelete, success
  };
}
