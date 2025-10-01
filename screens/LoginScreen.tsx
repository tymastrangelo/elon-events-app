import React, { useState } from 'react';
import { Alert, StyleSheet, View, TextInput, Button, Text, TouchableOpacity } from 'react-native';
import { supabase } from '../lib/supabase';
import { COLORS, SIZES } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) Alert.alert('Sign In Error', error.message);
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) Alert.alert('Sign Up Error', error.message);
    else Alert.alert('Success', 'Please check your email for a confirmation link!');
    setLoading(false);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Elon Events</Text>
        <Text style={styles.headerSubtitle}>Sign in to continue</Text>
      </View>
      <View style={styles.verticallySpaced}>
        <TextInput
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize={'none'}
          style={styles.input}
          placeholderTextColor={COLORS.textMuted}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <TextInput
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize={'none'}
          style={styles.input}
          placeholderTextColor={COLORS.textMuted}
        />
      </View>
      <View style={[styles.verticallySpaced, { marginTop: 20 }]}>
        <TouchableOpacity style={styles.button} onPress={signInWithEmail} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Signing In...' : 'Sign In'}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.verticallySpaced}>
        <TouchableOpacity style={[styles.button, styles.buttonOutline]} onPress={signUpWithEmail} disabled={loading}>
          <Text style={[styles.buttonText, styles.buttonOutlineText]}>{loading ? 'Signing Up...' : 'Sign Up'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SIZES.padding * 2,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  input: {
    backgroundColor: COLORS.input,
    borderRadius: SIZES.radius,
    padding: 14,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  buttonOutlineText: {
    color: COLORS.primary,
  },
});