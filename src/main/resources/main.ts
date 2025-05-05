import { listener } from "/lib/xp/event";
import { handleEmailForm, type EmailFormData } from "/forms/forms";

listener<EmailFormData>({
  type: "custom.form.submit",
  callback: (event): void => {
    if (event.data.integration?.id === "no.item.forms:email") {
      handleEmailForm(event.data);
    }
  },
  localOnly: true, // "localOnly" is to prevent the callback from running on every node in cluster
});
