export type SpamPreventionConfig =
  | {
      type: "honeypot";
      honeypotFiledName: string;
    }
  | {
      type: "turnstile";
      turnstileSiteKey: string;
    }
  | {
      type: "none";
    };
