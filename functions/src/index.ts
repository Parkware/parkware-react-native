// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
import * as functions from "firebase-functions";

// The Firebase Admin SDK to access Firestore.
import {initializeApp} from "firebase-admin/app";
import {DocumentData, FieldValue, getFirestore} from "firebase-admin/firestore";
import Expo, {ExpoPushMessage} from "expo-server-sdk";
initializeApp();
const db = getFirestore();
const expo = new Expo();

const sendPushNotification = (
  to: string | undefined,
  title: string,
  body: string
) => {
  if (!to || !Expo.isExpoPushToken(to)) {
    return null;
  }

  const message: ExpoPushMessage = {
    to,
    sound: "default",
    title,
    subtitle: "",
    body,
    data: {
      withSome: "notification",
    },
    priority: "high",
  };

  return expo.sendPushNotificationsAsync([message]);
};

const addedArrayValue = (before: string[], after: string[]) =>
  after.find((id) => !before.includes(id));

export const updateAccProvider = functions.firestore
  .document("/events/{eventId}")
  .onUpdate(async (change, context) => {
    const afterArr = change.after.data().acceptedProviderIds;
    const beforeArr = change.before.data().acceptedProviderIds;
    const eventId = context.params.eventId;

    if (afterArr.length > beforeArr.length) {
      const addedProviderId = addedArrayValue(beforeArr, afterArr);
      if (!addedProviderId) {
        return null;
      }

      // Get the no. of spaces from this acc provider
      let newProviderSpaces: number =
        change.after.data().interestedProviders
          .find((proObj: DocumentData) =>
            proObj.id == addedProviderId
          ).providerSpaces;
      const diff = change.after.data().requestedSpaces -
        change.after.data().accSpaceCount;
      if (diff < newProviderSpaces) {
        newProviderSpaces = diff;
      }

      await db.collection("events/").doc(eventId).update({
        accSpaceCount: FieldValue.increment(newProviderSpaces),
      });

      const proDoc = await db.collection("users").doc(addedProviderId).get();

      return sendPushNotification(
        proDoc.data()?.expoPushToken,
        "Organizer Accepted Interest",
        "Click to view"
      );
    }
    return null;
  });

export const checkIfOpen = functions.firestore
  .document("/events/{eventId}")
  .onUpdate(async (change, context) => {
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
  .onUpdate(async (change, context) => {
    const after = change.after.data();
    const eventId = context.params.eventId;
    const dateNow = Date.now();
    const eventEnd = after.endTime.toMillis();
    if (after.departedProviderSpaces.length === 0 && dateNow > eventEnd) {
      return db.collection("/events/").doc(eventId).set({
        eventEnded: true,
      }, {merge: true});
    }
    return null;
  });

export const notifyNewEvent = functions.firestore
  .document("/events/{eventId}")
  .onCreate(async (eventsSnap) => {
    const usersColl = db.collection("users");
    const snap = await usersColl.where("isProvider", "==", true)
      .where("expoPushToken", "!=", "").get();
    const notificationPromises: Array<Promise<unknown> | null> = [];

    snap.forEach((doc) => {
      if (doc.id !== eventsSnap.data().consumer_id) {
        notificationPromises.push(sendPushNotification(
          doc.data().expoPushToken,
          "New Event Request",
          "Click to provide your space"
        ));
      }
      return null;
    });

    await Promise.all(notificationPromises.filter(Boolean));
    return null;
  });

export const notifyNewProvider = functions.firestore
  .document("/events/{eventId}")
  .onUpdate(async (change) => {
    const afterArr = change.after.data().interestedProviderIds;
    const beforeArr = change.before.data().interestedProviderIds;

    // If there's a new interested provider
    if (afterArr.length > beforeArr.length) {
      const consumerId = change.after.data().consumer_id;
      const userDoc = await db.collection("users").doc(consumerId).get();
      const consPushToken = userDoc.data()!.expoPushToken;

      return sendPushNotification(
        consPushToken,
        "New Provider Interested",
        "Click to accept"
      );
    }
    return null;
  });

export const notifyGuestArrive = functions.firestore
  .document("/events/{eventId}")
  .onUpdate(async (change) => {
    const afterArr = change.after.data().arrivedProviderSpaces;
    const beforeArr = change.before.data().arrivedProviderSpaces;

    if (afterArr.length > beforeArr.length) {
      const addedProviderId = addedArrayValue(beforeArr, afterArr)
        ?.replace(".1", "")
        .replace(".2", "");
      if (!addedProviderId) {
        return null;
      }
      const userDoc = await db.collection("users").doc(addedProviderId).get();
      const providerPushToken = userDoc.data()!.expoPushToken;

      return sendPushNotification(
        providerPushToken,
        "New Guest Arrival",
        "Click to view"
      );
    }
    return null;
  });

export const notifyGuestDepart = functions.firestore
  .document("/events/{eventId}")
  .onUpdate(async (change) => {
    const afterArr = change.after.data().departedProviderSpaces;
    const beforeArr = change.before.data().departedProviderSpaces;

    if (afterArr.length > beforeArr.length) {
      const addedProviderId = addedArrayValue(beforeArr, afterArr)
        ?.replace(".1", "")
        .replace(".2", "");
      if (!addedProviderId) {
        return null;
      }
      const userDoc = await db.collection("users").doc(addedProviderId).get();
      const providerPushToken = userDoc.data()!.expoPushToken;

      return sendPushNotification(
        providerPushToken,
        "One of your guests has departed",
        "Click to view"
      );
    }
    return null;
  });
