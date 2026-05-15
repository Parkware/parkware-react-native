import { DocumentData, Timestamp } from "firebase/firestore";

export interface ProviderInfo {
  id: string;
  name: string;
  address: string;
  providerSpaces: number;
  guestInfo?: DocumentData[];
  notes?: string;
}

export interface EventDoc {
  eventName: string;
  consumer_id: string;
  name?: string;
  address: string;
  startTime: Timestamp;
  endTime: Timestamp;
  acceptedProviderIds: string[];
  interestedProviders: ProviderInfo[];
  interestedProviderIds: string[];
  arrivedProviderSpaces: string[];
  departedProviderSpaces: string[];
  unwantedProviders: string[];
  requestedSpaces: number;
  accSpaceCount: number;
  isOpen: boolean;
  eventEnded?: boolean;
  [key: string]: unknown;
}

export interface DocDataPair<TDoc = EventDoc> {
  id: string;
  doc: TDoc;
}

export type EventStatus = "open" | "pending" | "accepted" | "ended";

export const toEventPair = (id: string, data: DocumentData): DocDataPair => ({
  id,
  doc: data as EventDoc,
});
