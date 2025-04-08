import ConfigHook from '../hooks/ConfigHook';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/Types';
import Icon from 'react-native-vector-icons/FontAwesome';




export default function ConfigScreen() {

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const { dbSize, checkDatabaseSize, exportDatabase, importDatabase } = ConfigHook();

  return (
    <ImageBackground source={require('../../../assets/img/agenda.webp')} style={styles.imageBackground}>
      <View style={styles.container}>
        <Text style={styles.title}>Configuración</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Base de Datos</Text>
          <Text style={styles.cardText}>Tamaño actual: {dbSize?.toFixed(2)} MB</Text>

          <TouchableOpacity style={styles.cardButton} onPress={exportDatabase}>

            <Text style={styles.cardButtonText}>
              <Icon name="upload" size={15} color="#fff"/> Exportar
            </Text>

          </TouchableOpacity>

          <TouchableOpacity style={styles.cardButton} onPress={importDatabase}>
            <Text style={styles.cardButtonText}>
              <Icon name="download" size={15} color="#fff"/> Importar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cardButton} onPress={checkDatabaseSize}>
            <Text style={styles.cardButtonText}>
              <Icon name="refresh" size={15} color="#fff"/> Actualizar Tamaño</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Información Legal</Text>

          <TouchableOpacity style={styles.cardLink} onPress={() => navigation.navigate('PrivacyPolicy')}>
            <Text style={styles.cardLinkText}>📜 Política de Privacidad</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cardLink} onPress={() => navigation.navigate('LegalNotice')}>
            <Text style={styles.cardLinkText}>⚖️ Aviso Legal</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cardLink} onPress={() => navigation.navigate('TermsOfUse')}>
            <Text style={styles.cardLinkText}>📄 Condiciones de Uso</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}


const styles = StyleSheet.create({
  imageBackground: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    paddingTop: 60,
    width: '90%',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'orange',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  cardText: {
    fontSize: 14,
    marginBottom: 15,
    color: '#444',
  },
  cardButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    shadowRadius: 3,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowColor: '#000',
    elevation: 2,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  cardButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  cardLink: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  cardLinkText: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '500',
  },
});
