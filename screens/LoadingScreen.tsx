import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'

const LoadingScreen = () => {
  return (
    <View style={{ alignItems: "center", marginTop: 350 }}>
      <Text style={{ fontSize: 50 }}>Loading...</Text>
    </View>
  )
}

export default LoadingScreen