#### 6/11/23
- when using the local emulator suite, open up a new terminal and run `npm run build:watch`. this will listen for changes and compile them from TS to JS. Then run `firebase emulators:start` to actually deploy the app locally. 


### Common Issues w/ Solutions
------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
#### Issue #1: typescript not compiling to javacript in a firebase cloud function directory
#### Solution #1: add `noEmit: false` to the function dir's `tsconfig.json` file. 
##### this means that ts will only be used to infer types and no output would be emitted. 
____________________________________________________________________________________________________________________________________________________________________________________________________________

### Improvements
in `MultiProviderDetailsView.tsx`, i'm getting the interested provider information that the user hasn't declined using a method that may not be very efficient since certain logic has to run during runtime:
```jsx
{eventData.doc.interestedProviders
  .filter((pro: DocumentData) => !unwantedPros.includes(pro.provider_id))
  .map((providerInfo: DocumentData) => (
  <View key={providerInfo.provider_id}>
```
i'm appending unwanted providers onto an array and checking for each map object if it's id is contained in this array. we tried using a state variable. however, there is a very mysterious error there. 
