import { listener } from "/lib/xp/event";

type CustomFormSubmitEvent = {
  data: {
    formId: string;
    values: Record<string, string[] | string>;
  };
};

listener<CustomFormSubmitEvent>({
  type: "custom.form.submit",
  callback: (event) => {
    log.info("Form submission =>" + JSON.stringify(event.data));
  },
  localOnly: true,
});
