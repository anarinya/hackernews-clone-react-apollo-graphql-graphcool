import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { 
  SubscriptionClient, 
  addGraphQLSubscriptions 
} from 'subscriptions-transport-ws';

import { 
  ApolloProvider, 
  createNetworkInterface, 
  ApolloClient 
} from 'react-apollo';

import { App } from './components';
import registerServiceWorker from './registerServiceWorker';
import { GC_AUTH_TOKEN } from './constants';
import { GRAPHCOOL_SIMPLE_API, GRAPHCOOL_SUB_API } from './constants/dev.env';
import './styles/index.css';

console.log(GRAPHCOOL_SIMPLE_API);
const networkInterface = createNetworkInterface({
  uri: GRAPHCOOL_SIMPLE_API
});

// Instantiate client with sub endpoint, auth websock conn with token
const wsClient = new SubscriptionClient(
  GRAPHCOOL_SUB_API, {
  reconnect: true,
  connectionParams: {
    authToken: localStorage.getItem(GC_AUTH_TOKEN)
  }
});

const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(
  networkInterface,
  wsClient
);

networkInterface.use([{
  applyMiddleware(req, next) {
    if (!req.options.headers) {
      req.options.headers = {};
    }

    const token = localStorage.getItem(GC_AUTH_TOKEN);
    req.options.headers.authorization = token ? `Bearer ${token}` : null;
    next();
  }
}]);

const client = new ApolloClient({ 
  networkInterface: networkInterfaceWithSubscriptions 
});

ReactDOM.render(
  <BrowserRouter>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </BrowserRouter>, 
  document.getElementById('root')
);

registerServiceWorker();
