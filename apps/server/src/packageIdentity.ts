/** Public npm artifact emitted from the internally named `t3` workspace package. */
export const MATRIX_SERVER_NPM_PACKAGE = "matrix-server";

export interface MatrixServerPublishOptions {
  readonly access: string;
  readonly tag: string;
  readonly provenance: boolean;
  readonly dryRun: boolean;
}

export function createMatrixServerPublishArgs(
  options: MatrixServerPublishOptions,
): ReadonlyArray<string> {
  const args = [
    "publish",
    "--filter",
    MATRIX_SERVER_NPM_PACKAGE,
    "--access",
    options.access,
    "--tag",
    options.tag,
    "--no-git-checks",
  ];
  if (options.provenance) args.push("--provenance");
  if (options.dryRun) args.push("--dry-run");
  return args;
}
