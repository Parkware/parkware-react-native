#### 6/11/23
- when using the local emulator suite, open up a new terminal and run `npm run build:watch`. this will listen for changes and compile them from TS to JS. Then run `firebase emulators:start` to actually deploy the app locally. 


### Common Issues w/ Solutions
------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
#### Issue #1: typescript not compiling to javacript in a firebase cloud function directory
#### Solution #1: add `noEmit: false` to the function dir's `tsconfig.json` file. 
##### this means that ts will only be used to infer types and no output would be emitted. 
____________________________________________________________________________________________________________________________________________________________________________________________________________

### Improvements
in `ChooseProviderView.tsx`, i'm getting the interested provider information that the user hasn't declined using a method that may not be very efficient since certain logic has to run during runtime:
```jsx
{eventData.doc.interestedProviders
  .filter((pro: DocumentData) => !unwantedPros.includes(pro.provider_id))
  .map((providerInfo: DocumentData) => (
  <View key={providerInfo.provider_id}>
```
i'm appending unwanted providers onto an array and checking for each map object if it's id is contained in this array. we tried using a state variable. however, there is a very mysterious error there. 

the addition of guests is extremely hardcoded and a provider can only support 2 guests right now. this will eventually be changed. 
___________________________________________________________________________________________________________________________________________________________________________________________________________
#### How stuff works
#### notifying if "here" or not. 
there are two different fields: `arrivedProviderSpaces` and `departedProviderSpaces`.

initially, both are empty. then the `arrivedProviderSpaces` field gets "unioned" w/ a provider id. then, once a guest clicks i left, that provider's id gets appended to `departedProviderSpaces` and the provider is notified. 

the provider's name and phone number is added to the `interestedProviders` map so that the provider can view their details. 


#### the main
an event is created and isOpen is set to true. sufficient provider spaces are reached when the `accSpaceCount` is >= than `requestedSpaces`, the event is then closed (`isOpen` is false). 
