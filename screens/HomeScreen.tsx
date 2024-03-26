// import { View, Text, StyleSheet } from 'react-native';
// import { usePushNotifications } from '../usePushNotifications';


// export const HomeScreen = () => {
//     const { expoPushToken, notification } = usePushNotifications();
//     const data = JSON.stringify(notification, undefined, 2);
//     return (
//         <View style={styles.container}>
//         <Text>Token: {expoPushToken?.data ?? ""}</Text>
//         </View>
//     );
// }

// const styles = StyleSheet.create({
//     container: {
//       flex: 1,
//       backgroundColor: "#fff",
//       alignItems: "center",
//       justifyContent: "center",
//     },
//   });


import React, { useEffect, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import * as Notifications from 'expo-notifications';

export function HomeScreen() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    // Subscribe to incoming notifications when component mounts
    const subscription = Notifications.addNotificationReceivedListener(handleNotification);

    // Load existing notifications when component mounts
    loadNotifications();

    return () => {
      subscription.remove(); // Cleanup subscription when component unmounts
    };
  }, []);

  const loadNotifications = async () => {
    // Get all notifications from the device
    const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
    // console.log(allNotifications);
    
    setNotifications(allNotifications);
  };

  const handleNotification = (notification: any) => {
    // Update state to include the newly received notification
    setNotifications((prevNotifications: any) => [...prevNotifications, notification]);
  };

  useEffect(() => {
    console.log('notifications');
    
    console.log(notifications);
  }, [notifications])
  

  const renderNotificationItem = ({ item }: any) => (
    <View style={styles.notificationItem}>
      <Text style={styles.notificationTitle}>{item.request.content.title}</Text>
      <Text style={styles.notificationBody}>{item.request.content.body}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Notification Inbox</Text>
      {notifications.length !== null && 
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.request.identifier}
        />
      }
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  notificationItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  notificationBody: {
    fontSize: 16,
    marginTop: 5,
  },
});
