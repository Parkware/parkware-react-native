import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { commonStyles } from '../theme/styles';

export const HomeScreen = () => {
  return (
    <ScreenContainer centered>
      <View style={styles.infoBlock}>
        <Text style={styles.eyebrow}>Parkware</Text>
        <Text style={styles.title}>Parking, simplified.</Text>
        
        <Text style={styles.subtitle}>
          Request spaces as an organizer or offer your driveway as a provider. Everything is grouped by neighborhood and kept simple.
        </Text>
        
        <View style={styles.divider} />

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
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  divider: {
    backgroundColor: colors.border,
    height: 1,
    marginVertical: spacing.xl,
    width: '100%',
  },
  eyebrow: {
    ...commonStyles.label,
    alignSelf: 'center',
  },
  title: {
    ...commonStyles.screenTitle,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    ...commonStyles.subtitle,
    textAlign: 'center',
  },
  link: {
    ...commonStyles.link,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  infoBlock: {
    ...commonStyles.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    ...commonStyles.link,
    color: colors.textMuted,
  },
});