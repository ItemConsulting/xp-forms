package no.item.forms.validator;

import com.enonic.xp.script.ScriptValue;
import no.item.forms.record.ExtensionResult;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * What a form type expects of a form, from the JSON Schema it registers.
 *
 * @param required    The fields that must have "Validation: required" selected
 * @param properties  The keywords of each field the form type names, by the name of the field
 */
record FormTypeSchema(List<String> required, Map<String, Set<String>> properties) {
  /** Null for a form type that expects nothing of the form */
  static FormTypeSchema from(ExtensionResult extension) {
    ScriptValue value = extension.value();

    if (!value.isObject()) {
      return null;
    }

    Map<String, Object> formType = value.getMap();

    if (!(formType.get("jsonSchema") instanceof Map<?, ?> jsonSchema) || jsonSchema.isEmpty()) {
      return null;
    }

    List<String> required = new ArrayList<>();

    if (jsonSchema.get("required") instanceof List<?> list) {
      list.forEach(key -> required.add(String.valueOf(key)));
    }

    Map<String, Set<String>> properties = new LinkedHashMap<>();

    if (jsonSchema.get("properties") instanceof Map<?, ?> map) {
      map.forEach((key, property) -> {
        Set<String> keywords = new LinkedHashSet<>();

        if (property instanceof Map<?, ?> keywordMap) {
          keywordMap.keySet().forEach(keyword -> keywords.add(String.valueOf(keyword)));
        }

        properties.put(String.valueOf(key), keywords);
      });
    }

    return new FormTypeSchema(required, properties);
  }
}
