// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
import * as functions from "firebase-functions";

// The Firebase Admin SDK to access Firestore.
import {initializeApp} from "firebase-admin/app";
import {DocumentData, FieldValue, getFirestore} from "firebase-admin/firestore";

initializeApp();
const db = getFirestore();

export const onMessageUpdate = functions.firestore.document("/events/{eventId}")
  .onUpdate(async (change: any, context: any) => {
    const afterArr = change.after.data().acceptedProviderIds;
    const beforeArr = change.before.data().acceptedProviderIds;
    const eventId = context.params.eventId;
    
    // finding diff between the old and new array and updating the event doc accordingly
    if (afterArr.length > beforeArr.length) {
      let addedProviderId: string = afterArr.filter((b: string) => !beforeArr.includes(b)).toString();
      
      const newProviderSpaces = change.after.data().interestedProviders
      .filter((proObj: DocumentData) => {
        proObj.id == addedProviderId
      }).providerSpaces
      
      return db.collection('/events/')
        .doc(eventId).update({
          accSpaceCount: FieldValue.increment(newProviderSpaces)
        });
    }
    return null;
  });
/*

on write, check if the interested pros field was updated. if yes, get the objects
providerSpaces field and increment it on the accproviderspaces field. this causes another write,
so do some check. 

const eventSnap = await db.collection('/events/').doc(eventId).get();
      if (eventSnap.exists) {
        eventSnap.data()!.interestedProviders.map(())
      }

*/