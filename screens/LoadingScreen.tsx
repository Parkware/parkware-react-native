import { StyleSheet, Text } from 'react-native'
import React from 'react'
import { ScreenContainer } from '../components/layout/ScreenContainer'
import { commonStyles } from '../theme/styles'
import { spacing } from '../theme/spacing'

const LoadingScreen = () => {
  return (
    <ScreenContainer centered>
      <Text style={styles.eyebrow}>Parkware</Text>
      <Text style={styles.title}>Loading...</Text>
    </ScreenContainer>
  )
}

export default LoadingScreen

const styles = StyleSheet.create({
  eyebrow: commonStyles.label,
  title: {
    ...commonStyles.screenTitle,
    marginTop: spacing.sm,
  },
});