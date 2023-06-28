import { View, Text } from "react-native";
import { docDataPair } from "../providerComponents/ProviderRequestsView";
import { docDataTrio } from "./ConsumerRequestsView";

interface StatusTextProps {
  event: docDataTrio | docDataPair;
  proView: boolean;
}
    
export const EventBlock = ({ event, proView }: StatusTextProps) => {
  const formatTime = (time: any) => time.toDate().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
  const formatDate = (date: any) => date.toDate().toLocaleDateString();

  return (
    <View>
      <Text key={event.doc.address}>
        {'Address: ' + event.doc.address}
      </Text>
      <Text key={event.doc.accepted_provider_id}>
        {'Date: ' + formatDate(event.doc.startTime)}
      </Text>
      <Text key={event.doc.startTime}>
        {'Time Range: ' + formatTime(event.doc.startTime) + '-' + formatTime(event.doc.endTime)}
      </Text>
      {!proView && 
        <Text key={event.doc.endTime}>
          {'Accepted: ' + event.doc.accepted}
        </Text>}
    </View>
  );
}