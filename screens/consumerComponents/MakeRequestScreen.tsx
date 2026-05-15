import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ConsumerStackParams } from '../../navigation/types';
import { useNavigation } from '@react-navigation/native';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import NumericInput from 'react-native-numeric-input'
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { AppButton } from '../ButtonComponents';
import { useAuthProfile } from '../../auth/AuthProvider';
import { createEventRequest as createEvent } from '../../services/events';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { commonStyles } from '../../theme/styles';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

type homeScreenProp = NativeStackNavigationProp<ConsumerStackParams, 'makeRequestScreen'>;

export function MakeRequestScreen() {
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [endTime, setEndTime] = useState<Date>(new Date());
  const [address, setAddress] = useState<string>('');
  const [eventName, setEventName] = useState('');
  const [error, setError] = useState('')
  const [sendable, setSendable] = useState(false)
  const [requestedSpaces, setRequestedSpaces] = useState<number>(1);
  const navigation = useNavigation<homeScreenProp>();
  const [date, setDate] = useState(new Date())
  const [isStartTimeVisible, setStartTimeVisible] = useState(false);
  const [isEndTimeVisible, setEndTimeVisible] = useState(false);
  const [isDateVisible, setDateVisible] = useState(false);
  const { user, profile } = useAuthProfile();

  const createEventRequest = async () => {
    if (user) {
      const eventID = await createEvent({
        user,
        eventName: eventName ?? '',
        address,
        startTime,
        endTime,
        requestedSpaces,
      });

      if (eventID) {
        setEventName('');
        setStartTime(new Date());
        setEndTime(new Date());
        setAddress('');
        navigation.navigate('eventSuccessView', { eventID })
      }
    }
  }
  
  const dateAnd = (event: any, selectedDate: any) => {
    if (event.type === 'set' && selectedDate) {
      startTime.setDate(selectedDate.getDate());
      setStartTime(startTime);
      endTime.setDate(selectedDate.getDate());
      setEndTime(endTime);
      setDate(selectedDate);
    }
  };
  const startTimeAnd = (event: any, selectedDate: any) => {
    if (event.type === 'set' && selectedDate) {
      setStartTime(selectedDate);
      const diff = endTime.getTime()-selectedDate.getTime();
      findDiff(diff);
    }
  };
  const endTimeAnd = (event: any, selectedDate: any) => {
    if (event.type === 'set' && selectedDate) {
      setEndTime(selectedDate);
      const diff = selectedDate.getTime()-startTime.getTime();
      findDiff(diff);
    }
  };

  /* --------------------------- HELPER FUNCTIONS --------------------------- */
  
  const findDiff = (diff: number) => {
    const min = Math.ceil(diff / (1000 * 60));
    if (min < 0) {
      setSendable(false);
      setError('End time must be after start time.')
    } else if (min < 10) {
      setSendable(false);
      setError('Event duration must be at least 10 minutes.')
    } else {
      setError('');
      setSendable(true);
    }
  }

  const startConfirmIOS = (time: any) => {
    setStartTime(time);
    const diff = endTime.getTime()-time.getTime();
    findDiff(diff);
    setStartTimeVisible(false)
  };

  const endConfirmIOS = (time: any) => {
    setEndTime(time);
    const diff = time.getTime()-startTime.getTime();
    findDiff(diff);
    setEndTimeVisible(false);
  };
  
  const dateConfirmIOS = (date: any) => {
    startTime.setDate(date.getDate());
    setStartTime(startTime);
    endTime.setDate(date.getDate());
    setEndTime(endTime);
    setDate(date);
    setDateVisible(false);
  };
  
  const showModeAndroid = (currentMode: any, type: string) => {
    if (type === 'start') {
      DateTimePickerAndroid.open({
        value: startTime,
        onChange: startTimeAnd,
        mode: currentMode,
        is24Hour: false,
      });
    } else if (type === 'end') {
        DateTimePickerAndroid.open({
        value: endTime,
        onChange: endTimeAnd,
        mode: currentMode,
        is24Hour: false,
      });
    } else {
      DateTimePickerAndroid.open({
        value: startTime,
        onChange: dateAnd,
        mode: currentMode,
        is24Hour: false,
      });
    }
  };

  const showDatepicker = () => {
    showModeAndroid('date', '');
  };

  const showStartPicker = () => {
    showModeAndroid('time', 'start');
  };

  const showEndPicker = () => {
    showModeAndroid('time', 'end');
  };

  const DatePickeriOS = () => {
    const dateNow = new Date();

    return (
      <View>
        <View style={{flexDirection:"row"}}>
          <Text style={styles.labels}>Event Date:</Text>
          <DateTimePickerModal
            isVisible={isDateVisible}
            minimumDate={dateNow}
            mode='date'
            display="inline"
            onConfirm={dateConfirmIOS}
            onCancel={() => setDateVisible(false)}
          />
          <TextInput
            value={date.toLocaleDateString()}
            placeholder="Date"
            style={[styles.input, styles.datetimeAlgn]}
            onPressIn={() => setDateVisible(true)}
          />
        </View>
        <View style={{flexDirection:"row"}}>
          <Text style={styles.labels}>Start Time:</Text>
          <DateTimePickerModal
            isVisible={isStartTimeVisible}
            mode='time'
            onConfirm={startConfirmIOS}
            onCancel={() => setStartTimeVisible(false)}
          />
          <TextInput
            value={startTime.toLocaleTimeString(navigator.language, {
              hour: '2-digit',
              minute:'2-digit'
            })}
            placeholder="Start Time"
            style={[styles.input, styles.datetimeAlgn]}
            onPressIn={() => setStartTimeVisible(true)}
          />
        </View>
        <View style={{ flexDirection:"row" }}>
          <Text style={styles.labels}>End Time:</Text>
          <DateTimePickerModal
            isVisible={isEndTimeVisible}
            mode='time'
            onConfirm={endConfirmIOS}
            onCancel={() => setEndTimeVisible(false)}
          />
          <TextInput
            value={endTime.toLocaleTimeString(navigator.language, {
              hour: '2-digit',
              minute:'2-digit'
            })}
            placeholder="End Time"
            style={[styles.input, styles.datetimeAlgn]}
            onPressIn={() => setEndTimeVisible(true)}
          />
        </View>
      </View>
    )
  }

  const DatePickerAndroid = () => {
    return (
      <View>
        <AppButton onPress={showDatepicker} title="Select Date" extraStyles={styles.smallerWidth} />
        <AppButton onPress={showStartPicker} title="Select Start Time" extraStyles={styles.smallerWidth} />
        <AppButton onPress={showEndPicker} title="Select End Time" extraStyles={styles.smallerWidth} />
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScreenContainer scroll>
      <Text style={styles.eyebrow}>Organizer</Text>
        <Text style={styles.header}>Request Spaces</Text>
        <Text style={styles.subtitle}>Add the event details and invite local providers to help.</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TextInput
          value={eventName}
          onChangeText={setEventName}
          keyboardType="default"
          placeholder="Event Name"
          autoCapitalize="none"
          placeholderTextColor={colors.textMuted}
          autoCorrect={false}
          style={styles.input}
        />
        {Platform.OS === 'ios' 
          ? <DatePickeriOS /> 
          : <View style={styles.pickerCard}>
              <DatePickerAndroid />
              <Text style={styles.selectedDate}>Selected Date: {date.toLocaleDateString()}, {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
        }
          <TextInput
            value={address}
            onChangeText={setAddress}
            keyboardType="default"
            placeholder="Event Address"
            autoCapitalize="none"
            placeholderTextColor={colors.textMuted}
            autoCorrect={false}
            style={styles.input}
          />
        {profile?.address && (
          <Text style={styles.link} onPress={() => setAddress(profile.address ?? '')}>
            Use my profile address
          </Text>
        )}
        <View style={styles.spaceRow}>
          <Text style={styles.labels}>Spaces Needed</Text>
          <NumericInput rounded value={requestedSpaces} totalHeight={50} minValue={1} maxValue={10} onChange={count => setRequestedSpaces(count)} />
        </View>
        <AppButton
          title="Send Request"
          onPress={createEventRequest}
          disabled={!sendable || address.length == 0 || eventName.length == 0}
        />
      </ScreenContainer>
    </TouchableWithoutFeedback>
  );
}


const styles = StyleSheet.create({
  eyebrow: commonStyles.label,
  header: {
    ...commonStyles.screenTitle,
    marginBottom: spacing.sm,
  },
  input: {
    ...commonStyles.input,
  },
  error: {
    ...commonStyles.errorText,
    marginBottom: spacing.md,
  },
  link: {
    ...commonStyles.link,
    marginBottom: spacing.lg,
  },
  datetimeAlgn: {
    marginLeft: spacing.sm,
    marginTop: -4,
  },
  pickerCard: {
    ...commonStyles.card,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  selectedDate: {
    color: colors.textMuted,
    fontSize: 15,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  smallerWidth: {
    minWidth: 250,
    alignSelf: "center"
  },
  labels: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  spaceRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  subtitle: {
    ...commonStyles.subtitle,
    marginBottom: spacing.xl,
  }
});