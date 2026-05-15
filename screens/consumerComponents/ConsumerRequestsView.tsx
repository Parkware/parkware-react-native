import React from 'react';
import { View, Text, SafeAreaView, StyleSheet, Platform } from 'react-native';
import { DocumentData } from 'firebase/firestore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ConsumerStackParams } from '../../navigation/types';
import { useNavigation } from '@react-navigation/native';
import { ScrollView, TouchableOpacity } from 'react-native';
import { AppButton } from '../ButtonComponents';
import { EventCard } from '../../components/events/EventCard';
import { ScreenState } from '../../components/layout/ScreenState';
import { useAuthProfile } from '../../auth/AuthProvider';
import { useConsumerEvents } from '../../hooks/useConsumerEvents';
import { colors } from '../../theme/colors';

export type consumerScreenProp = NativeStackNavigationProp<ConsumerStackParams, 'consumerRequestsView'>;

export function ConsumerRequestsView() {
  const navigation = useNavigation<consumerScreenProp>();
  const { user, profile } = useAuthProfile();
  const { pendingEvents, completedEvents, loading } = useConsumerEvents(user?.uid);

  const switchView = () => navigation.navigate('makeRequestScreen');
  const hasEvents = pendingEvents.length !== 0 || completedEvents.length !== 0;

  return (
    <SafeAreaView style={{ justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ paddingTop: Platform.OS === "android" ? 30 : 0 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {profile?.name ? <Text style={styles.greeting}>Welcome, {profile.name}</Text> : null}
          {pendingEvents.length !== 0 && (
            <Text style={[styles.requestHeader, { marginTop: 15 }]}>
              Pending
            </Text>
          )}
          <View>
            {pendingEvents.map(event => (
              <TouchableOpacity style={styles.eventBlock} key={event.id} onPress={() => navigation.navigate('chooseProviderView', { event })}>
                <View style={{ padding: 10 }}>
                  <EventCard event={event} showSpaces={true} status="pending" />
                  {event.doc.interestedProviders.length !== 0
                    && ( 
                    <View>
                      <Text style={{ fontSize: 18, marginBottom: 4, marginTop: 7, color: "white" }}>Available Providers:</Text>
                      {event.doc.interestedProviders
                        .filter((pro: DocumentData) => !event.doc.acceptedProviderIds.includes(pro.id))
                        .map((providerInfo: DocumentData) => (
                        <View key={providerInfo.id}>
                          <Text key={providerInfo.name} style={{ color: "white" }}>
                          {'Name: ' + providerInfo.name}
                          </Text>
                          <Text key={providerInfo.address} style={{ color: "white" }}>
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
                <View style={{ padding: 10 }}>
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
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  eventBlock: { 
    borderWidth: 1,
    overflow: 'hidden',
    borderRadius: 10,
    marginVertical: 5,
    borderColor: "#9e9e9e", 
    backgroundColor: colors.primaryMuted,
  },
  greeting: {
    alignSelf: "center",
    color: colors.text,
    fontSize: 16,
    marginTop: 15,
  },
  requestHeader: { 
    fontSize: 23, 
    fontWeight: 'bold', 
    marginBottom: 10, 
    alignSelf: "center",
  },
});