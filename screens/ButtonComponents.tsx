import React from 'react';
import { Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';

export const AppButton = ({ onPress, title, extraStyles=null, disabled }: any) => (
  <TouchableOpacity 
    onPress={onPress} 
    style={
      disabled 
      ? [styles.appButtonContainer, { backgroundColor: '#c7c3c3', elevation: 0 }]
      : [styles.appButtonContainer, extraStyles]}
    disabled={disabled}
  >
    <Text style={styles.appButtonText}>{title}</Text>
  </TouchableOpacity>
);

export const AuthButton = ({ onPress, title, extraStyles=null, disabled }: any) => (
  <TouchableOpacity 
    onPress={onPress} 
    style={[styles.authButtonContainer, extraStyles]}
    disabled={disabled}
  >
    <Text style={styles.authButtonText}>{title}</Text>
  </TouchableOpacity>
);

export const DeleteAccountButton = ({ onPress, title, extraStyles=null, disabled }: any) => (
  <TouchableOpacity 
    onPress={onPress} 
    style={[styles.authButtonContainer, extraStyles]}
    disabled={disabled}
  >
    <Text style={styles.deleteButtonText}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inner: {
    width: 240,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    marginTop: 16,
  },
  error: {
    marginBottom: 20,
    color: 'red',
  },
  link: {
    color: 'blue',
    marginBottom: 20,
  },
  datetimeAlgn: {
    marginLeft: 15,
    marginTop: -4
  },
  selectedDate: {
    padding: 13, 
    fontSize: 16
  },
  appButtonContainer: {
    elevation: 8,
    backgroundColor: "#6b7080",
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 12,
    margin: 2
  },
  appButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    alignSelf: "center",
  },
  authButtonContainer: {
    elevation: Platform.OS === "android" ? 0 : 8,
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 12,
    margin: 2,
    borderWidth: 2,
    borderColor: "#4f9ee3"
  },
  authButtonText: {
    fontSize: 15,
    color: "#3a74a6",
    fontWeight: "bold",
    alignSelf: "center",
  },
  deleteButtonText: {
    fontSize: 18,
    color: "red",
    fontWeight: "bold",
    alignSelf: "center",
  }
});