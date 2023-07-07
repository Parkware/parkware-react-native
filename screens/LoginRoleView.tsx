// import { Button, Text, TextInput, View, StyleSheet } from 'react-native'
// import React, { useState } from 'react'
// import { doc, setDoc, updateDoc } from 'firebase/firestore'
// import { auth, db } from '../firebaseConfig'
// import { NativeStackScreenProps } from '@react-navigation/native-stack';
// import { SignupStackParams } from '../App';
// import { User, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
// import NumericInput from 'react-native-numeric-input';

// type Props = NativeStackScreenProps<SignupStackParams, 'chooseRoleView'>;

// export const ChooseRoleView = ({ route }: Props) => {
//   const [showAddress, setShowAddress] = useState(false);
//   const [address, setAddress] = useState('');
//   const [providerSpaces, setProviderSpaces] = useState<number>();
  
//   const { name, email, password }  = route.params;
  
//   const logout = async () => {
//     try {
//       await signOut(auth);
//     } catch (e) {
//       console.error(e);
//     }
//   };

//   return (
//     <View>
//       <View style={{ justifyContent: "center", alignContent: "center", marginTop: 250, flexDirection: "row"}}>
//         <Text>Continue as a </Text>
//         <View>
//           <Button title="Provider" onPress={() => setShowAddress(true)}/>
//         </View>
//         <View>
//           <Button title="Consumer" onPress={() => createAccount(false)}/>
//         </View>
//       </View>
//       <Button title="Log out" onPress={logout} />
//     </View>
//   )
// }

// const styles = StyleSheet.create({
//   input: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 4,
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     marginBottom: 16,
//   }
// })