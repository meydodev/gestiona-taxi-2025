import { useState, useEffect } from 'react';
import * as SQLite from 'expo-sqlite';
import { DatabaseConnection } from '../database/database-connection';



export default function RegisterHook(){
    const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
    const [name, setName] = useState('');
    const [surNames, setSurNames] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');


    useEffect(() => {
        const initDb = async () => {
            try {
                const database = await DatabaseConnection.getConnection(); // Esperar la promesa
                setDb(database); // Guardar la conexión en el estado

                await database.execAsync(`
                    CREATE TABLE IF NOT EXISTS users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT, 
                        name TEXT, 
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
            await db.runAsync(
                'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
                [name, email, password]
            );
            console.log('Usuario registrado con éxito');
        } catch (error) {
            console.error('Error al registrar usuario:', error);
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
