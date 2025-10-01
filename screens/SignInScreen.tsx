import React, { useState } from 'react';
import { Alert, StyleSheet, View, TextInput, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import { COLORS, SIZES } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../navigation/types';

export default function SignInScreen() {
  const navigation = useNavigation<StackNavigationProp<AuthStackParamList>>();
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Welcome Back</Text>
        <Text style={styles.headerSubtitle}>Sign in to your account</Text>
      </View>
      <View style={styles.verticallySpaced}>
        <TextInput
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize="none"
          keyboardType="email-address"
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
          autoCapitalize="none"
          style={styles.input}
          placeholderTextColor={COLORS.textMuted}
        />
      </View>
      <View style={[styles.verticallySpaced, { marginTop: 20 }]}>
        <TouchableOpacity style={styles.button} onPress={signInWithEmail} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.footerButton} onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.footerText}>Don't have an account? <Text style={styles.linkText}>Sign Up</Text></Text>
      </TouchableOpacity>
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
    height: 50,
    justifyContent: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  footerButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  linkText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});