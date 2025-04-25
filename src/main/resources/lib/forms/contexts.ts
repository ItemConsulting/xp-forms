import { run, type ContextParams } from "/lib/xp/context";

export function runOnDraftAsAdmin<T>(f: () => T, params: Partial<ContextParams> = {}): T {
  return run(
    {
      branch: "draft",
      principals: ["role:system.admin"],
      user: {
        login: "su",
        idProvider: "system",
      },
      ...params,
    },
    f,
  );
}
