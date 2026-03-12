import { GraphQLClient } from "graphql-request";

const GRAPHQL_INTERNAL_URL = process.env.GRAPHQL_INTERNAL_URL;
const GRAPHQL_PUBLIC_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL;

function getGraphQLUrl(): string {
  if (typeof window === "undefined" && GRAPHQL_INTERNAL_URL) {
    return GRAPHQL_INTERNAL_URL;
  }

  if (GRAPHQL_PUBLIC_URL) {
    return GRAPHQL_PUBLIC_URL;
  }

  return "http://localhost:8080/graphql";
}

let serverClient: GraphQLClient | null = null;

export function getClient(): GraphQLClient {
  if (serverClient) {
    return serverClient;
  }

  serverClient = new GraphQLClient(getGraphQLUrl(), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return serverClient;
}

export function createClient(customHeaders?: Record<string, string>): GraphQLClient {
  return new GraphQLClient(getGraphQLUrl(), {
    headers: {
      "Content-Type": "application/json",
      ...customHeaders,
    },
  });
}
