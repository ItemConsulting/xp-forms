package no.item.forms.validator;

import com.enonic.xp.data.PropertyPath;
import com.enonic.xp.data.PropertySet;
import com.enonic.xp.data.PropertyTree;
import com.enonic.xp.name.NamePrettyfier;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * A field of a form, as its data is saved, reduced to what the form is validated by: its name, and
 * the rules the editor set on it.
 *
 * @param path         Where the field's option is in the data, as "pages[0].fields[1].input"
 * @param type         The chosen option: input, textarea, select, radiobuttons, checkboxes or hidden
 * @param name         The name its value is sent under, made from the label when it has none
 * @param required     Whether "Validation: required" is selected
 * @param validations  The rules that are checked, by their keyword in JSON Schema: minLength,
 *                     maxLength, pattern, minItems and maxItems
 * @param regexString  The pattern as the editor wrote it, when "Validation: pattern" is selected
 */
record FormField(
  PropertyPath path,
  String type,
  String name,
  boolean required,
  Set<String> validations,
  String regexString
) {
  /*
    Where a problem with the field is shown. Content Studio shows an error on a text input, but not
    on an option set, such as the one the rules of a field are selected in.
  */
  PropertyPath namePath() {
    return PropertyPath.from(path, "name");
  }

  PropertyPath patternPath() {
    return PropertyPath.from(PropertyPath.from(PropertyPath.from(path, "properties"), "validationPattern"), "regexString");
  }

  /** Every field on every page, in order */
  static List<FormField> read(PropertyTree data) {
    List<FormField> fields = new ArrayList<>();
    int pageIndex = 0;

    for (PropertySet page : data.getSets("pages")) {
      int fieldIndex = 0;

      for (PropertySet field : page.getSets("fields")) {
        String type = field.getString("_selected");
        PropertySet option = type != null ? field.getSet(type) : null;

        if (option != null) {
          PropertyPath path = PropertyPath.from(
            PropertyPath.Element.from("pages", pageIndex),
            PropertyPath.Element.from("fields", fieldIndex),
            PropertyPath.Element.from(type)
          );
          fields.add(read(path, type, option));
        }

        fieldIndex++;
      }

      pageIndex++;
    }

    return fields;
  }

  private static FormField read(PropertyPath path, String type, PropertySet option) {
    PropertySet properties = option.getSet("properties");
    Set<String> selected = new LinkedHashSet<>();

    if (properties != null) {
      properties.getStrings("_selected").forEach(selected::add);
    }

    Set<String> validations = new LinkedHashSet<>();
    String regexString = null;

    switch (type) {
      case "input", "textarea" -> {
        addIfSet(validations, "minLength", selected.contains("validationMinLength"), properties, "validationMinLength.minLength");
        addIfSet(validations, "maxLength", selected.contains("validationMaxLength"), properties, "validationMaxLength.maxLength");

        if (selected.contains("validationPattern")) {
          regexString = properties.getString("validationPattern.regexString");
          PatternSyntax.Parsed pattern = PatternSyntax.parse(regexString);

          // A pattern that is not a regular expression is left out of the schema
          if (pattern != null && PatternSyntax.isValid(pattern.source())) {
            validations.add("pattern");
          }
        }
      }
      case "checkboxes" -> {
        addIfSet(validations, "minItems", selected.contains("validationMinItems"), properties, "validationMinItems.minItems");
        addIfSet(validations, "maxItems", selected.contains("validationMaxItems"), properties, "validationMaxItems.maxItems");
      }
      default -> {
        // Select and radio buttons only have "required", and a hidden field has no rules
      }
    }

    return new FormField(
      path,
      type,
      getName(option),
      !"hidden".equals(type) && selected.contains("validationRequired"),
      validations,
      regexString
    );
  }

  // A rule is only checked when it is selected and has a value other than 0
  private static void addIfSet(Set<String> validations, String keyword, boolean selected, PropertySet properties, String path) {
    Long value = selected ? properties.getLong(path) : null;

    if (value != null && value != 0) {
      validations.add(keyword);
    }
  }

  // The same name as sanitize() in lib-common gives the label
  private static String getName(PropertySet option) {
    String name = option.getString("name");

    if (name != null) {
      return name;
    }

    String label = option.getString("label");

    return label == null || label.isEmpty() ? "" : NamePrettyfier.create(label);
  }
}
