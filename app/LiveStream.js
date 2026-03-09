import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { useRouter } from 'expo-router';

// NOTE: react-native-agora is a native module. We import it conditionally or just import it for native builds.
// import createAgoraRtcEngine, { RtcSurfaceView, VideoRenderMode } from 'react-native-agora';

export default function LiveStreamScreen() {
  const router = useRouter();
  const [camStatus, requestCam] = useCameraPermissions();
  const [micStatus, requestMic] = useMicrophonePermissions();
  
  // New Bitrate UI State
  const [videoQuality, setVideoQuality] = useState('STANDARD'); // 'STANDARD' | 'HIGH'

  useEffect(() => {
    (async () => {
      if (!camStatus?.granted) await requestCam();
      if (!micStatus?.granted) await requestMic();
    })();
  }, []);

  const permissionsGranted = camStatus?.granted && micStatus?.granted;

  const toggleQuality = () => {
    const newQuality = videoQuality === 'STANDARD' ? 'HIGH' : 'STANDARD';
    setVideoQuality(newQuality);
    
    // In actual production with react-native-agora initialized:
    // agoraEngine.setVideoEncoderConfiguration({
    //   dimensions: newQuality === 'HIGH' ? { width: 1920, height: 1080 } : { width: 1280, height: 720 },
    //   frameRate: 30,
    //   bitrate: newQuality === 'HIGH' ? 4000 : 1130, // 4Mbps for 1080p Web Host quality, 1Mbps standard
    //   orientationMode: 2, // Fixed landscape
    // });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.title}>Live Presentation</Text>
      
      {!permissionsGranted ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#00D4FF" />
          <Text style={styles.subtitle}>Requesting Camera & Mic Access...</Text>
        </View>
      ) : (
        <View style={styles.videoPlaceholder}>
          <Text style={{ color: '#00D4FF', fontWeight: 'bold' }}>[Agora RtcSurfaceView]</Text>
          <Text style={{ color: '#E2E8F0', marginTop: 10 }}>Hardware Camera Active</Text>
          <Text style={{ color: videoQuality === 'HIGH' ? '#4ADE80' : '#94A3B8', marginTop: 5, fontSize: 12 }}>
            Quality: {videoQuality === 'HIGH' ? '1080p HD (4Mbps)' : '720p (1Mbps)'}
          </Text>
          
          <View style={styles.translationOverlay}>
            <Text style={styles.translationText}>"Hello everyone, welcome to the stream."</Text>
            <Text style={styles.langBadge}>Translated to English</Text>
          </View>
        </View>
      )}

      <View style={styles.actionRow}>
        <TouchableOpacity 
          style={styles.controlBtn}
          onPress={toggleQuality}
        >
          <Text style={styles.controlBtnText}>{videoQuality === 'HIGH' ? 'Drop to 720p' : 'Boost to 1080p'}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.endBtn}
          onPress={() => router.back()}
        >
          <Text style={styles.endBtnText}>End Stream</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.endBtn}
        onPress={() => router.back()}
      >
        <Text style={styles.endBtnText}>End Stream</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    paddingTop: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 40,
  },
  subtitle: {
    fontSize: 16,
    color: '#E2E8F0',
    marginTop: 20,
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlaceholder: {
    width: '90%',
    height: 400,
    backgroundColor: '#1E3A5F',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00D4FF',
    position: 'relative',
    overflow: 'hidden',
  },
  translationOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 15,
    borderRadius: 10,
  },
  translationText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  langBadge: {
    color: '#00D4FF',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
    gap: 15,
  },
  controlBtn: {
    backgroundColor: '#334155',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#475569',
  },
  controlBtnText: {
    color: '#E2E8F0',
    fontWeight: 'bold',
    fontSize: 14,
  },
  endBtn: {
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  endBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18,
  }
});
