import { View, TextInput, Button, Text, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';

export function CountdownTimer() {
    const [date, setDate] = useState(new Date(2023, 6, 17, 8, 8, 0));

    const onChange = (event: any, selectedDate: any) => {
      if (event.type === 'set' && selectedDate) {
        setDate(selectedDate);
        console.log(selectedDate);
      }
    };

    return (
      <View style={{ justifyContent: 'center', alignContent: 'center', marginTop: 50}}>
        <Text>selected: {date.toLocaleString()}</Text>
          <DateTimePicker
            testID="dateTimePicker"
            value={date}
            mode='date'
            is24Hour={true}
            onChange={onChange}
          />
          <DateTimePicker
            testID="dateTimePicker"
            value={date}
            mode='time'
            is24Hour={true}
            onChange={onChange}
          />
      </View>
    );
  };