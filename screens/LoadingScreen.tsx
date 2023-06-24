import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'

const LoadingScreen = () => {
  useEffect(() => {
    console.log('loading');
  }, [])
  
  return (
    <View>
      <Text>LoadingScreen</Text>
    </View>
  )
}

export default LoadingScreen

const styles = StyleSheet.create({})