export interface UserProfile {
  name?: string;
  email?: string;
  address?: string;
  phoneNum?: string;
  loggedAsProvider?: boolean;
  isProvider?: boolean;
  providerSpaces?: number;
  unwantedEvents?: string[];
  expoPushToken?: string;
}
