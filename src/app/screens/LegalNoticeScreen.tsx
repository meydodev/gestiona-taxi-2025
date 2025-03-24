import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';

export default function LegalNotice() {
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Aviso Legal</Text>
            <Text style={styles.subtitle}>Última actualización: 24 de marzo de 2025</Text>

            <Text style={styles.header}>Titular de la aplicación</Text>
            <Text style={styles.section}>
                Gestiona Taxi 2025{'\n'}
                Responsable: Meydo Dev{'\n'}
                Correo electrónico de contacto: meydodev@gmail.com
            </Text>

            <Text style={styles.header}>Objeto del Aviso Legal</Text>
            <Text style={styles.section}>
                Este Aviso Legal regula el acceso, navegación y uso de la aplicación móvil Gestiona Taxi 2025.
            </Text>

            <Text style={styles.header}>Propiedad intelectual e industrial</Text>
            <Text style={styles.section}>
                Todos los contenidos de la aplicación son propiedad de Meydo Dev, salvo que se indique lo contrario. Queda prohibida su reproducción total o parcial sin autorización expresa.
            </Text>

            <Text style={styles.header}>Responsabilidad del uso</Text>
            <Text style={styles.section}>
                El usuario se compromete a usar la aplicación de forma legal y adecuada. Meydo Dev no se hace responsable por un uso indebido ni por posibles daños derivados de fallos técnicos o interrupciones.
            </Text>

            <Text style={styles.header}>Protección de datos</Text>
            <Text style={styles.section}>
                El tratamiento de los datos personales se realiza según lo indicado en la Política de Privacidad de la app.
            </Text>

            <Text style={styles.header}>Legislación aplicable</Text>
            <Text style={styles.section}>
                Este Aviso Legal se rige por la legislación española. Cualquier conflicto se resolverá en los tribunales del domicilio del usuario, si reside en España.
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
