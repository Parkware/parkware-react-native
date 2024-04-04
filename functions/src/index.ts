// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
import * as functions from "firebase-functions";

// The Firebase Admin SDK to access Firestore.
import {initializeApp} from "firebase-admin/app";
import {DocumentData, FieldValue, getFirestore} from "firebase-admin/firestore";
import Expo from "expo-server-sdk";
initializeApp();
const db = getFirestore();

export const updateAccProvider = functions.firestore
  .document("/events/{eventId}")
  .onUpdate(async (change: any, context: any) => {
    const afterArr = change.after.data().acceptedProviderIds;
    const beforeArr = change.before.data().acceptedProviderIds;
    const eventId = context.params.eventId;

    if (afterArr.length > beforeArr.length) {
      const addedProviderId: string = afterArr
        .filter((id: string) => !beforeArr.includes(id)).toString();
      // Get the no. of spaces from this acc provider
      let newProviderSpaces: number =
        change.after.data().interestedProviders
          .find((proObj: DocumentData) =>
            proObj.id == addedProviderId
          ).providerSpaces;
      const diff = change.after.requestedSpaces - change.after.accSpaceCount;
      if (diff < newProviderSpaces) {
        newProviderSpaces = diff;
      }

      db.collection("events/").doc(eventId).update({
        accSpaceCount: FieldValue.increment(newProviderSpaces),
      });

      const proDoc = await db.collection("users").doc(addedProviderId).get();

      return expo.sendPushNotificationsAsync([
        {
          to: proDoc.data()!.expoPushToken,
          sound: "default",
          title: "Organizer Accepted Interest",
          subtitle: "",
          body: "Click to view",
          data: {
            withSome: "notification",
          },
          priority: "high",
        },
      ]);
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

const expo = new Expo();

export const notifyNewEvent = functions.firestore
  .document("/events/{eventId}")
  .onCreate(async (eventsSnap: any) => {
    const usersColl = db.collection("users");
    const snap = await usersColl.where("isProvider", "==", true)
      .where("expoPushToken", "!=", "").get();
    snap.forEach((doc: any) => {
      if (doc.id !== eventsSnap.data().consumer_id) {
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
      }
      return null;
    });
    return null;
  });

export const notifyNewProvider = functions.firestore
  .document("/events/{eventId}")
  .onUpdate(async (change: any) => {
    const afterArr = change.after.data().interestedProviderIds;
    const beforeArr = change.before.data().interestedProviderIds;

    // If there's a new interested provider
    if (afterArr.length > beforeArr.length) {
      const consumerId = change.after.data().consumer_id;
      const userDoc = await db.collection("users").doc(consumerId).get();
      const consPushToken = userDoc.data()!.expoPushToken;

      return expo.sendPushNotificationsAsync([
        {
          to: consPushToken,
          sound: "default",
          title: "New Provider Interested",
          subtitle: "",
          body: "Click to accept",
          data: {
            withSome: "notification",
          },
          priority: "high",
        },
      ]);
    }
    return null;
  });

export const notifyGuestArrive = functions.firestore
  .document("/events/{eventId}")
  .onUpdate(async (change: any) => {
    const afterArr = change.after.data().arrivedProviderSpaces;
    const beforeArr = change.before.data().arrivedProviderSpaces;

    if (afterArr.length > beforeArr.length) {
      const addedProviderId: string = afterArr
        .filter((id: string) => !beforeArr.includes(id))
        .toString().slice(0, -2);
      const userDoc = await db.collection("users").doc(addedProviderId).get();
      const providerPushToken = userDoc.data()!.expoPushToken;

      return expo.sendPushNotificationsAsync([
        {
          to: providerPushToken,
          sound: "default",
          title: "New Guest Arrival",
          subtitle: "",
          body: "Click to view",
          data: {
            withSome: "notification",
          },
          priority: "high",
        },
      ]);
    }
    return null;
  });

export const notifyGuestDepart = functions.firestore
  .document("/events/{eventId}")
  .onUpdate(async (change: any) => {
    const afterArr = change.after.data().departedProviderSpaces;
    const beforeArr = change.before.data().departedProviderSpaces;

    if (afterArr.length > beforeArr.length) {
      const addedProviderId: string = afterArr
        .filter((id: string) => !beforeArr.includes(id))
        .toString().slice(0, -2);
      const userDoc = await db.collection("users").doc(addedProviderId).get();
      const providerPushToken = userDoc.data()!.expoPushToken;

      return expo.sendPushNotificationsAsync([
        {
          to: providerPushToken,
          sound: "default",
          title: "One of your guests has departed",
          subtitle: "",
          body: "Click to view",
          data: {
            withSome: "notification",
          },
          priority: "high",
        },
      ]);
    }
    return null;
  });
