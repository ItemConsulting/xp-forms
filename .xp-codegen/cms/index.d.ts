export type SiteConfig = XP.SiteConfig;

declare global {
  namespace XP {
    interface SiteConfig {
      /**
       * Include default styles
       */
      includeStyles: boolean;

      /**
       * Spam prevention
       */
      spamPrevention:
        | {
            /**
             * Selected
             */
            _selected: "turnstile";

            /**
             * Cloudflare turnstile
             */
            turnstile: import("./form-fragments").CloudflareTurnstile;
          }
        | {
            /**
             * Selected
             */
            _selected: "honeypot";

            /**
             * Honeypot
             */
            honeypot: {
              /**
               * Honeypot field id
               */
              honeypotFieldName?: string;
            };
          };

      /**
       * Built in form types
       */
      formTypes:
        | {
            /**
             * Selected
             */
            _selected: "email";

            /**
             * E-mail
             */
            email: {
              /**
               * Sender email address
               */
              formSubmissionSenderEmail?: string;

              /**
               * Receiver email address
               */
              formSubmissionReceiverEmail?: string;
            };
          };
    }
  }
}
