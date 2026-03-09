import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { Globe2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function HomeScreen() {
  const router = useRouter();
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <ScrollView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.brandContainer}>
          <Globe2 color="#00D4FF" size={24} />
          <Text style={styles.brandText}>HyperBabel</Text>
        </View>
        
        {session ? (
          <TouchableOpacity 
            style={styles.loginBtn}
            onPress={() => supabase.auth.signOut()}
          >
            <Text style={styles.loginBtnText}>Sign Out</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.loginBtn}
            onPress={() => router.push('/Auth')}
          >
            <Text style={styles.loginBtnText}>Login</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Hero Section */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Break the Language Barrier.</Text>
        <Text style={styles.heroGradient}>In Real-Time.</Text>
        <Text style={styles.heroSubtitle}>
          Experience instant, AI-powered corporate communication across borders directly from your phone.
        </Text>

        <TouchableOpacity 
          style={styles.primaryBtn}
          onPress={() => {
            if (session) {
              router.push('/LiveStream');
            } else {
              router.push('/Auth');
            }
          }}
        >
          <Text style={styles.primaryBtnText}>
            {session ? 'Start Live Stream' : 'Get Started (Sign In)'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.primaryBtn, {marginTop: 15, backgroundColor: 'transparent', borderWidth: 1, borderColor: '#00D4FF'}]}
          onPress={() => {
            if (session) {
              router.push('/Chat');
            } else {
              router.push('/Auth');
            }
          }}
        >
          <Text style={[styles.primaryBtnText, {color: '#00D4FF'}]}>
            {session ? 'Enter Global Chat' : 'Sign In to Chat'}
          </Text>
        </TouchableOpacity>

        <View style={styles.mockupContainer}>
          <View style={[styles.chatBubble, styles.sentBubble]}>
            <Text style={styles.langTag}>English</Text>
            <Text style={styles.sentText}>Hello, nice to meet you!</Text>
          </View>
          <View style={[styles.chatBubble, styles.receivedBubble]}>
            <Text style={styles.langTag}>Korean</Text>
            <Text style={styles.receivedText}>안녕하세요, 만나서 반갑습니다!</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A2540',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  loginBtn: {
    borderWidth: 1,
    borderColor: '#00D4FF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  loginBtnText: {
    color: '#00D4FF',
    fontWeight: '600',
  },
  hero: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  heroTitle: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
  },
  heroGradient: {
    fontSize: 40,
    fontWeight: '800',
    color: '#00D4FF',
    textAlign: 'center',
    marginBottom: 20,
  },
  heroSubtitle: {
    color: '#E2E8F0',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  primaryBtn: {
    backgroundColor: '#00D4FF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  primaryBtnText: {
    color: '#0A2540',
    fontSize: 18,
    fontWeight: 'bold',
  },
  mockupContainer: {
    marginTop: 60,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 20,
  },
  chatBubble: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    maxWidth: '85%',
  },
  sentBubble: {
    backgroundColor: '#00D4FF',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  receivedBubble: {
    backgroundColor: '#1E3A5F',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  langTag: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  sentText: {
    color: '#0A2540',
    fontSize: 16,
  },
  receivedText: {
    color: '#FFF',
    fontSize: 16,
  }
});
