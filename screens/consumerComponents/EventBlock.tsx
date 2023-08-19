import { View, Text, TextInput, StyleSheet } from "react-native";
import { docDataPair } from "../providerComponents/ProviderRequestsView";
import { useEffect, useState } from "react";

interface StatusTextProps {
  event: docDataPair;
  // sometimes, we need to render the space count with a state variable 
  // in the component as it's actively being updated (i.e. MultiProvidrDetailsView.tsx)
  showSpaces: boolean;
  showEditSpaces: boolean;
  showName: boolean;eventText: any;
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
      <Text key={event.doc.accepted_provider_id} style={eventText}>
        {'Date: ' + formatDate(event.doc.startTime)}
      </Text>
      <Text key={event.doc.startTime} style={eventText}>
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
                placeholder={event.doc.requestedSpaces}
                keyboardType='numeric'
                placeholderTextColor="#aaa"
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

const styles = StyleSheet.create({eventText: {
    fontSize: 15,
    paddingVertical: 1
  }
});