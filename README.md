### core features
* real-time updates (firebase firestore)
* safe authentication (firebase auth)
* push notifications (android and iOS)
* cloud functions for server-side code
* react navigation for a clean UI
* responsive pages

### usage
when using the local emulator suite, open up a new terminal and run `npm run build:watch`. this will listen for changes and compile them from TS to JS. Then run `firebase emulators:start` to actually deploy the app locally. 

### process
an event is created and isOpen is set to true. sufficient provider spaces are reached when the `accSpaceCount` is >= than `requestedSpaces`, the event is then closed (`isOpen` is false). 
