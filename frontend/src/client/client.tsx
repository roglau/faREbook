import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: 'http://localhost:7778/query', // Your Go GraphQL server URL
  cache: new InMemoryCache(),
});

export default client;
