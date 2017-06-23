# protractor-gremlins-plugin

Protractor plugin for automating with [clickup-gremlins](https://github.com/rlwhatley3/gremlins.js "Clickup Gremlins").

## Provides

  - An interface for interacting with [clickup-gremlins](https://github.com/rlwhatley3/gremlins.js "Clickup Gremlins") through Protractors browser object
  
  - Log aggregation of Gremlins logs into localStorage
  
  - Custom matcher for Gremlin error checking
  
  - Injection of Gremlins on test run, no need to include the gremlins in a script on your html

## Installation
```
  npm install protractor-gremlins --save-dev
```
### Setup

Add the protractor-gremlins package into the protractor.conf exported config
```
  plugins: [
    {
      package: 'protractor-gremlins'
    }
  ],

```
Be sure to provide the config file an allScriptsTimeout of > 130 seconds or the tests will timeout before the Gremlins can finish running, this is the amount of time for a default test run, running higher iterations of Gremlins will require a greater time.
```
  allScriptsTimeout: 130 * 1000,
```

## API

The Gremlins object is available on Protractors browser object. All methods return a promise.

```
let gremlins = browser.Gremlins;

gremlins.unleash().then(finished => {
  gremlins.getLogs().then(gremlinLogs => {
    // do some stuff with the logs
  });
});

```
Be sure to reset the logs if you want to run multiple tests

```
afterAll((done) => {
  signupPage.resetGremlinLogs().then(() => {
    done();
  });
});
```
