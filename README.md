# Forms

## Usage

You can add an event listener to your applications _main.ts_ file to handle form submissions. 

```typescript
import { listener } from "/lib/xp/event";

type CustomFormSubmitEvent = {
  data: {
    formId: string;
    values: Record<string, string | string[]>;
  };
};

listener<CustomFormSubmitEvent>({
  type: "custom.form.submit",
  callback: (event) => {
    // send email or do something else with `event.data.values`
  },
  localOnly: true,
});
```
## Built in email form handler

You need to configure _no.item.forms.cfg_ with the following config to indicate where emails should be sent.

```ini
emailReceiver=me@mycompany.com
```
