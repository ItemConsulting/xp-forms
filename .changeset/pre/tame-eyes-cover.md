---
"xp-forms": minor
---

Validate forms against the JSON Schema made from their fields. A value must now be one of the field's options, a rule other than "required" is not checked on an optional field left empty, and a pattern can be written without slashes around it. Editors are warned about a pattern that is not a regular expression, flags after a pattern, and fields that share a name.
