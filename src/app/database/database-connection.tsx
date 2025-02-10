import * as SQLite from 'expo-sqlite';

// Create a connection to the database
export const DatabaseConnection = {
  getConnection: () => SQLite.openDatabaseAsync("gestiona_taxi_2025.db"),
};