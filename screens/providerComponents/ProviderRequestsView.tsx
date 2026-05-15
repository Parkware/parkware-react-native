import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, StyleSheet } from 'react-native';
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
    <SafeAreaView style={{ justifyContent: 'center', alignItems: 'center', marginTop: 75 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {acceptedEvents.length !== 0 && (
          <Text style={[styles.requestHeader, { marginTop: 20 }]}>
            Accepted
          </Text>
        )}
        <View>
          {acceptedEvents.map(event => (
            <TouchableOpacity style={styles.eventBlock} key={event.id} onPress={() => navigation.navigate('parkingStatusView', { event })}>
              <View style={{ padding: 10 }} key={event.id}>
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
              <View style={[styles.unclickableRequests, { paddingHorizontal: 20 }]} key={event.id}>
                <EventCard event={event} showSpaces={true} status="open" textStyle={styles.darkEventText}/>
                <View style={{ padding: 10, justifyContent: 'space-between' }}>
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
              <Text style={{ fontSize: 17, fontWeight: 'bold', marginBottom: 10 }}>
                Denied Events
              </Text>
              {deniedEventNames
                .map((name: string) => (
                  <View style={{ marginBottom: 10 }} key={name}>
                    <Text>{name}</Text>
                  </View>
                ))}
            </View>
          )
        }
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  eventBlock: { 
    borderWidth: 1,
    overflow: 'hidden',
    borderRadius: 10,
    marginVertical: 10,
    borderColor: colors.border, 
    backgroundColor: colors.primaryMuted,
  },
  requestHeader: { 
    fontSize: 23, 
    fontWeight: 'bold', 
    marginBottom: 10, 
    alignSelf: "center"
  },
  eventText: {
    fontSize: 17,
    padding: 1,
    color: colors.textInverse
  },
  darkEventText: {
    color: colors.text,
    fontSize: 17,
    padding: 1,
  },
  unclickableRequests: { 
    borderWidth: 0.5,
    overflow: 'hidden',
    borderRadius: 10,
    marginVertical: 5,
    borderColor: colors.border, 
    padding: 9, 
    backgroundColor: colors.surfaceMuted
  },
  eventButton: {
    width: 155, 
    alignSelf: "center" 
  },
  headerStyleIOS: { 
    fontSize: 16, 
    marginTop: 10, 
    marginRight: -5 
  },
  headerStyleAndroid: {
    fontSize: 16, 
    marginTop: 10, 
    marginRight: -5,
  }
});