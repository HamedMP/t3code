import { verifyDpopProof } from "@t3tools/shared/dpop";
import * as Crypto from "effect/Crypto";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as Encoding from "effect/Encoding";
import * as Option from "effect/Option";
import * as HttpServerRequest from "effect/unstable/http/HttpServerRequest";

import {
  ServerAuthDpopReplayKeyCalculationError,
  ServerAuthDpopReplayStateRecordError,
  ServerAuthInvalidCredentialError,
  type ServerAuthInternalError,
} from "./EnvironmentAuth.ts";
import * as ServerSecretStore from "./ServerSecretStore.ts";

export const mapDpopReplayStoreError = (
  error: ServerSecretStore.SecretStoreError,
): ServerAuthInvalidCredentialError | ServerAuthInternalError =>
  ServerSecretStore.isSecretAlreadyExistsError(error)
    ? new ServerAuthInvalidCredentialError({
        diagnostic: "DPoP proof replayed.",
        cause: error,
      })
    : new ServerAuthDpopReplayStateRecordError({
        cause: error,
      });

export function resolveDpopRequestUrl(input: {
  readonly localUrl: URL;
  readonly originalUrl: string;
  readonly pairingBaseUrl?: URL;
}): string | null {
  if (!input.pairingBaseUrl) return input.localUrl.href;
  if (
    !input.originalUrl.startsWith("/") ||
    input.originalUrl.startsWith("//") ||
    input.originalUrl.includes("\\") ||
    input.originalUrl.includes("#")
  ) {
    return null;
  }
  const requestTarget = new URL(input.originalUrl, "http://localhost");
  if (/^\/[a-z][a-z\d+.-]*:\/\//iu.test(requestTarget.pathname)) {
    return null;
  }
  const resolved = new URL(input.pairingBaseUrl);
  const basePath = resolved.pathname.endsWith("/") ? resolved.pathname : `${resolved.pathname}/`;
  resolved.pathname = `${basePath}${requestTarget.pathname.replace(/^\/+/, "")}`;
  resolved.search = requestTarget.search;
  resolved.hash = "";
  return resolved.href;
}

export const verifyRequestDpopProof = (input: {
  readonly request: HttpServerRequest.HttpServerRequest;
  readonly expectedThumbprint?: string;
  readonly expectedAccessToken?: string;
  readonly pairingBaseUrl?: URL;
}) =>
  Effect.gen(function* () {
    const proof = input.request.headers.dpop;
    const url = HttpServerRequest.toURL(input.request);
    if (Option.isNone(url)) {
      return yield* new ServerAuthInvalidCredentialError({
        diagnostic: "Invalid DPoP request URL.",
      });
    }
    const requestUrl = resolveDpopRequestUrl({
      localUrl: url.value,
      originalUrl: input.request.originalUrl,
      ...(input.pairingBaseUrl ? { pairingBaseUrl: input.pairingBaseUrl } : {}),
    });
    if (requestUrl === null) {
      return yield* new ServerAuthInvalidCredentialError({
        diagnostic: "Invalid DPoP request target.",
      });
    }
    const now = yield* DateTime.now;
    const result = verifyDpopProof({
      proof,
      method: input.request.method,
      url: requestUrl,
      nowEpochSeconds: Math.floor(now.epochMilliseconds / 1_000),
      ...(input.expectedThumbprint ? { expectedThumbprint: input.expectedThumbprint } : {}),
      ...(input.expectedAccessToken ? { expectedAccessToken: input.expectedAccessToken } : {}),
    });
    if (!result.ok) {
      return yield* new ServerAuthInvalidCredentialError({
        diagnostic: result.reason,
      });
    }
    const secretStore = yield* ServerSecretStore.ServerSecretStore;
    const replayKey = yield* Crypto.Crypto.pipe(
      Effect.flatMap((crypto) =>
        crypto.digest("SHA-256", new TextEncoder().encode(`${result.thumbprint}:${result.jti}`)),
      ),
      Effect.map(Encoding.encodeBase64Url),
      Effect.mapError(
        (cause) =>
          new ServerAuthDpopReplayKeyCalculationError({
            cause,
          }),
      ),
    );
    yield* secretStore
      .create(
        `dpop-proof-${replayKey}`,
        new TextEncoder().encode(
          [
            `thumbprint=${result.thumbprint}`,
            `jti=${result.jti}`,
            `iat=${result.iat}`,
            `consumedAt=${DateTime.formatIso(now)}`,
          ].join("\n"),
        ),
      )
      .pipe(
        Effect.catchIf(ServerSecretStore.isSecretStoreError, (error) =>
          Effect.fail(mapDpopReplayStoreError(error)),
        ),
      );
    return result.thumbprint;
  });
