/**
 * @flow
 */

'use strict';

var PLApp = require('PLApp');
var React = require('React');

var { Provider } = require('react-redux');
var configureStore = require('./store/configureStore');

function setup(): ReactClass<{}> {
  console.disableYellowBox = true;

  class Root extends React.Component {
    state: {
      isLoading: boolean;
      store: any;
    };

    constructor() {
      super();
      this.state = {
        isLoading: true,
        store: configureStore(() => this.setState({ isLoading: false })),
      };
    }
    render() {
      if (this.state.isLoading) {
        return null;
      }
      return (
        <Provider store={this.state.store}>
          <PLApp />
        </Provider>
      );
    }
  }

  return Root;
}

global.LOG = (...args) => {
  console.log('/------------------------------\\');
  console.log(...args);
  console.log('\\------------------------------/');
  return args[args.length - 1];
};

global.WARN = (...args) => {
  console.warn('/------------------------------\\');
  console.warn(...args);
  console.warn('\\------------------------------/');
  return args[args.length - 1];
};

global.ALERT = arg => {
  try {
    alert(JSON.stringify(arg, null, 2));
  } catch(e) {}
};

module.exports = setup;
