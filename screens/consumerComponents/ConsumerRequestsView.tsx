import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DocumentData } from 'firebase/firestore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ConsumerStackParams } from '../../navigation/types';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';
import { AppButton } from '../ButtonComponents';
import { EventCard } from '../../components/events/EventCard';
import { ScreenState } from '../../components/layout/ScreenState';
import { useAuthProfile } from '../../auth/AuthProvider';
import { useConsumerEvents } from '../../hooks/useConsumerEvents';
import { colors } from '../../theme/colors';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { commonStyles } from '../../theme/styles';
import { spacing } from '../../theme/spacing';

export type consumerScreenProp = NativeStackNavigationProp<ConsumerStackParams, 'consumerRequestsView'>;

export function ConsumerRequestsView() {
  const navigation = useNavigation<consumerScreenProp>();
  const { user, profile } = useAuthProfile();
  const { pendingEvents, completedEvents, loading } = useConsumerEvents(user?.uid);

  const switchView = () => navigation.navigate('makeRequestScreen');
  const hasEvents = pendingEvents.length !== 0 || completedEvents.length !== 0;

  return (
    <ScreenContainer scroll>
          <Text style={styles.eyebrow}>Organizer</Text>
          {profile?.name ? <Text style={styles.greeting}>Welcome, {profile.name}</Text> : null}
          {pendingEvents.length !== 0 && (
            <Text style={[styles.requestHeader, { marginTop: 15 }]}>
              Pending
            </Text>
          )}
          <View>
            {pendingEvents.map(event => (
              <TouchableOpacity style={styles.eventBlock} key={event.id} onPress={() => navigation.navigate('chooseProviderView', { event })}>
                <View>
                  <EventCard event={event} showSpaces={true} status="pending" />
                  {event.doc.interestedProviders.length !== 0
                    && ( 
                    <View>
                      <Text style={styles.providerTitle}>Available Providers</Text>
                      {event.doc.interestedProviders
                        .filter((pro: DocumentData) => !event.doc.acceptedProviderIds.includes(pro.id))
                        .map((providerInfo: DocumentData) => (
                        <View key={providerInfo.id}>
                          <Text key={providerInfo.name} style={styles.providerText}>
                          {'Name: ' + providerInfo.name}
                          </Text>
                          <Text key={providerInfo.address} style={styles.providerText}>
                          {'Address: ' + providerInfo.address}
                          </Text>
                        </View>
                      ))}
                    </View>
                    )
                  }
                </View>
              </TouchableOpacity>
            ))}
          </View>
          {completedEvents.length !== 0 && (
            <Text style={[styles.requestHeader, { marginTop: 15 }]}>
              Accepted
            </Text>
          )}
          <View>
            {completedEvents.map((event) => (
              <TouchableOpacity style={styles.eventBlock} key={event.id} onPress={() => navigation.navigate('eventInfoView', { event })}>
                <View>
                <EventCard event={event} showSpaces={false} status="accepted" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
          {loading && <ScreenState title="Loading events..." />}
          {!loading && !hasEvents && (
            <ScreenState title="No events yet" message="Request parking spaces to start tracking provider interest here." />
          )}
          <AppButton
            title="Request Spaces"
            onPress={switchView}
            extraStyles={{ marginTop: 7, marginBottom: 30 }}
          />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  eventBlock: { 
    ...commonStyles.card,
    overflow: 'hidden',
    marginVertical: spacing.sm,
  },
  eyebrow: commonStyles.label,
  greeting: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: spacing.xl,
  },
  providerText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  providerTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  requestHeader: { 
    ...commonStyles.sectionTitle,
    marginTop: spacing.lg,
  },
});