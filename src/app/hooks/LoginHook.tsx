import { useState } from 'react';
import { DatabaseConnection } from '../database/database-connection';


export default function useLoginHook() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!email || !password) {
      setError('Todos los campos son obligatorios');
      return;
    }
    alert(`Inicio de sesión\nEmail: ${email}\nContraseña: ${password}`);
  };

  return { email, setEmail, password, setPassword, handleLogin, error, setError };
}
