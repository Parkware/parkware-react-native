import { View, Text, TextInput } from "react-native";
import React, { useState } from "react";
import { DocDataPair } from "../../types/events";
import { colors } from "../../theme/colors";

interface StatusTextProps {
  event: DocDataPair;
  showSpaces: boolean;
  showEditSpaces: boolean;
  showName: boolean;
  eventText: any;
}
    
export const EventBlock = ({ event, showSpaces, showEditSpaces=false, showName=true, eventText }: StatusTextProps) => {
  const [editSpaces, setEditSpaces] = useState('');

  const formatTime = (time: any) => time.toDate().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
  const formatDate = (date: any) => date.toDate().toLocaleDateString();
  
  return (
    <View>
      { 
        showName && (
          <Text key={event.doc.eventName+event.id} style={eventText} >
            {'Event name: ' + event.doc.eventName}
          </Text>
        )
      }
      <Text key={event.doc.address} style={eventText}>
        {'Address: ' + event.doc.address}
      </Text>
      <Text style={eventText}>
        {'Date: ' + formatDate(event.doc.startTime)}
      </Text>
      <Text style={eventText}>
        {'Time Range: ' + formatTime(event.doc.startTime) + '-' + formatTime(event.doc.endTime)}
      </Text>
      {showSpaces && 
        <View>
          <Text style={eventText}>
            {event.doc.accSpaceCount == 0 ? 'No spaces available yet' : `Current Parking Spaces ${event.doc.accSpaceCount}`}
          </Text>
          {showEditSpaces
            ? <TextInput 
                value={editSpaces}
                onChangeText={setEditSpaces}
                placeholder={event.doc.requestedSpaces.toString()}
                keyboardType='numeric'
                placeholderTextColor={colors.textMuted}
              />
            : <Text key={event.doc.requestedSpaces + 1} style={eventText}>
                {'Requested Spaces: ' + event.doc.requestedSpaces}
              </Text>
          }
        </View>
      }
    </View>
  );
}