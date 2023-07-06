import { View, Text } from "react-native";
import { docDataPair } from "./ProviderRequestsView";
import { auth, db } from '../../firebaseConfig';

interface StatusTextProps {
  event: docDataPair;
}
    
export const EventStatusText = ({ event }: StatusTextProps) => {
  if (auth.currentUser) {
    let statusWord = '';
    let statusColor = '';
    if (event.doc.acceptedProviderIds.includes(auth.currentUser.uid)) {
      statusWord = 'Status: accepted'
      statusColor = 'green';
    } else if (!event.doc.acceptedProviderIds.includes(auth.currentUser.uid) && event.doc.interestedProviderIds.includes(auth.currentUser.uid)) {
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