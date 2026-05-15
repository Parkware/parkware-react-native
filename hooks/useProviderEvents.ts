import { useEffect, useState } from "react";
import { collection, doc, getDocs, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { DocDataPair, toEventPair } from "../types/events";
import { UserProfile } from "../types/users";

interface ProviderEventsState {
  acceptedEvents: DocDataPair[];
  openEvents: DocDataPair[];
  pendingEvents: DocDataPair[];
  deniedEventNames: string[];
  unwantedEventIds: string[];
  loading: boolean;
}

const isLiveEvent = (event: DocDataPair) => !event.doc.eventEnded;

export const useProviderEvents = (userId?: string): ProviderEventsState => {
  const [acceptedEvents, setAcceptedEvents] = useState<DocDataPair[]>([]);
  const [openEvents, setOpenEvents] = useState<DocDataPair[]>([]);
  const [pendingEvents, setPendingEvents] = useState<DocDataPair[]>([]);
  const [deniedEventNames, setDeniedEventNames] = useState<string[]>([]);
  const [unwantedEventIds, setUnwantedEventIds] = useState<string[]>([]);
  const [providerNeighborhood, setProviderNeighborhood] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      setUnwantedEventIds([]);
      return undefined;
    }

    const unsubscribe = onSnapshot(doc(db, "users", userId), (snapshot) => {
      const profile = snapshot.exists() ? (snapshot.data() as UserProfile) : {};
      setUnwantedEventIds(profile.unwantedEvents ?? []);
      setProviderNeighborhood(profile.neighborhood);
    });

    return unsubscribe;
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setAcceptedEvents([]);
      setPendingEvents([]);
      setOpenEvents([]);
      setDeniedEventNames([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);

    const acceptedQuery = query(collection(db, "events"), where("acceptedProviderIds", "array-contains", userId));
    const pendingQuery = query(collection(db, "events"), where("interestedProviderIds", "array-contains", userId));
    const openQuery = query(collection(db, "events"), where("isOpen", "==", true));
    const deniedQuery = query(collection(db, "events"), where("unwantedProviders", "array-contains", userId));

    const unsubscribeAccepted = onSnapshot(acceptedQuery, (snapshot) => {
      setAcceptedEvents(snapshot.docs.map((eventSnapshot) => toEventPair(eventSnapshot.id, eventSnapshot.data())).filter(isLiveEvent));
      setLoading(false);
    });

    const unsubscribePending = onSnapshot(pendingQuery, (snapshot) => {
      const nextEvents = snapshot.docs
        .map((eventSnapshot) => toEventPair(eventSnapshot.id, eventSnapshot.data()))
        .filter((event) => isLiveEvent(event) && !event.doc.acceptedProviderIds.includes(userId));
      setPendingEvents(nextEvents);
      setLoading(false);
    });

    const unsubscribeOpen = onSnapshot(openQuery, (snapshot) => {
      const nextEvents = snapshot.docs
        .map((eventSnapshot) => toEventPair(eventSnapshot.id, eventSnapshot.data()))
        .filter(
          (event) =>
            isLiveEvent(event) &&
            event.doc.consumer_id !== userId &&
            !event.doc.unwantedProviders.includes(userId) &&
            !event.doc.acceptedProviderIds.includes(userId) &&
            !event.doc.interestedProviderIds.includes(userId) &&
            !unwantedEventIds.includes(event.id) &&
            (!providerNeighborhood || event.doc.neighborhood === providerNeighborhood),
        );

      setOpenEvents(nextEvents);
      setLoading(false);
    });

    getDocs(deniedQuery)
      .then((eventsSnap) => setDeniedEventNames(eventsSnap.docs.map((eventSnapshot) => eventSnapshot.data().eventName)))
      .catch(() => setDeniedEventNames([]));

    return () => {
      unsubscribeAccepted();
      unsubscribePending();
      unsubscribeOpen();
    };
  }, [providerNeighborhood, unwantedEventIds, userId]);

  return {
    acceptedEvents,
    deniedEventNames,
    loading,
    openEvents,
    pendingEvents,
    unwantedEventIds,
  };
};
