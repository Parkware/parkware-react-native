import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, SafeAreaView } from 'react-native';

export const HomeScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.infoBlock}>
        <Text style={styles.title}>Welcome to Parkware</Text>
        
        <Text style={styles.subtitle}>
          Navigate to the organizer tab to request spaces or see the status of your current requests.
        </Text>
        
        <Text style={styles.subtitle}>
          Navigate to the provider tab to see open events and provide your space for them. You can also see the current events you're providing for.
        </Text>

        <Text style={styles.subtitle}>
          Open the following links to get more information:
        </Text>

        <TouchableOpacity onPress={() => Linking.openURL('https://youtu.be/kjg3q9gL15w?si=8M13GXai18xmLZ1v')}>
          <Text style={styles.link}>What is Parkware?</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => Linking.openURL('https://www.youtube.com/playlist?list=PLZq65TsC76Dvqk2vz3EwcJjJ1h5tt0Pmp')}>
          <Text style={styles.link}>Parkware Tutorial Series</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{ paddingTop: 30 }} onPress={() => Linking.openURL('https://linktr.ee/parkware')}>
          <Text style={styles.info}>Learn more</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    paddingVertical: 50
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  link: {
    fontSize: 16,
    color: '#007bff',
    textDecorationLine: 'underline',
    marginBottom: 10,
  },
  infoBlock: {
    padding: 10,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: "#d7e6fc",
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    color: '#919191',
    marginBottom: 20,
    textDecorationLine: 'underline'
  },
});