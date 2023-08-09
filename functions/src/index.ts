// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
import * as functions from "firebase-functions";

// The Firebase Admin SDK to access Firestore.
import {initializeApp} from "firebase-admin/app";
import {DocumentData, FieldValue, getFirestore} from "firebase-admin/firestore";

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
