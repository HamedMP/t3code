import { ExternalLinkIcon } from "lucide-react";
import { useState } from "react";
import {
  MATRIX_OS_SETUP_ACTION_LABEL,
  MATRIX_OS_SETUP_DESCRIPTION,
} from "@t3tools/shared/matrixOsConnect";

import { readLocalApi } from "../../localApi";
import { Button } from "../ui/button";
import { stackedThreadToast, toastManager } from "../ui/toast";
import { openMatrixOsConnect } from "./openMatrixOsConnect";
import { SettingsRow } from "./settingsLayout";

export function MatrixOsConnectRow() {
  const [isOpening, setIsOpening] = useState(false);

  const handleConnect = async () => {
    const api = readLocalApi();
    if (!api) {
      toastManager.add({ type: "error", title: "Link opening is unavailable." });
      return;
    }

    setIsOpening(true);
    try {
      await openMatrixOsConnect(api.shell);
    } catch (error) {
      console.error("Failed to open the Matrix Server install guide.", error);
      toastManager.add(
        stackedThreadToast({
          type: "error",
          title: "Unable to open the install guide",
          description:
            "Open the Matrix Server guide from this repository and follow its pairing steps.",
        }),
      );
    } finally {
      setIsOpening(false);
    }
  };

  return (
    <SettingsRow
      title="Matrix Server"
      description={MATRIX_OS_SETUP_DESCRIPTION}
      control={
        <Button
          size="sm"
          variant="outline"
          disabled={isOpening}
          onClick={() => void handleConnect()}
        >
          <ExternalLinkIcon aria-hidden className="size-3.5" />
          {isOpening ? "Opening…" : MATRIX_OS_SETUP_ACTION_LABEL}
        </Button>
      }
    />
  );
}
