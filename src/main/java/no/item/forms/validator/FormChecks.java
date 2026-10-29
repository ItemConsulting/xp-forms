package no.item.forms.validator;

import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.content.ValidationError;
import com.enonic.xp.content.ValidationErrorCode;
import com.enonic.xp.data.PropertyPath;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/*
  The problems with a form that the editor is told of when it is saved: the fields its form type
  expects but it lacks, and rules on its fields that are not checked the way the editor wrote them.

  How a form differs from its form type is given on the form, since it is fixed in the option set
  the rules of a field are selected in, which Content Studio does not show an error on. The other
  problems are given on the field they are fixed in.

  Each is an i18n key in phrases.properties, under adminValidation, which Content Studio shows in
  the editor's language.
*/
final class FormChecks {
  static final ApplicationKey APPLICATION_KEY = ApplicationKey.from("no.item.forms");

  // The rules a form type can expect a field to have, in the order they are pointed out
  private static final List<String> VALIDATION_TYPES = List.of("minLength", "maxLength", "minItems", "maxItems", "pattern");

  private FormChecks() {}

  /** The problems with the fields, and with how they match the form type when there is one */
  static List<ValidationError> check(List<FormField> fields, FormTypeSchema formType) {
    List<ValidationError> errors = new ArrayList<>();

    if (formType != null) {
      compareWithFormType(fields, formType, errors);
    }

    checkPatterns(fields, errors);
    checkDuplicateNames(fields, errors);

    return errors;
  }

  private static void compareWithFormType(List<FormField> fields, FormTypeSchema formType, List<ValidationError> errors) {
    // The value of a field overwrites that of an earlier field with the same name, so it is the last
    // field with a name that counts
    Map<String, FormField> fieldsByName = new LinkedHashMap<>();
    Set<String> required = new LinkedHashSet<>();

    for (FormField field : fields) {
      fieldsByName.put(field.name(), field);

      if (field.required()) {
        required.add(field.name());
      }
    }

    for (String name : formType.required()) {
      if (!required.contains(name)) {
        errors.add(onForm("requiredMissing", name));
      }
    }

    // A field the form type has as optional, which the form lacks, or makes required
    for (String name : formType.properties().keySet()) {
      if (!formType.required().contains(name) && (!fieldsByName.containsKey(name) || required.contains(name))) {
        errors.add(onForm("optionalFieldMissing", name));
      }
    }

    formType.properties().forEach((name, keywords) -> {
      FormField field = fieldsByName.get(name);

      if (field == null) {
        return;
      }

      for (String keyword : keywords) {
        if (VALIDATION_TYPES.contains(keyword) && !field.validations().contains(keyword)) {
          errors.add(onForm(keyword + "Missing", name));
        }
      }
    });
  }

  private static void checkPatterns(List<FormField> fields, List<ValidationError> errors) {
    for (FormField field : fields) {
      PatternSyntax.Parsed pattern = PatternSyntax.parse(field.regexString());

      if (pattern == null) {
        continue;
      }

      if (!PatternSyntax.isValid(pattern.source())) {
        errors.add(onField(field.patternPath(), "patternInvalid", field.name(), field.regexString()));
        continue;
      }

      String ignoredFlags = PatternSyntax.getIgnoredFlags(pattern.flags());

      if (!ignoredFlags.isEmpty()) {
        errors.add(onField(field.patternPath(), "patternFlagsIgnored", field.name(), ignoredFlags));
      }
    }
  }

  // Given on each of the fields that share a name
  private static void checkDuplicateNames(List<FormField> fields, List<ValidationError> errors) {
    Map<String, Integer> counts = new LinkedHashMap<>();
    fields.forEach(field -> counts.merge(field.name(), 1, Integer::sum));

    for (FormField field : fields) {
      if (counts.get(field.name()) > 1) {
        errors.add(onField(field.namePath(), "duplicateName", field.name()));
      }
    }
  }

  private static ValidationError onForm(String name, Object... args) {
    return ValidationError.generalError(code(name)).i18n(i18n(name)).args(args).build();
  }

  private static ValidationError onField(PropertyPath path, String name, Object... args) {
    return ValidationError.dataError(code(name), path).i18n(i18n(name)).args(args).build();
  }

  private static ValidationErrorCode code(String name) {
    return ValidationErrorCode.from(APPLICATION_KEY, "form." + name);
  }

  private static String i18n(String name) {
    return "adminValidation." + name;
  }
}
