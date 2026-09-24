import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import PrimaryButton from '../common/PrimaryButton';

// A real integration would open the Razorpay Checkout SDK here and confirm
// the payment server-side via a signed webhook. This mock simulates a
// successful payment so the rest of the state machine (pending -> confirmed
// -> submission window) can be exercised end-to-end. See README.
export default function PaymentModal({ visible, entryFee, onConfirm, onClose, loading }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Complete Payment</Text>
          <Text style={styles.subtitle}>Secure payments powered by Razorpay (mocked for this demo)</Text>
          <View style={styles.amountBox}>
            <Text style={styles.amountLabel}>Amount payable</Text>
            <Text style={styles.amount}>₹ {entryFee}</Text>
          </View>
          <PrimaryButton label={`Pay ₹${entryFee} now`} onPress={onConfirm} loading={loading} />
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
  amountBox: { backgroundColor: colors.primaryLight, borderRadius: 12, padding: 14, marginBottom: 6 },
  amountLabel: { fontSize: 12, color: colors.textSecondary },
  amount: { fontSize: 22, fontWeight: '900', color: colors.primary, marginTop: 2 },
});
