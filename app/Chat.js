import React, { useState, useRef, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  StyleSheet, Text, View, TouchableOpacity, 
  TextInput, KeyboardAvoidingView, FlatList, Platform, Keyboard
} from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../store/useStore';
import io from 'socket.io-client';
import { supabase } from '../lib/supabase';

// Production socket server deployed on Render
const SOCKET_URL = 'https://hyperbabel-socket-server.onrender.com';
const socket = io(SOCKET_URL, { autoConnect: false });

export default function ChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [inputText, setInputText] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const flatListRef = useRef();

  // Bring in Zustand global state
  const { messages, userLang, receiveSocketMessage, addMessage } = useStore();

  useEffect(() => {
    // 1. Fetch current logged-in user from Supabase to label the chat bubbles
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUser(user);
    });

    // 2. Connect to the Translation Socket Tunnel
    socket.connect();
    socket.emit('join_room', 'global_strategy_room');

    // 3. Listen for translated broadcasts from the server
    const handleReceive = (data) => {
      receiveSocketMessage(data);
    };

    socket.on('receive_message', handleReceive);

    return () => {
      socket.off('receive_message', handleReceive);
      socket.disconnect();
    };
  }, []);

  const handleSend = () => {
    if (!inputText.trim()) return;
    
    const senderEmail = currentUser?.email || 'Anonymous';

    const msgData = {
      roomId: 'global_strategy_room',
      text: inputText,
      sender: senderEmail,
      ogLang: userLang
    };

    // Optimistic update: show message immediately in local state
    addMessage(inputText, senderEmail, userLang);

    // Shoot payload up to Node translator server
    socket.emit('send_message', msgData);
    
    setInputText('');
    Keyboard.dismiss();
  };

  const renderItem = ({ item }) => {
    // Am I the sender of this message?
    const isMe = item.sender === (currentUser?.email || 'Anonymous');
    
    // Core Translation Logic: 
    // If the sender's language is the same as my selected language, show original text.
    // If different, look inside the 'translations' object for my language.
    const displayText = (item.ogLang === userLang) 
      ? item.text 
      : (item.translations && item.translations[userLang]) 
          ? item.translations[userLang] 
          : item.text;

    return (
      <View style={[styles.bubbleWrapper, isMe ? styles.myWrapper : styles.otherWrapper]}>
        <Text style={styles.langTag}>{isMe ? 'You' : item.sender} ({item.ogLang})</Text>
        <View style={[styles.chatBubble, isMe ? styles.myBubble : styles.otherBubble]}>
          <Text style={isMe ? styles.myText : styles.otherText}>{displayText}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtnText}>◀ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Global Strategy Room</Text>
        <Text style={styles.langSelector}>{userLang} 🌐</Text>
      </View>

      {/* Chat Messages */}
      <FlatList 
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.chatArea}
        ListHeaderComponent={<Text style={styles.systemMsg}>Real-time AI Translation Socket Connected! ⚡️</Text>}
        onContentSizeChange={() => {
          // Snap instantly to the new message without the jarring delay
          if (messages.length > 0) {
             flatListRef.current?.scrollToEnd({ animated: true });
          }
        }}
        onLayout={() => {
          if (messages.length > 0) flatListRef.current?.scrollToEnd({ animated: false });
        }}
      />

      {/* Input Area */}
      <View style={[styles.inputArea, { paddingBottom: Math.max(insets.bottom + 10, 15) }]}>
        <TextInput 
          style={styles.input}
          placeholder={`Type in ${userLang}...`}
          placeholderTextColor="#64748B"
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          blurOnSubmit={false}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <Text style={styles.sendBtnText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A2540' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 20, paddingHorizontal: 20,
    backgroundColor: '#071A2E', borderBottomWidth: 1, borderColor: '#1E3A5F',
  },
  backBtnText: { color: '#00D4FF', fontSize: 16, fontWeight: 'bold' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  langSelector: { color: '#00D4FF', fontSize: 14, fontWeight: 'bold' },
  systemMsg: { textAlign: 'center', color: '#00D4FF', fontSize: 12, marginVertical: 15, fontWeight: 'bold' },
  chatArea: { paddingHorizontal: 20, paddingBottom: 20 },
  bubbleWrapper: { marginBottom: 20, maxWidth: '85%' },
  myWrapper: { alignSelf: 'flex-end' },
  otherWrapper: { alignSelf: 'flex-start' },
  langTag: { fontSize: 11, color: '#64748B', marginBottom: 4 },
  chatBubble: { padding: 15, borderRadius: 16 },
  myBubble: { backgroundColor: '#00D4FF', borderBottomRightRadius: 4 },
  otherBubble: { backgroundColor: '#1E3A5F', borderBottomLeftRadius: 4 },
  myText: { color: '#0A2540', fontSize: 16 },
  otherText: { color: '#FFF', fontSize: 16 },
  inputArea: {
    flexDirection: 'row', padding: 15, backgroundColor: '#071A2E',
    alignItems: 'center', gap: 10, paddingBottom: Platform.OS === 'ios' ? 30 : 15,
  },
  input: {
    flex: 1, backgroundColor: '#1E3A5F', color: '#FFF', borderRadius: 25,
    paddingHorizontal: 20, paddingVertical: 12, fontSize: 16,
  },
  sendBtn: { backgroundColor: '#00D4FF', borderRadius: 25, paddingVertical: 12, paddingHorizontal: 20 },
  sendBtnText: { color: '#0A2540', fontWeight: 'bold', fontSize: 16 }
});
