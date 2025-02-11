import { useState, useEffect } from 'react';
import * as SQLite from 'expo-sqlite';
import { DatabaseConnection } from '../database/database-connection';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/Types'
import { NavigationProp } from '@react-navigation/native';



export default function RegisterHook(){

    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
    const [name, setName] = useState('');
    const [surNames, setSurNames] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(true);
    const [showConfirmPassword, setShowConfirmPassword] = useState(true);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
 

    useEffect(() => {
        const initDb = async () => {
            try {
                const database = await DatabaseConnection.getConnection(); // Esperar la promesa
                setDb(database); 

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

    const handleRegister = async () => {
        if (!name || !email || !password || !confirmPassword) {
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
            // Limpiar errores previos
            setError('');
    
            await db.runAsync(
                'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
                [name, email, password]
            );
    
            console.log('Usuario registrado con éxito');
    
            
            navigation.navigate('Login');
    
        } catch (error) {
            console.error('Error al registrar usuario:', error);
            setError('Hubo un error al registrar el usuario');
        }
    };
    

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword((prev) => !prev);
    };

    return { name, setName,surNames,setSurNames, email, setEmail, password, setPassword, confirmPassword, setConfirmPassword,showPassword, setShowPassword, showConfirmPassword, setShowConfirmPassword, handleRegister, togglePasswordVisibility, toggleConfirmPasswordVisibility, error, setError };
};
