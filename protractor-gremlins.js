
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
      unleash: (config = {}) => {
        config = JSON.stringify(config);
        browser.executeScript(`javascript:
          window.gremlins && window.gremlins.createHorde()
                              .logger(window.GremlinsLogger)
                              .unleash(${config}, function() {
                                return window.gremlinsFinished = true;
                              });
        `);
        return browser.driver.wait(() => {
          return browser.executeScript(() => {
            return window.gremlinsFinished;
          })
        });
      },
      getLogs: () => {
        return browser.executeScript(() => {
          return JSON.parse(window.localStorage.getItem('gremlinLogs'));
        })
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
      jasmine.addMatchers(matchers);
      
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














