import { addDoc, arrayRemove, arrayUnion, collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { User } from "firebase/auth";
import { db } from "../firebaseConfig";
import { DocDataPair, ProviderInfo } from "../types/events";

interface CreateEventInput {
  user: User;
  eventName: string;
  address: string;
  startTime: Date;
  endTime: Date;
  requestedSpaces: number;
}

export const createEventRequest = async ({
  user,
  eventName,
  address,
  startTime,
  endTime,
  requestedSpaces,
}: CreateEventInput) => {
  const userSnap = await getDoc(doc(db, "users", user.uid));
  if (!userSnap.exists()) {
    return undefined;
  }

  const event = await addDoc(collection(db, "events"), {
    eventName,
    consumer_id: user.uid,
    name: userSnap.data().name,
    address,
    startTime,
    endTime,
    acceptedProviderIds: [],
    interestedProviders: [],
    interestedProviderIds: [],
    arrivedProviderSpaces: [],
    departedProviderSpaces: [],
    unwantedProviders: [],
    requestedSpaces,
    accSpaceCount: 0,
    isOpen: true,
    eventEnded: false,
  });

  return event.id;
};

export const addProviderInterest = async (eventData: DocDataPair, providerId: string) => {
  const currUserSnap = await getDoc(doc(db, "users", providerId));
  if (!currUserSnap.exists()) {
    return;
  }

  await setDoc(
    doc(db, "events", eventData.id),
    {
      interestedProviders: arrayUnion({
        id: providerId,
        name: currUserSnap.data().name,
        address: currUserSnap.data().address,
        providerSpaces: currUserSnap.data().providerSpaces,
        guestInfo: [],
      }),
      interestedProviderIds: arrayUnion(providerId),
    },
    { merge: true },
  );
};

export const declineEventForProvider = async (eventId: string, providerId: string) => {
  await setDoc(doc(db, "users", providerId), { unwantedEvents: arrayUnion(eventId) }, { merge: true });
};

export const acceptProviderForEvent = async (eventData: DocDataPair, providerId: string) => {
  const acceptedProvider = eventData.doc.interestedProviders.find((provider) => provider.id === providerId);
  if (!acceptedProvider) {
    return;
  }

  const remainingProviders = eventData.doc.interestedProviders.filter((provider) => provider.id !== providerId);
  const remainingSpaces = eventData.doc.requestedSpaces - eventData.doc.accSpaceCount;
  const normalizedProvider: ProviderInfo = {
    ...acceptedProvider,
    providerSpaces: Math.min(acceptedProvider.providerSpaces, remainingSpaces),
  };

  await updateDoc(doc(db, "events", eventData.id), {
    acceptedProviderIds: arrayUnion(providerId),
    interestedProviders: [...remainingProviders, normalizedProvider],
  });
};

export const declineProviderForEvent = async (eventId: string, providerId: string, updatedProviders: ProviderInfo[]) => {
  await updateDoc(doc(db, "events", eventId), {
    interestedProviderIds: arrayRemove(providerId),
    interestedProviders: updatedProviders,
    unwantedProviders: arrayUnion(providerId),
  });
};
