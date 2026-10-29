# xp-forms

## 1.0.0-beta.0

### Major Changes

- afda2d1: Migrate to Enonic XP 8.

### Minor Changes

- 374a7f5: Add support for headless frontends: a `formView` field on forms in Guillotine, with the JSON Schema of each page to validate against, and a `submit` API that validates and sends the form
- 347646a: Add support for Cloudflare Turnstile
- 347646a: Add separate section under site config for built-in-forms
- 4d0eda8: Validate forms against the JSON Schema made from their fields. A value must now be one of the field's options, a rule other than "required" is not checked on an optional field left empty, and a pattern can be written without slashes around it. Editors are warned about a pattern that is not a regular expression, flags after a pattern, and fields that share a name.
- 14b691d: Use CSS class names from Designsystemet instead of own classes

### Patch Changes

- fbb954e: Hold form submit until Cloudflare Turnstile has verified the user, and only verify the token on POST requests

## 0.4.1

### Patch Changes

- 6e81419: Add no-cache headers to formview

## 0.4.0

### Minor Changes

- a4fc820: Add from email to siteconfig
- 38ecf89: Add siteconfig to hide emailform from selection, make hidden_fields work

## 0.3.1

### Patch Changes

- 2cb866b: Add userkey to onsubmit event

## 0.3.0

### Minor Changes

- eb66145: Add honeypot option to forms
- 3ce070a: Select which page type should be shown as the first page

### Patch Changes

- 18878ff: Prevent view from crashing when values are missing. This enables rendering in preview mode, without crashing.

## 0.2.0

### Minor Changes

- 24969ae: Add default styles to application
- c9fbb54: Add error summary box
- f5d1139: Expose api to prepopulate forms with data
- 1a153b9: Add content type Form
- e350cc2: Add programatic validation against a json-schema
- c9fbb54: Add review page
- 1a153b9: Add part form-view
