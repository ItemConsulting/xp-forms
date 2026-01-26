import { listener } from "/lib/xp/event";
import { handleEmailForm, type EmailFormData } from "/forms/forms";

listener<EmailFormData>({
  type: "custom.form.submit",
  callback: (event): void => {
    // For now we add ege here as we we have a custom form but we want the same handler
    if (event.data.integration?.id === "no.item.forms:email" || event.data.integration?.id === "no.ege.www:email") {
      handleEmailForm(event.data);
    }
  },
  localOnly: true, // "localOnly" is to prevent the callback from running on every node in cluster
});
