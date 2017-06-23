
Gremlins = {

	setup: () => {
	},
	onPrepare: () => {
		browser.Gremlins = {
			init: () => {
        browser.hasGremlins = true;
        return browser.executeScript(() => {
          let script = document.createElement('script');

          window.gremlinsFinished = false;

          let gremlinLogs = {
            log: [],
            info: [],
            warn: [],
            error: []
          };

          window.localStorage.setItem('gremlinLogs', JSON.stringify(gremlinLogs));

          class Logg {
            constructor(key) {
              let logType = key
              return function(msg) {
                var logs = JSON.parse(window.localStorage.getItem('gremlinLogs'));

                msg.element && delete msg.element

                !msg.timestamp && (msg.timestamp = new Date().getTime())

                logs[logType] = logs[logType].concat([msg]);

                window.localStorage.setItem('gremlinLogs', JSON.stringify(logs));
              }
            }
          }

          let createGremLogger = function() {
            let hold = {};
            for(let key in gremlinLogs) {
              hold[key] = new Logg(key);
            }
            return hold;
          }

          window.GremlinsLogger = createGremLogger();

          script.onload = function() {
            window.gremlins;
          }

          script.src = "/node_modules/clickup-gremlins.js/gremlins.min.js";
          document.body.appendChild(script);

        });
      },
      unleash: (config = {}, hordeConfig = {}) => {
        browser.Gremlins.init();
        config = JSON.stringify(config);
        let excludedErrors = hordeConfig.excludeErrors || [];
        browser.executeScript(`javascript:
          window.gremlinsFinished = false;
          window.gremlins && window.gremlins.createHorde()
                              .logger(window.GremlinsLogger)
                              .unleash(${config}, function() {
                                return window.gremlinsFinished = true;
                              });
        `);
        return browser.driver.wait(() => {
          return browser.executeScript(() => {
            return window.gremlinsFinished;
          });
        }).then(finished => {
          let ret = {
            browserLogs: [],
            gremlinLogs: {},
            gremlinErrors: []
          };

          return browser.manage().logs().get('browser').then(browserLog => {
            ret.browserLogs = browserLog.sort((entry1, entry2) => entry1.timestamp - entry2.timestamp);
            return browser.Gremlins.getLogs().then(gremlinLogs => {
              ret.gremlinLogs = gremlinLogs;
              for(let key in ret.gremlinLogs) {
                ret.gremlinLogs[key].sort((e1, e2) => e1.timestamp - e2.timestamp);
              }
              ret.browserLogs.filter( entry => entry.level.name_ === 'SEVERE' && !excludedErrors.some(errorString => entry.message.includes(errorString)) ).forEach(browserLog => {
                let timeIndex = (ret.gremlinLogs.log.findIndex(lg => lg.timestamp > browserLog.timestamp) );
                let startIndex = timeIndex - 11;
                if(startIndex < 0) { startIndex = 0; }
                let previousActions = ret.gremlinLogs.log.slice(startIndex, timeIndex);
                let err = {
                  message: browserLog.message,
                  timestamp: browserLog.timestamp,
                  previousActions: previousActions,
                  lastAction: previousActions[ previousActions.length - 1 ]
                }
                ret.gremlinErrors.push(err);
              });
              return ret;
            });
          });
          // return ret;
        });
      },
      getLogs: () => {
        return browser.executeScript(() => {
          return JSON.parse(window.localStorage.getItem('gremlinLogs'));
        });
      },
      resetLogs: () => {
        return browser.executeScript(() => {
          let gremlinLogs = {
            log: [],
            info: [],
            warn: [],
            error: []
          };
          window.localStorage.setItem('gremlinLogs', JSON.stringify(gremlinLogs));
        });
      }
		}

    beforeAll(() => {
      let matchers = {
        toHaveGremlinErrors: () => {
          return {
            compare: (value) => {
              let filtered = value;
              let ret = {
                pass: filtered.length > 0,
                message: null
              }

              if(ret.pass) {
                let message = 'Gremlins errors found: '
                filtered.forEach(err => {
                  message += `\n${err.message}`
                });
                ret.message = message;
              } else {
                ret.message = 'No Gremlin errors found';
              }

              return ret;
            }
          }
        }
      }
      jasmine && jasmine.addMatchers(matchers)
    });
	},
  onPageLoad: (browser) => {
    if(!browser.hasGremlins) {
      browser.Gremlins.init();
    }
    return;
  },
  teardown: () => {
  }
}

module.exports = Gremlins;














