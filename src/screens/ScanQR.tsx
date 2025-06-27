import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import * as ImageManipulator from 'expo-image-manipulator';
import jsQR from 'jsqr';

const ScanQR = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef<InstanceType<typeof CameraView> | null>(null);
  const router = useRouter();

  const handleScan = async () => {
    if (cameraRef.current && !scanned) {
      setLoading(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.5 });
        const manipResult = await ImageManipulator.manipulateAsync(
          photo.uri,
          [{ resize: { width: 400 } }],
          { base64: true }
        );
        const imageData = manipResult.base64 ? atob(manipResult.base64) : null;
        if (imageData) {
          const buffer = new Uint8ClampedArray(imageData.length);
          for (let i = 0; i < imageData.length; i++) {
            buffer[i] = imageData.charCodeAt(i);
          }
          const code = jsQR(buffer, manipResult.width, manipResult.height);
          if (code) {
            setScanned(true);
            Alert.alert('QR Escaneado', code.data, [
              { text: 'OK', onPress: () => router.back() },
            ]);
          } else {
            Alert.alert('No se detectó QR', 'Intenta de nuevo.');
          }
        } else {
          Alert.alert('Error', 'No se pudo procesar la imagen.');
        }
      } catch (e) {
        Alert.alert('Error', 'No se pudo escanear el QR.');
      } finally {
        setLoading(false);
      }
    }
  };

  if (!permission) {
    return <Text>Solicitando permiso para la cámara...</Text>;
  }
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text>No se tiene acceso a la cámara</Text>
        <Button title="Permitir cámara" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        ratio="16:9"
      />
      <View style={styles.controls}>
        <Button title={loading ? 'Escaneando...' : 'Escanear QR'} onPress={handleScan} disabled={loading || scanned} />
        {scanned && (
          <Button title={'Escanear de nuevo'} onPress={() => setScanned(false)} />
        )}
        <Button title="Cancelar" onPress={() => router.back()} color="#FF3B30" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  controls: {
    width: '100%',
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
});

export default ScanQR; 