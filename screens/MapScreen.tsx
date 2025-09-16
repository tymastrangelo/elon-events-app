import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MainLayout from './MainLayout';

export default function HomeScreen() {
  return (
    <MainLayout>
      <View style={styles.container}>
        <Text style={styles.text}>Map Screen</Text>
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 20, fontWeight: '600' },
});