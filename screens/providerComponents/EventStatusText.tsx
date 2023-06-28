import { View, Text } from "react-native";
import { docDataPair } from "../ProviderRequestsView";
import { auth, db } from '../../firebaseConfig';

interface StatusTextProps {
  event: docDataPair;
}
    
export const EventStatusText = ({ event }: StatusTextProps) => {
  if (auth.currentUser) {
    let statusWord = '';
    let statusColor = '';
    if (event.doc.acceptedProviderIds == auth.currentUser.uid) {
      statusWord = 'Status: accepted'
      statusColor = 'green';
    } else if (event.doc.acceptedProviderIds.length == 0) {
      statusWord = 'Status: pending'
      statusColor = 'yellow';
    } else {
      statusWord = 'Status: denied'
      statusColor = 'red';
    }
    return (
      <View style={{
        borderRadius: 10,
        borderColor: statusColor
      }} >
        <Text key={event.doc.acceptedProviderIds}>
            {statusWord}
        </Text>
      </View>
    )
  }
  return null;
}