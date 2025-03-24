import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';

export default function TermsOfUse() {
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Condiciones de Uso</Text>
            <Text style={styles.subtitle}>Última actualización: 24 de marzo de 2025</Text>

            <Text style={styles.header}>1. Objeto y ámbito de aplicación</Text>
            <Text style={styles.section}>
                Estas condiciones regulan el uso de la app móvil Gestiona Taxi 2025. El acceso y uso implican la aceptación de estas condiciones.
            </Text>

            <Text style={styles.header}>2. Funcionalidad de la app</Text>
            <Text style={styles.section}>
                La app permite gestionar tareas relacionadas con la actividad de taxi. El uso es gratuito y principalmente offline, salvo para la recuperación de contraseña.
            </Text>

            <Text style={styles.header}>3. Registro de usuario</Text>
            <Text style={styles.section}>
                Para acceder a ciertas funciones es necesario registrarse con nombre, apellidos, correo electrónico y contraseña. El usuario es responsable de sus credenciales.
            </Text>

            <Text style={styles.header}>4. Obligaciones del usuario</Text>
            <Text style={styles.section}>
                El usuario se compromete a:{'\n'}
                - No usar la app con fines ilegales{'\n'}
                - No dañar ni sobrecargar la app{'\n'}
                - No acceder o manipular datos de otros usuarios
            </Text>

            <Text style={styles.header}>5. Limitación de responsabilidad</Text>
            <Text style={styles.section}>
                Meydo Dev no garantiza la disponibilidad continua ni la ausencia de errores. No se responsabiliza por pérdidas derivadas del uso o fallos de la app.
            </Text>

            <Text style={styles.header}>6. Actualizaciones y modificaciones</Text>
            <Text style={styles.section}>
                La app y sus condiciones pueden actualizarse en cualquier momento. El uso continuado implica aceptación de los cambios.
            </Text>

            <Text style={styles.header}>7. Baja del servicio</Text>
            <Text style={styles.section}>
                El usuario puede eliminar su cuenta desde la app o contactando por email.
            </Text>

            <Text style={styles.header}>8. Legislación y jurisdicción</Text>
            <Text style={styles.section}>
                Estas condiciones se rigen por la legislación española. Los conflictos se resolverán en los juzgados del domicilio del usuario.
            </Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    content: {
        padding: 20
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 20
    },
    header: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10
    },
    section: {
        fontSize: 14,
        lineHeight: 22
    }
});
