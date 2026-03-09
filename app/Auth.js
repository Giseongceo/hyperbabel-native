import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const showAlert = (title, message) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};
export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function signInWithEmail() {
    setLoading(true);
    const { error, data } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      console.log('Login Error:', error);
      showAlert('Login Failed', `${error.message}\nRaw: ${JSON.stringify(error)}`);
    } else {
      showAlert('Success', 'Logged in successfully!');
      router.replace('/'); // Redirect to Home
    }
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      console.log('SignUp Error:', error);
      showAlert('Sign Up Failed', `${error.message}\nRaw: ${JSON.stringify(error)}`);
    } else {
      showAlert('Success', 'Please check your email to verify your account!');
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.formContainer}>
        <Text style={styles.title}>HyperBabel</Text>
        <Text style={styles.subtitle}>Sign in to start translating</Text>

        <TextInput
          style={styles.input}
          placeholder="Email address"
          placeholderTextColor="#64748B"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#64748B"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryBtn} onPress={signInWithEmail} disabled={loading}>
            {loading ? <ActivityIndicator color="#0A2540" /> : <Text style={styles.primaryBtnText}>Sign In</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} onPress={signUpWithEmail} disabled={loading}>
            <Text style={styles.secondaryBtnText}>Create Account</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={{marginTop: 30}} onPress={() => router.replace('/')}>
          <Text style={styles.guestLink}>Continue as Guest</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A2540',
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 30,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E3A5F',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#00D4FF',
    marginBottom: 40,
  },
  input: {
    width: '100%',
    backgroundColor: '#071A2E',
    color: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#1E3A5F',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
    marginTop: 10,
  },
  primaryBtn: {
    backgroundColor: '#00D4FF',
    padding: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#0A2540',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryBtn: {
    backgroundColor: 'transparent',
    padding: 16,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00D4FF',
  },
  secondaryBtnText: {
    color: '#00D4FF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  guestLink: {
    color: '#64748B',
    fontSize: 14,
    textDecorationLine: 'underline',
  }
});
