# protractor-gremlins-plugin

Protractor plugin for automating with [clickup-gremlins](https://github.com/rlwhatley3/gremlins.js "Clickup Gremlins").

## Provides

  - An interface for interacting with [clickup-gremlins](https://github.com/rlwhatley3/gremlins.js "Clickup Gremlins") through Protractors browser object

  - Custom matcher for Gremlin error checking
    - toHaveGremlinErrors
  
  - Injection of Gremlins on test run, no need to include the gremlins in a script on your html

## Installation
```
  npm install protractor-gremlins-plugin --save-dev
```
### Setup

Add the protractor-gremlins package into the protractor.conf exported config
```
  plugins: [
    {
      package: 'protractor-gremlins-plugin'
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

gremlins.unleash().then(history => {
  // history provides browserLogs and gremlinLogs, both ordered by timestamp
  // history.gremlinErrors provides a correlation of 'SEVERE' level browserlogs with the 10 previous gremlins actions
});

```
