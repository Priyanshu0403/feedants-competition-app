import React, { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Alert, Text } from 'react-native';
import { useAuth } from '../context/AuthContext';
import * as competitionApi from '../api/competitionApi';
import { colors } from '../theme/colors';

import TopBar from '../components/competition/TopBar';
import CompetitionHeaderCard from '../components/competition/CompetitionHeaderCard';
import JudgeCard from '../components/competition/JudgeCard';
import CountdownBanner from '../components/competition/CountdownBanner';
import ImportantDatesGrid from '../components/competition/ImportantDatesGrid';
import PreviousWinnersCarousel from '../components/competition/PreviousWinnersCarousel';
import InfoTabs from '../components/competition/InfoTabs';
import RewardsList from '../components/competition/RewardsList';
import ReferralCard from '../components/competition/ReferralCard';
import BottomCTA from '../components/competition/BottomCTA';
import PaymentModal from '../components/competition/PaymentModal';
import SubmissionModal from '../components/competition/SubmissionModal';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';

// The design reference is for this one competition; a real app would
// receive the slug/id via navigation params from a list screen.
const COMPETITION_SLUG = 'feedants-classical-dance';

export default function CompetitionDetailsScreen({ navigation }) {
  const { user, signOut } = useAuth();
  const [competition, setCompetition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [submissionModalVisible, setSubmissionModalVisible] = useState(false);

  const load = useCallback(async ({ silent } = {}) => {
    try {
      if (!silent) setLoading(true);
      setError(null);
      const res = await competitionApi.getCompetition(COMPETITION_SLUG);
      setCompetition(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load({ silent: true });
  }, [load]);

  const handleCtaPress = () => {
    const action = competition?.userState?.ctaAction;
    if (action === 'REGISTER') return handleRegister();
    if (action === 'PAY') return setPaymentModalVisible(true);
    if (action === 'UPLOAD_SUBMISSION') return setSubmissionModalVisible(true);
    if (action === 'VIEW_SUBMISSION') {
      return Alert.alert('Your submission', competition.userState.submission?.mediaUrl || 'Submitted');
    }
    if (action === 'LOGIN') return signOut();
    return undefined;
  };

  const handleRegister = async () => {
    try {
      setActionLoading(true);
      const res = await competitionApi.registerForCompetition(COMPETITION_SLUG);
      setCompetition(res.data.competition);
      if (res.data.competition.entryFee > 0 && res.data.registration.status === 'pending_payment') {
        setPaymentModalVisible(true);
      }
    } catch (err) {
      Alert.alert('Registration failed', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    try {
      setActionLoading(true);
      const registrationId = competition.userState.registration?.id;
      const res = await competitionApi.confirmPayment(registrationId, `MOCK-${Date.now()}`);
      setCompetition(res.data.competition);
      setPaymentModalVisible(false);
    } catch (err) {
      Alert.alert('Payment failed', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUploadSubmission = async (asset) => {
    try {
      setActionLoading(true);
      const registrationId = competition.userState.registration?.id;
      const formData = new FormData();
      formData.append('media', {
        uri: asset.uri,
        name: asset.fileName || `submission-${Date.now()}.jpg`,
        type: asset.mimeType || 'image/jpeg',
      });
      const res = await competitionApi.uploadSubmission(registrationId, formData);
      setCompetition(res.data.competition);
      setSubmissionModalVisible(false);
      Alert.alert('Submitted!', 'Your entry has been uploaded successfully.');
    } catch (err) {
      Alert.alert('Upload failed', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!competition) return null;

  return (
    <View style={styles.screen}>
      <TopBar onBack={() => navigation?.goBack?.()} />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <CompetitionHeaderCard competition={competition} />
        <JudgeCard judge={competition.judge} />
        <CountdownBanner countdown={competition.countdown} />
        <ImportantDatesGrid dates={competition.dates} />
        <PreviousWinnersCarousel winners={competition.previousWinners} />
        <InfoTabs description={competition.description} />
        <RewardsList rewards={competition.rewards} />

        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerText}>Disclaimer: Only contributions from paid participants will be considered for judging.</Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>✓ Refund policy</Text>
          <Text style={styles.metaText}>✓ Secure payments powered by {competition.paymentProvider}</Text>
        </View>

        <ReferralCard referralCode={user?.referralCode} />
      </ScrollView>

      <BottomCTA userState={competition.userState} onPress={handleCtaPress} loading={actionLoading} />

      <PaymentModal
        visible={paymentModalVisible}
        entryFee={competition.entryFee}
        loading={actionLoading}
        onConfirm={handleConfirmPayment}
        onClose={() => setPaymentModalVisible(false)}
      />
      <SubmissionModal
        visible={submissionModalVisible}
        loading={actionLoading}
        onSubmit={handleUploadSubmission}
        onClose={() => setSubmissionModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 14, paddingBottom: 24 },
  disclaimerBox: { backgroundColor: colors.primaryLight, borderRadius: 12, padding: 12 },
  disclaimerText: { fontSize: 12, color: colors.primary, fontWeight: '600' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  metaText: { fontSize: 11, color: colors.textSecondary },
});
