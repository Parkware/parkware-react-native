### Current Status:
#### 6/6/23
- master branch is the version where when a provider accepts a request, it is added onto a subcollection under each event. 
- in the develop-db branch, the interested_providers subcollection is added as another root collection which also holds the event id. 

#### 6/11/23
- when using the local emulator suite, open up a new terminal and run `npm run build:watch`. this will listen for changes and compile them from TS to JS. Then run `firebase emulators:start` to actually deploy the app locally. 


### Common Issues w/ Solutions
------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
#### Issue #1: typescript not compiling to javacript in a firebase cloud function directory
#### Solution #1: add `noEmit: false` to the function dir's `tsconfig.json` file. 
##### this means that ts will only be used to infer types and no output would be emitted. 
____________________________________________________________________________________________________________________________________________________________________________________________________________
