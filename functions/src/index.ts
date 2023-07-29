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
      const newProviderSpaces: number =
        change.after.data().interestedProviders
          .find((proObj: DocumentData) =>
            proObj.id == addedProviderId
          ).providerSpaces;
      return db.collection("/events/").doc(eventId).update({
        accSpaceCount: FieldValue.increment(newProviderSpaces),
        isOpen: false,
      });
    }
    return null;
  });
