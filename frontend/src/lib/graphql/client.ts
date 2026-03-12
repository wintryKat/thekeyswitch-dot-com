import { GraphQLClient } from "graphql-request";

const INTERNAL_URL = process.env.GRAPHQL_INTERNAL_URL || "http://localhost:8080/graphql";
const PUBLIC_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost/graphql";

export function getServerClient(token?: string): GraphQLClient {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return new GraphQLClient(INTERNAL_URL, { headers });
}

export function getPublicUrl(): string {
  return PUBLIC_URL;
}
