import 'react-native-url-polyfill/auto'
import { Platform } from 'react-native'
import { createClient } from '@supabase/supabase-js'

// Try to require async-storage, but fail gracefully on web where it might crash the bundler
let AsyncStorage;
try {
  AsyncStorage = Platform.OS === 'web' 
    ? null 
    : require('@react-native-async-storage/async-storage').default;
} catch (e) {
  AsyncStorage = null;
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co'
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // On web use localStorage, on native use AsyncStorage
    storage: Platform.OS === 'web' ? undefined : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
