import { Text, View } from 'react-native'
import React from 'react'

const LoadingScreen = () => {
  return (
    <View style={{ alignItems: "center", marginTop: 350 }}>
      <Text style={{ fontSize: 50 }}>Logging in...</Text>
    </View>
  )
}

export default LoadingScreen