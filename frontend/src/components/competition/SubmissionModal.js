import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import PrimaryButton from '../common/PrimaryButton';

export default function SubmissionModal({ visible, onClose, onSubmit, loading }) {
  const [asset, setAsset] = useState(null);

  const pickMedia = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.All, quality: 0.8 });
    if (!result.canceled && result.assets?.length) {
      setAsset(result.assets[0]);
    }
  };

  const handleSubmit = () => {
    if (!asset) return;
    onSubmit(asset);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Upload Your Submission</Text>
          <Text style={styles.subtitle}>Share a video or photo of your performance (max 25MB).</Text>

          <TouchableOpacity style={styles.picker} onPress={pickMedia}>
            {asset ? (
              <Image source={{ uri: asset.uri }} style={styles.preview} />
            ) : (
              <View style={styles.pickerEmpty}>
                <Ionicons name="cloud-upload-outline" size={28} color={colors.primary} />
                <Text style={styles.pickerLabel}>Tap to choose a file</Text>
              </View>
            )}
          </TouchableOpacity>

          <PrimaryButton label="Submit Entry" onPress={handleSubmit} disabled={!asset} loading={loading} />
          <PrimaryButton label="Cancel" variant="outline" onPress={onClose} disabled={loading} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(15,20,25,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, gap: 12 },
  title: { fontSize: 17, fontWeight: '800', color: colors.textPrimary },
  subtitle: { fontSize: 12, color: colors.textSecondary, marginBottom: 4 },
  picker: { height: 160, borderRadius: 14, borderWidth: 1.5, borderColor: colors.border, borderStyle: 'dashed', overflow: 'hidden', marginBottom: 6 },
  pickerEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  pickerLabel: { fontSize: 12, color: colors.textSecondary },
  preview: { width: '100%', height: '100%' },
});
