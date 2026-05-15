export interface UserProfile {
  name?: string;
  email?: string;
  address?: string;
  neighborhood?: string;
  phoneNum?: string;
  loggedAsProvider?: boolean;
  isProvider?: boolean;
  providerSpaces?: number;
  unwantedEvents?: string[];
  expoPushToken?: string;
}
