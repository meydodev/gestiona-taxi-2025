import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';


export default function PrivacyPolicy() {
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Política de Privacidad</Text>
            <Text style={styles.subtitle}>Última actualización: 24 de marzo de 2025</Text>

            <Text style={styles.section}>
                En cumplimiento con el Reglamento General de Protección de Datos (RGPD) de la Unión Europea, esta Política de Privacidad explica cómo recogemos y tratamos tus datos personales cuando usas la aplicación Gestiona Taxi 2025.
            </Text>

            <Text style={styles.header}>¿Quién es el responsable del tratamiento?</Text>
            <Text style={styles.section}>
                Responsable: Meydo Dev{'\n'}
                Email de contacto: meydodev@gmail.com
            </Text>

            <Text style={styles.header}>¿Qué datos recogemos?</Text>
            <Text style={styles.section}>
                Solo recopilamos los siguientes datos personales cuando te registras en la app o utilizas la función de recuperación de contraseña:{'\n'}
                - Nombre{'\n'}
                - Apellidos{'\n'}
                - Correo electrónico{'\n'}
                - Contraseña
            </Text>

            <Text style={styles.header}>¿Con qué finalidad usamos tus datos?</Text>
            <Text style={styles.section}>
                Usamos tus datos únicamente para:{'\n'}
                - Crear y gestionar tu cuenta de usuario en la app{'\n'}
                - Permitir el acceso al sistema{'\n'}
                - Gestionar la recuperación de contraseña (si la solicitas){'\n\n'}
                No se usan tus datos con fines comerciales, ni para enviar publicidad.
            </Text>

            <Text style={styles.header}>¿Cuál es la base legal para tratar tus datos?</Text>
            <Text style={styles.section}>
                La base legal es tu consentimiento al registrarte y aceptar esta política, así como la ejecución del contrato al usar la app como usuario registrado.
            </Text>

            <Text style={styles.header}>¿Dónde se guardan tus datos?</Text>
            <Text style={styles.section}>
                Tus datos se almacenan localmente en tu dispositivo. Solo se envían al servidor en caso de recuperación de contraseña, tratándose de forma segura y limitada.
            </Text>

            <Text style={styles.header}>¿Durante cuánto tiempo conservamos tus datos?</Text>
            <Text style={styles.section}>
                Tus datos se almacenan mientras tengas una cuenta activa. Puedes eliminarlos en cualquier momento desde la app o contactándonos por email.
            </Text>

            <Text style={styles.header}>¿Cuáles son tus derechos?</Text>
            <Text style={styles.section}>
                Tienes derecho a:{'\n'}
                - Acceder a tus datos personales{'\n'}
                - Rectificar datos incorrectos{'\n'}
                - Eliminar tus datos (derecho al olvido){'\n'}
                - Limitar u oponerte al tratamiento{'\n'}
                - Retirar tu consentimiento en cualquier momento{'\n\n'}
                Puedes ejercer estos derechos escribiendo a meydodev@gmail.com
            </Text>

            <Text style={styles.header}>¿Se comparten tus datos con terceros?</Text>
            <Text style={styles.section}>
                No. Tus datos no se comparten con ninguna empresa externa ni se usan con fines publicitarios. Solo se usan para el correcto funcionamiento de la app.
            </Text>

            <Text style={styles.header}>¿Se transfieren tus datos fuera de la Unión Europea?</Text>
            <Text style={styles.section}>
                No. Todos los datos se almacenan y tratan dentro del Espacio Económico Europeo (EEE).
            </Text>

            <Text style={styles.header}>¿Ante quién puedes reclamar?</Text>
            <Text style={styles.section}>
                Si consideras que no hemos respetado tus derechos, puedes presentar una reclamación ante la Agencia Española de Protección de Datos:{'\n'}
                www.aepd.es
            </Text>

            <Text style={styles.header}>Contacto</Text>
            <Text style={styles.section}>
                Para cualquier duda o solicitud relacionada con tus datos personales, puedes contactarnos en:{'\n'}
                📧 meydodev@gmail.com
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
