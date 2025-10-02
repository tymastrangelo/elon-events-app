import React, { useState } from 'react';
import { Alert, StyleSheet, View, TextInput, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import { COLORS, SIZES } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../navigation/types';

export default function SignUpScreen() {
  const navigation = useNavigation<StackNavigationProp<AuthStackParamList>>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);

  async function signUpWithEmail() {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Validation Error', 'Please enter your first and last name.');
      return;
    }
    // Validate that the email is an Elon email address
    if (!email.toLowerCase().endsWith('@elon.edu')) {
      Alert.alert('Invalid Email', 'Please use your Elon University email address to sign up.');
      return;
    }
    // Basic password validation
    if (password.length < 6) {
      Alert.alert('Password Too Short', 'Please enter a password that is at least 6 characters long.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: `${firstName.trim()} ${lastName.trim()}`,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        },
      },
    });

    if (error) {
      Alert.alert('Sign Up Error', error.message);
    } else {
      Alert.alert('Success!', 'Please check your email for a confirmation link to complete your registration.',
        [{ text: 'OK', onPress: () => navigation.navigate('SignIn') }]
      );
      navigation.navigate('SignIn'); // Navigate back to sign in after successful prompt
    }
    setLoading(false);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Create Account</Text>
        <Text style={styles.headerSubtitle}>Join your school's community!</Text>
      </View>
      <View style={styles.verticallySpaced}>
        <TextInput
          onChangeText={setFirstName}
          value={firstName}
          placeholder="First Name"
          autoCapitalize="words"
          style={styles.input}
          placeholderTextColor={COLORS.textMuted}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <TextInput
          onChangeText={setLastName}
          value={lastName}
          placeholder="Last Name"
          autoCapitalize="words"
          style={styles.input}
          placeholderTextColor={COLORS.textMuted}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <TextInput
          onChangeText={setEmail}
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
          onChangeText={setPassword}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize="none"
          style={styles.input}
          placeholderTextColor={COLORS.textMuted}
        />
      </View>
      <View style={[styles.verticallySpaced, { marginTop: 20 }]}>
        <TouchableOpacity style={styles.button} onPress={signUpWithEmail} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.buttonText}>Create Account</Text>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.footerButton} onPress={() => navigation.navigate('SignIn')}>
        <Text style={styles.footerText}>Already have an account? <Text style={styles.linkText}>Sign In</Text></Text>
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