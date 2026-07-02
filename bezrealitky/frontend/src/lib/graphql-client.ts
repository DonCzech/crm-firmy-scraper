import { GraphQLClient } from 'graphql-request';

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/graphql').trim();

export function getGqlClient(token?: string) {
  return new GraphQLClient(API_URL, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

// Client-side singleton that reads token from store
let _client: GraphQLClient | null = null;

export function getClient(): GraphQLClient {
  const token = typeof window !== 'undefined'
    ? (localStorage.getItem('accessToken') ?? undefined)
    : undefined;

  if (!_client || token) {
    _client = new GraphQLClient(API_URL, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }
  return _client;
}

export function resetClient() {
  _client = null;
}
