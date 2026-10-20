# Forms

> [!TIP]
> A version of the review page – called the "Preview page" – can be displayed by appending `?page=0` to the url.

## Site configuration

### Spam prevention

You can choose between two types of spam prevention. [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) or a simple "honeypot".

 1. You can configure the `turnstileSiteKey` and `turnstileSecretKey` in the site configuration, or in the *no.item.forms.cfg* file under *XP_HOME/config*.
     ```ini
     # These testing keys will always succeed
     turnstileSiteKey=1x00000000000000000000BB
     turnstileSecretKey=1x0000000000000000000000000000000AA
     ``` 
 2. The `[name]` of the honeypot field in the HTML can be configured under the site configuration. The default value is `"website"`.

> [!TIP]
> See the [Turnstile documentation page](https://developers.cloudflare.com/turnstile/troubleshooting/testing/#test-sitekeys) for more test keys.

### Built in email form type

You can enable and configure the built-in "Email" form type under the site config. If you enable it, the following 
fields must be configured in the site config for the xp-forms app:

| Field                      | Description                                                                                                     |
|----------------------------|-----------------------------------------------------------------------------------------------------------------|
| **Sender email address**   | The "from" address used when sending form submission emails. Must be a whitelisted address on your mail server. |
| **Receiver email address** | The address form submissions are sent to.                                                                       |

> [!IMPORTANT]
> Both fields are required for email submissions to work. If either is missing, the form submission will fail with an error.

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

## Headless frontends

A frontend that renders the form itself, such as Next.js through Guillotine, reads the form from
`data` on `no_item_forms_Form`, validates each page against its `validationSchema`, and posts the
values to the `submit` API once the visitor sends the form.

`data` is the type Guillotine generates from the content type, with a few changes:

- **Each form fragment is an interface**, which the field types that use it implement:
  `no_item_forms_FieldPropsCommon` (label, name, help text and value), `no_item_forms_FieldPropsInput`,
  `no_item_forms_FieldPropsSelect`, `no_item_forms_FieldPropsCheckbox` and `no_item_forms_Options`.
  Where Guillotine would make a numbered copy of a fragment's types for each use, the fields share one
  type, such as `no_item_forms_FieldPropsInputProperties`.
- **`name` is never empty.** A field without a name gets one made from its label, the one its value is
  sent and validated under.
- **Texts left empty are filled in** with the defaults, in the form's language: the submit button of
  each page, and the title and submit button of the review page.
- **Options missing a text or value are left out.**
- **Each page has a `validationSchema`**, and the form itself has `submitUrl` and `spamPrevention`.

```graphql
query ($path: ID!) {
  guillotine {
    get(key: $path) {
      ... on no_item_forms_Form {
        _id
        submitUrl
        spamPrevention { type turnstileSiteKey honeypotFieldName }
        data {
          pages {
            title
            text { processedHtml }
            submitButtonText
            validationSchema
            fields {
              _selected
              input { ...FieldPropsCommon ...FieldPropsInput }
              textarea { ...FieldPropsCommon ...FieldPropsInput rows cols }
              select { ...FieldPropsCommon ...Options }
              radiobuttons { ...FieldPropsCommon ...Options }
              checkboxes { label name helpText { processedHtml } value ...Options }
              hidden { name value }
            }
          }
          reviewPage {
            _selected
            showReviewPage { title submitButtonText }
          }
          successPageSections { text { processedHtml } }
        }
      }
    }
  }
}

fragment FieldPropsCommon on no_item_forms_FieldPropsCommon {
  label
  name
  helpText { processedHtml }
  value
}

fragment FieldPropsInput on no_item_forms_FieldPropsInput {
  properties {
    placeholder { placeholder }
    inputMode { inputmode }
    autocomplete { autocomplete }
  }
}

fragment Options on no_item_forms_Options {
  options { text value }
}
```

A field is required when `validationRequired` is among the `_selected` of its `properties`. The
validation rules themselves are easier to read from `validationSchema`.

### Validating a page

`validationSchema` is a [JSON Schema](https://json-schema.org/draft/2020-12) (draft 2020-12) of the
values on the page, made from the rules the editor set on its fields. It is the same schema the
`submit` API and the `form-view` part validate against.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 2,
      "errorMessages": { "required": "Enter your name", "minLength": "Enter an answer with at least 2 characters" }
    },
    "interests": {
      "type": "array",
      "items": { "type": "string", "enum": ["a", "b", "c"] },
      "maxItems": 2,
      "errorMessages": { "maxItems": "Select at most 2 items", "enum": "Choose one of the options" }
    }
  },
  "required": ["name"]
}
```

1. **Normalize the values first.** A field that holds one value is a string: the first non-empty value
   sent. Checkboxes are an array of the non-empty values. A field without a value is left out, which
   is what makes `required` mean "not empty", and keeps the other rules off an optional field left empty.
2. **Take the messages from `errorMessages`** on the field, keyed by the keyword of the rule that
   failed. The message for `required` is there too, although the keyword is on the object. The
   messages are in the form's language, with the editor's own where they wrote one.
3. **Run patterns without the "u" flag**, the way XP's script engine does. With
   [Ajv](https://ajv.js.org):

   ```typescript
   import Ajv2020 from "ajv/dist/2020";

   const ajv = new Ajv2020({ allErrors: true, unicodeRegExp: false });
   ajv.addKeyword("errorMessages");
   ```

A pattern that is not a regular expression is left out of the schema. Content Studio points it out to
the editor when the form is saved, along with other flags after a pattern, which are not checked,
fields that share a name, and fields the form type expects but the form lacks. A form with any of
these cannot be published.

### Sending the form

Post the values of **every page** to `submitUrl` as form parameters
(`application/x-www-form-urlencoded`). The URL ends in the form's `_id`, so the values are all that
is sent. The API validates them against the schema of every page, then sends the same `form.submit`
event as the `form-view` part.

| Response                                     | Meaning                                    |
|----------------------------------------------|--------------------------------------------|
| `200 {"status": "submitted"}`                | The form has been sent.                    |
| `400 {"status": "invalid", "errors": {...}}` | Validation messages, keyed by field name.  |

The spam prevention chosen in the site configuration applies to the `submit` API too. `spamPrevention`
on the form tells the frontend which one, with what it needs to render it:

- **Turnstile**: render the [Turnstile widget](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/)
  with `turnstileSiteKey`, and send its token along as `cf-turnstile-response`. A missing or
  failed token gives `400 {"status": "invalid"}` with the message under `cf-turnstile-response`, and
  the frontend needs a new token from the widget before it tries again.
- **Honeypot**: render a field named `honeypotFieldName`, hidden from people, and send it along
  empty. A value in it is taken as a bot. The API answers `200 {"status": "submitted"}`, but the form is not sent.
