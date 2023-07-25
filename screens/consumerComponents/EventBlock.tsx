import { View, Text } from "react-native";
import { docDataPair } from "../providerComponents/ProviderRequestsView";

interface StatusTextProps {
  event: docDataPair;
  showSpaces: boolean;
}
    
export const EventBlock = ({ event, showSpaces }: StatusTextProps) => {
  const formatTime = (time: any) => time.toDate().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
  const formatDate = (date: any) => date.toDate().toLocaleDateString();

  return (
    <View>
      <Text key={event.doc.eventName}>
        {'Event name: ' + event.doc.eventName}
      </Text>
      <Text key={event.doc.address}>
        {'Address: ' + event.doc.address}
      </Text>
      <Text key={event.doc.accepted_provider_id}>
        {'Date: ' + formatDate(event.doc.startTime)}
      </Text>
      <Text key={event.doc.startTime}>
        {'Time Range: ' + formatTime(event.doc.startTime) + '-' + formatTime(event.doc.endTime)}
      </Text>
      {!showSpaces && 
        <View>
          <Text>
            {event.doc.accSpaceCount == 0 ? 'No spaces available yet' : `Current Parking Spaces ${event.doc.accSpaceCount}`}
          </Text>
        </View>
      }
      <Text key={event.doc.requestedSpaces + 1}>
        {'Requested Spaces: ' + event.doc.requestedSpaces}
      </Text>
    </View>
  );
}