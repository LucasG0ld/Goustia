import { errorFromHttpResponse } from "./errors";

export type AiFetch = typeof fetch;

export async function fetchJson(
  provider: string,
  fetchImplementation: AiFetch,
  url: string,
  init: RequestInit,
): Promise<{ body: unknown; headers: Headers }> {
  const response = await fetchImplementation(url, init);
  if (!response.ok) {
    throw errorFromHttpResponse(
      provider,
      response.status,
      response.headers.get("retry-after"),
    );
  }
  return { body: await response.json(), headers: response.headers };
}

export function decodeBase64(value: string): Uint8Array {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}
