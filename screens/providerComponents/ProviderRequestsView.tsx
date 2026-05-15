import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import 'firebase/firestore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProviderStackParams } from '../../navigation/types';
import { useNavigation } from '@react-navigation/native';
import { AppButton } from '../ButtonComponents';
import { EventCard } from '../../components/events/EventCard';
import { ScreenState } from '../../components/layout/ScreenState';
import { useAuthProfile } from '../../auth/AuthProvider';
import { useProviderEvents } from '../../hooks/useProviderEvents';
import { addProviderInterest, declineEventForProvider } from '../../services/events';
import { DocDataPair } from '../../types/events';
import { colors } from '../../theme/colors';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { commonStyles } from '../../theme/styles';
import { spacing } from '../../theme/spacing';

export type providerScreenProp = NativeStackNavigationProp<ProviderStackParams, 'providerRequestsView'>;

export function ProviderRequestsView() {
  const [unwantedEvents, setUnwantedEvents] = useState<string[]>([]);
  const navigation = useNavigation<providerScreenProp>();
  const { user } = useAuthProfile();
  const {
    acceptedEvents,
    deniedEventNames,
    loading,
    openEvents,
    pendingEvents,
    unwantedEventIds,
  } = useProviderEvents(user?.uid);

  const removeLocalEventData = (id: string) => {
    setUnwantedEvents(current => [...current, id]);
    if (user) {
      declineEventForProvider(id, user.uid);
    }
  }
  
  const updateDB = async (eventData: DocDataPair) => {
    if (user) {
      await addProviderInterest(eventData, user.uid);
    }
  }
  const hiddenOpenEventIds = [...unwantedEvents, ...unwantedEventIds];
  const visibleOpenEvents = openEvents.filter((event) => !hiddenOpenEventIds.includes(event.id));
  const hasEvents = acceptedEvents.length !== 0 || pendingEvents.length !== 0 || visibleOpenEvents.length !== 0;
  
  return (
    <ScreenContainer scroll>
        <Text style={styles.eyebrow}>Provider</Text>
        <Text style={styles.pageTitle}>Requests</Text>
        {acceptedEvents.length !== 0 && (
          <Text style={[styles.requestHeader, { marginTop: 20 }]}>
            Accepted
          </Text>
        )}
        <View>
          {acceptedEvents.map(event => (
            <TouchableOpacity style={styles.eventBlock} key={event.id} onPress={() => navigation.navigate('parkingStatusView', { event })}>
              <View key={event.id}>
                <EventCard event={event} showSpaces={false} status="accepted" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
        {pendingEvents.length !== 0 && (
          <Text style={[styles.requestHeader, { marginTop: 20 }]}>
            Pending
          </Text>
        )}
        <View>
          {pendingEvents.map((event) => (
            <View style={styles.unclickableRequests} key={event.id.slice(0, 5)}>
              <EventCard event={event} showSpaces={false} status="pending" textStyle={styles.darkEventText} />
            </View>
          ))}
        </View>
        {visibleOpenEvents.length !== 0 && (
          <Text style={[styles.requestHeader, { marginTop: 20 }]}>
            Open
          </Text>
        )}
        {visibleOpenEvents.length !== 0 && (
          <View>
            {visibleOpenEvents
              .map((event) => (
              <View style={styles.unclickableRequests} key={event.id}>
                <EventCard event={event} showSpaces={true} status="open" textStyle={styles.darkEventText}/>
                <View style={styles.actionRow}>
                  <AppButton title="Accept" extraStyles={styles.eventButton} onPress={() => updateDB(event)}/>
                  <AppButton title="Decline" extraStyles={styles.eventButton} onPress={() => removeLocalEventData(event.id)}/>
                </View>
              </View>
            ))}
          </View>
        )}
        {loading && <ScreenState title="Loading provider events..." />}
        {!loading && !hasEvents && (
          <ScreenState title="No provider requests" message="Open organizer requests will appear here when they are available." />
        )}
        {deniedEventNames.length !== 0 &&
          (
            <View>
              <Text style={styles.deniedTitle}>
                Denied Events
              </Text>
              {deniedEventNames
                .map((name: string) => (
                  <View style={styles.deniedItem} key={name}>
                    <Text style={styles.darkEventText}>{name}</Text>
                  </View>
                ))}
            </View>
          )
        }
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  deniedItem: {
    ...commonStyles.card,
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  deniedTitle: {
    ...commonStyles.sectionTitle,
    marginTop: spacing.xl,
  },
  eventBlock: { 
    ...commonStyles.card,
    overflow: 'hidden',
    marginVertical: 10,
  },
  eyebrow: commonStyles.label,
  pageTitle: {
    ...commonStyles.screenTitle,
    marginBottom: spacing.lg,
  },
  requestHeader: { 
    ...commonStyles.sectionTitle,
    marginTop: spacing.lg,
  },
  eventText: {
    fontSize: 17,
    padding: 1,
    color: colors.text
  },
  darkEventText: {
    color: colors.text,
    fontSize: 17,
    padding: 1,
  },
  unclickableRequests: { 
    ...commonStyles.card,
    overflow: 'hidden',
    marginVertical: 5,
    padding: spacing.lg,
  },
  eventButton: {
    width: 155, 
    alignSelf: "center" 
  },
});