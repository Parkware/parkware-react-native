import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { DocDataPair, ProviderInfo, toEventPair } from "../types/events";

interface ConsumerEventsState {
  pendingEvents: DocDataPair[];
  completedEvents: DocDataPair[];
  loading: boolean;
}

const activeProviderDetails = (event: DocDataPair): ProviderInfo[] =>
  event.doc.interestedProviders.filter((provider) => event.doc.interestedProviderIds.includes(provider.id));

export const useConsumerEvents = (userId?: string): ConsumerEventsState => {
  const [pendingEvents, setPendingEvents] = useState<DocDataPair[]>([]);
  const [completedEvents, setCompletedEvents] = useState<DocDataPair[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      setPendingEvents([]);
      setCompletedEvents([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);

    const eventsQuery = query(collection(db, "events"), where("consumer_id", "==", userId));
    const unsubscribe = onSnapshot(
      eventsQuery,
      (snapshot) => {
        const nextPending: DocDataPair[] = [];
        const nextCompleted: DocDataPair[] = [];

        snapshot.docs.forEach((eventSnapshot) => {
          const event = toEventPair(eventSnapshot.id, eventSnapshot.data());
          const normalizedEvent = {
            ...event,
            doc: {
              ...event.doc,
              interestedProviders: activeProviderDetails(event),
            },
          };

          if (event.doc.eventEnded) {
            return;
          }

          if (event.doc.isOpen) {
            nextPending.push(normalizedEvent);
          } else {
            nextCompleted.push(normalizedEvent);
          }
        });

        setPendingEvents(nextPending);
        setCompletedEvents(nextCompleted);
        setLoading(false);
      },
      () => setLoading(false),
    );

    return unsubscribe;
  }, [userId]);

  return { pendingEvents, completedEvents, loading };
};
