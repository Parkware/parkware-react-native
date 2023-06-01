import { View, Text } from 'react-native'
import React from 'react'
import { DocumentData, addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

import { useEffect, useState } from 'react';

export default function ShowDocs() {
  const [data, setData] = useState<DocumentData[]>([]);

  useEffect(() => {
    const getData = async () => {
      const snap = await getDocs(collection(db, '/UserDB/'));
    // const docRef = await addDoc(collection(db, '/users/'), {
    // "Location": {
    // "City": "Morrisville",
    // "Door No": 241,
    // "State": "NC",
    // "Street Name": "Begen St",
    // "Zip": 27560,
    // },
    // Date Of Birth: November 14, 1980 at 12:00:00 AM UTC-5
    // First Name: "Nagendra Kumar"
    // Last Name: "Nainar"
    // Phone Number: 9193812092
    // email: "nagendrakumar.nainar@gmail.com"
    //     
    // });
      const dataArray = snap.docs.map((doc) => doc.get("First Name"));
      setData(dataArray);
      await deleteDoc(doc(collection(db, '/UserDB/'), '73ilMf4Sw7VWxH0iJQg7'))
    };
    const d = doc(collection(db, '/UserDB/'));
    getData();

  }, []);

  const f = async () => {
    const citiesRef = collection(db, "cities");

    await setDoc(doc(citiesRef, "SF"), {
        name: "San Francisco", state: "CA", country: "USA",
        capital: false, population: 860000,
        regions: ["west_coast", "norcal"] });
    await setDoc(doc(citiesRef, "LA"), {
        name: "Los Angeles", state: "CA", country: "USA",
        capital: false, population: 3900000,
        regions: ["west_coast", "socal"] });
    await setDoc(doc(citiesRef, "DC"), {
        name: "Washington, D.C.", state: null, country: "USA",
        capital: true, population: 680000,
        regions: ["east_coast"] });
    await setDoc(doc(citiesRef, "TOK"), {
        name: "Tokyo", state: null, country: "Japan",
        capital: true, population: 9000000,
        regions: ["kanto", "honshu"] });
    await setDoc(doc(citiesRef, "BJ"), {
        name: "Beijing", state: null, country: "China",
        capital: true, population: 21500000,
        regions: ["jingjinji", "hebei"] });

    const q = query(collection(db, "cities"), where("capital", "==", true));

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    console.log(doc.id, " => ", doc.data());
    });
        
    }

    f();
  return (
    <View style = {{ marginTop: 50, marginLeft: 30 }}>
      <Text>ShowDocs</Text>
      {data.map((item, index) => (
        <Text style = {{ marginTop: 10}} key={index}>{JSON.stringify(item)}</Text>
      ))}
    </View>);
}
