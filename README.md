# Forms

## Usage

> [!TIP]  
> A version of the review page – called the "Preview page" – can be displayed by appending `?page=0` to the url. 

### Listening for form submissions

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
### Registering a form type

By registering a JSON-schema that you expect the form to conform to you can help the editor remember which fields are
necessary to include in the form. 

In your application create a file _forms/forms.ts_ that exports the `extensions` function.

```javascript
const EMAIL_FORM_RESULT_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  title: "Contact email",
  type: "object",
  properties: {
    name: {
      type: "string",
      description: "Name",
      minLength: 3,
    },
    email: {
      type: "string",
      description: "Email",
    },
    subject: {
      type: "string",
      description: "Subject",
    },
  },
  required: ["name", "email", "subject"],
};

export function extensions(req) {
  return {
    id: "email",
    displayName: "My API-backed form type",
    description: "This is a form where the data will be sent to an API, and it needs a specific shape.",
    jsonSchema: EMAIL_FORM_RESULT_SCHEMA,
    values: () => {
      // You can use the http-client to fetch data from an API here and return it to be used in the form
      return {
        email: "this.is@my.email"
      };
    }
  };
}
```
