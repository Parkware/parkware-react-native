// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
import * as functions from "firebase-functions";

// The Firebase Admin SDK to access Firestore.
import {initializeApp} from "firebase-admin/app";
import {DocumentData, FieldValue, getFirestore} from "firebase-admin/firestore";
import Expo from "expo-server-sdk";
initializeApp();
const db = getFirestore();

export const incrementSpaceCount = functions.firestore
  .document("/events/{eventId}")
  .onUpdate(async (change: any, context: any) => {
    const afterArr = change.after.data().acceptedProviderIds;
    const beforeArr = change.before.data().acceptedProviderIds;
    const eventId = context.params.eventId;

    if (afterArr.length > beforeArr.length) {
      const addedProviderId: string = afterArr
        .filter((id: string) => !beforeArr.includes(id)).toString();
      let newProviderSpaces: number =
        change.after.data().interestedProviders
          .find((proObj: DocumentData) =>
            proObj.id == addedProviderId
          ).providerSpaces;
      const diff = change.after.requestedSpaces - change.after.accSpaceCount;
      if (diff < newProviderSpaces) {
        newProviderSpaces = diff;
      }

      return db.collection("/events/").doc(eventId).update({
        accSpaceCount: FieldValue.increment(newProviderSpaces),
      });
    }
    return null;
  });

export const checkIfOpen = functions.firestore
  .document("/events/{eventId}")
  .onUpdate(async (change: any, context: any) => {
    const after = change.after.data();
    const eventId = context.params.eventId;

    if (after.accSpaceCount >= after.requestedSpaces) {
      return db.collection("/events/").doc(eventId).update({
        isOpen: false,
      });
    }
    return null;
  });

export const checkIfEnd = functions.firestore
  .document("/events/{eventId}")
  .onUpdate(async (change: any, context: any) => {
    const after = change.after.data();
    const eventId = context.params.eventId;
    const dateNow = Date.now();
    const eventEnd = after.endTime.toMillis();
    if (after.departedProviderSpaces.length == 0 && dateNow > eventEnd) {
      return db.collection("/events/").doc(eventId).set({
        eventEnded: true,
      }, {merge: true});
    }
    return null;
  });

// export const notifyNewEvent = functions.firestore
//   .document("/events/{eventId}")
//   .onCreate(async (change: any, context: any) => {
// });

const expo = new Expo();

export const notifyNewEvent = functions.firestore
  .document("/events/{eventId}")
  .onCreate(async () => {
  // await saveToken(context.params.userId, context.params.)
  // tokens are generated and saved with each user data sample
  // store them in an array and iterate over all and send the message

    // get all users who are providers and have a valid expo notification token
    const usersColl = db.collection("users");
    const snap = await usersColl.where("isProvider", "==", true)
      .where("expoPushToken", "!=", "").get();
    snap.forEach((doc: any) => {
      console.log(doc.data());
      return expo.sendPushNotificationsAsync([
        {
          to: doc.data().expoPushToken,
          sound: "default",
          title: "New Event Request",
          subtitle: "",
          body: "Click to provide your space",
          data: {
            withSome: "notification",
          },
          priority: "high",
        },
      ]);
    });
    return null;
  });
