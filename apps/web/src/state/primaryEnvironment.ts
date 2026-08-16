import { Atom } from "effect/unstable/reactivity";
import {
  resolveDefaultChatEnvironmentId,
  resolvePrimaryEnvironmentId,
} from "@t3tools/client-runtime/connection";

export {
  isMatrixOsEnvironment,
  resolveDefaultChatEnvironmentId,
  resolvePrimaryEnvironmentId,
  selectDefaultChatProject,
} from "@t3tools/client-runtime/connection";

import { environmentCatalog } from "../connection/catalog";

export const primaryEnvironmentIdAtom = Atom.make((get) => {
  return resolvePrimaryEnvironmentId(get(environmentCatalog.catalogValueAtom).entries);
}).pipe(Atom.withLabel("web-primary-environment-id"));

export const defaultChatEnvironmentIdAtom = Atom.make((get) => {
  return resolveDefaultChatEnvironmentId(get(environmentCatalog.catalogValueAtom).entries);
}).pipe(Atom.withLabel("web-default-chat-environment-id"));
