import React, { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet, Text, View, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, ScrollView
} from 'react-native';
import { useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import createAgoraRtcEngine, {
  RtcSurfaceView,
  ClientRoleType,
  ChannelProfileType,
} from 'react-native-agora';

const AGORA_APP_ID = 'ccca76dde65146c590d01c670004b955';
const DEFAULT_CHANNEL = 'hyperbabel_live';

export default function LiveStreamScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [camStatus, requestCam] = useCameraPermissions();
  const [micStatus, requestMic] = useMicrophonePermissions();

  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState('');
  const [channel, setChannel] = useState(DEFAULT_CHANNEL);
  const [viewerCount, setViewerCount] = useState(0);
  const [videoQuality, setVideoQuality] = useState('STANDARD');
  const [engineReady, setEngineReady] = useState(false);
  const engineRef = useRef(null);

  useEffect(() => {
    (async () => {
      if (!camStatus?.granted) await requestCam();
      if (!micStatus?.granted) await requestMic();
      await initEngine();
    })();
    return () => { destroyEngine(); };
  }, []);

  const initEngine = async () => {
    try {
      const engine = createAgoraRtcEngine();
      engineRef.current = engine;
      await engine.initialize({
        appId: AGORA_APP_ID,
        channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
      });
      await engine.setClientRole(ClientRoleType.ClientRoleBroadcaster);
      await engine.enableVideo();
      await engine.startPreview();
      engine.addListener('onUserJoined', () => setViewerCount(prev => prev + 1));
      engine.addListener('onUserOffline', () => setViewerCount(prev => Math.max(0, prev - 1)));
      setEngineReady(true);
    } catch (e) {
      console.error('Agora init error:', e);
      Alert.alert('Agora Error', e.message);
    }
  };

  const destroyEngine = async () => {
    try {
      await engineRef.current?.leaveChannel();
      engineRef.current?.release();
    } catch (_) {}
  };

  const startStream = async () => {
    if (!token.trim()) {
      Alert.alert('토큰 필요', 'Agora Temp Token을 입력해 주세요.\n\nAgora 콘솔 → Developer Toolkit → Token Builder');
      return;
    }
    setIsLoading(true);
    try {
      await engineRef.current?.joinChannel(token.trim(), channel.trim(), 0, {
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
      });
      setIsStreaming(true);
    } catch (e) {
      Alert.alert('스트림 시작 실패', e.message);
    }
    setIsLoading(false);
  };

  const stopStream = async () => {
    setIsLoading(true);
    try {
      await engineRef.current?.leaveChannel();
      setIsStreaming(false);
      setViewerCount(0);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
    setIsLoading(false);
  };

  const toggleQuality = async () => {
    const newQ = videoQuality === 'STANDARD' ? 'HIGH' : 'STANDARD';
    setVideoQuality(newQ);
    try {
      await engineRef.current?.setVideoEncoderConfiguration({
        dimensions: newQ === 'HIGH' ? { width: 1920, height: 1080 } : { width: 1280, height: 720 },
        frameRate: 30,
        bitrate: newQ === 'HIGH' ? 4000 : 1130,
      });
    } catch (_) {}
  };

  const permissionsGranted = camStatus?.granted && micStatus?.granted;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>◀ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Live Presentation</Text>
        {isStreaming && (
          <View style={styles.liveBadge}>
            <Text style={styles.liveText}>● LIVE</Text>
            <Text style={styles.viewerText}>{viewerCount} viewers</Text>
          </View>
        )}
        {!isStreaming && <View style={{ width: 60 }} />}
      </View>

      <View style={styles.cameraBox}>
        {!permissionsGranted ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#00D4FF" />
            <Text style={styles.hint}>카메라/마이크 권한 요청 중...</Text>
          </View>
        ) : engineReady ? (
          <RtcSurfaceView style={styles.camera} canvas={{ uid: 0 }} />
        ) : (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#00D4FF" />
            <Text style={styles.hint}>Agora 엔진 초기화 중...</Text>
          </View>
        )}
        {isStreaming && (
          <View style={styles.liveOverlay}>
            <Text style={styles.liveOverlayText}>🔴 LIVE</Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.controls} contentContainerStyle={{ gap: 12, paddingBottom: insets.bottom + 20 }}>
        {!isStreaming && (
          <>
            <Text style={styles.label}>채널명</Text>
            <TextInput
              style={styles.input}
              value={channel}
              onChangeText={setChannel}
              placeholder="hyperbabel_live"
              placeholderTextColor="#64748B"
              autoCapitalize="none"
            />
            <Text style={styles.label}>Agora Temp Token</Text>
            <TextInput
              style={[styles.input, { fontSize: 12, minHeight: 70 }]}
              value={token}
              onChangeText={setToken}
              placeholder="007eJx... (Agora 콘솔 → Developer Toolkit → Token Builder)"
              placeholderTextColor="#64748B"
              multiline
              autoCapitalize="none"
            />
          </>
        )}

        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.qualityBtn} onPress={toggleQuality}>
            <Text style={styles.qualityBtnText}>
              {videoQuality === 'HIGH' ? '⬇ 720p' : '⬆ 1080p'}
            </Text>
          </TouchableOpacity>

          {isStreaming ? (
            <TouchableOpacity style={styles.stopBtn} onPress={stopStream} disabled={isLoading}>
              {isLoading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.stopBtnText}>⏹ End Stream</Text>}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.startBtn, (!engineReady || isLoading) && { opacity: 0.5 }]}
              onPress={startStream}
              disabled={isLoading || !engineReady}
            >
              {isLoading
                ? <ActivityIndicator color="#0A2540" />
                : <Text style={styles.startBtnText}>▶ Start Stream</Text>}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#071A2E',
    borderBottomWidth: 1, borderColor: '#1E3A5F',
  },
  backBtn: { color: '#00D4FF', fontSize: 16, fontWeight: 'bold', width: 60 },
  title: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  liveBadge: { alignItems: 'flex-end', width: 60 },
  liveText: { color: '#EF4444', fontWeight: 'bold', fontSize: 14 },
  viewerText: { color: '#94A3B8', fontSize: 11 },
  cameraBox: {
    width: '100%', height: 280, backgroundColor: '#111',
    position: 'relative', overflow: 'hidden',
  },
  camera: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  hint: { color: '#64748B', fontSize: 14 },
  liveOverlay: {
    position: 'absolute', top: 12, left: 12,
    backgroundColor: 'rgba(239,68,68,0.85)', borderRadius: 6,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  liveOverlayText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  controls: { flex: 1, padding: 20 },
  label: { color: '#94A3B8', fontSize: 13, marginBottom: 4 },
  input: {
    backgroundColor: '#1E3A5F', color: '#fff', borderRadius: 10,
    padding: 12, fontSize: 14, borderWidth: 1, borderColor: '#334155',
  },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  qualityBtn: {
    flex: 1, backgroundColor: '#334155', borderRadius: 25,
    paddingVertical: 14, alignItems: 'center',
  },
  qualityBtnText: { color: '#E2E8F0', fontWeight: 'bold' },
  startBtn: {
    flex: 2, backgroundColor: '#00D4FF', borderRadius: 25,
    paddingVertical: 14, alignItems: 'center',
  },
  startBtnText: { color: '#0A2540', fontWeight: 'bold', fontSize: 16 },
  stopBtn: {
    flex: 2, backgroundColor: '#EF4444', borderRadius: 25,
    paddingVertical: 14, alignItems: 'center',
  },
  stopBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
