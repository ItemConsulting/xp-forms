package no.item.forms.validator;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import com.enonic.xp.content.DataValidationError;
import com.enonic.xp.content.ValidationError;
import com.enonic.xp.data.PropertySet;
import com.enonic.xp.data.PropertyTree;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.Test;

class FormChecksTest {
  private static final FormTypeSchema EMAIL = new FormTypeSchema(
    List.of("name", "email"),
    Map.of("name", Set.of("type", "minLength"), "email", Set.of("type"), "subject", Set.of("type"))
  );

  @Test
  void reads_names_rules_and_paths_from_the_data() {
    PropertyTree data = new PropertyTree();
    PropertySet page = data.addSet("pages");
    input(page, "E-mail address", null, "validationRequired", "validationMinLength").getSet("properties")
      .addSet("validationMinLength").setLong("minLength", 3L);
    PropertySet hidden = page.addSet("fields");
    hidden.setString("_selected", "hidden");
    hidden.addSet("hidden").setString("name", "source");

    List<FormField> fields = FormField.read(data);

    assertEquals(2, fields.size());
    assertEquals("e-mail-address", fields.get(0).name());
    assertEquals(true, fields.get(0).required());
    assertEquals(Set.of("minLength"), fields.get(0).validations());
    assertEquals("pages.fields.input.name", fields.get(0).namePath().toString());
    assertEquals("pages.fields[1].hidden.name", fields.get(1).namePath().toString());
  }

  @Test
  void points_out_on_the_form_a_field_the_form_type_requires_but_the_form_lacks() {
    PropertyTree data = new PropertyTree();
    input(data.addSet("pages"), "Name", "name", "validationRequired");

    List<ValidationError> errors = FormChecks.check(FormField.read(data), EMAIL);

    // email is missing, name lacks its minimum length, and subject is missing
    assertEquals(List.of("requiredMissing", "optionalFieldMissing", "minLengthMissing"), names(errors));
    assertNull(pathOf(errors.get(0)));
    assertEquals(List.of("email"), errors.get(0).getArgs());
    assertNull(pathOf(errors.get(2)));
  }

  @Test
  void points_out_on_the_form_a_field_that_is_not_required() {
    PropertyTree data = new PropertyTree();
    PropertySet page = data.addSet("pages");
    input(page, "Name", "name", "validationRequired", "validationMinLength").getSet("properties")
      .addSet("validationMinLength").setLong("minLength", 2L);
    input(page, "Email", "email");
    input(page, "Subject", "subject");

    List<ValidationError> errors = FormChecks.check(FormField.read(data), EMAIL);

    assertEquals(List.of("requiredMissing"), names(errors));
    assertNull(pathOf(errors.get(0)));
  }

  @Test
  void points_out_invalid_patterns_ignored_flags_and_names_used_twice() {
    PropertyTree data = new PropertyTree();
    PropertySet page = data.addSet("pages");
    pattern(page, "a", "/[a-/");
    pattern(page, "b", "/abc/gs");
    pattern(page, "c", "/abc/gim");
    pattern(page, "b", "abc");

    List<ValidationError> errors = FormChecks.check(FormField.read(data), null);

    assertEquals(List.of("patternInvalid", "patternFlagsIgnored", "duplicateName", "duplicateName"), names(errors));
    assertEquals("pages.fields.input.properties.validationPattern.regexString", pathOf(errors.get(0)));
    assertEquals(List.of("b", "s"), errors.get(1).getArgs());
    assertEquals("pages.fields[3].input.name", pathOf(errors.get(3)));
  }

  @Test
  void reads_patterns_the_way_the_schema_does() {
    assertEquals(new PatternSyntax.Parsed("^\\d+$", "i"), PatternSyntax.parse("/^\\d+$/i"));
    assertEquals(new PatternSyntax.Parsed("/kontakt/oss", ""), PatternSyntax.parse("/kontakt/oss"));
    assertEquals(new PatternSyntax.Parsed("/a/ii", ""), PatternSyntax.parse("/a/ii"));
    assertNull(PatternSyntax.parse(""));
    assertEquals("sy", PatternSyntax.getIgnoredFlags("gimsy"));
  }

  private static PropertySet input(PropertySet page, String label, String name, String... selected) {
    PropertySet field = page.addSet("fields");
    field.setString("_selected", "input");
    PropertySet input = field.addSet("input");
    input.setString("label", label);

    if (name != null) {
      input.setString("name", name);
    }

    input.addSet("properties").addStrings("_selected", selected);

    return input;
  }

  private static void pattern(PropertySet page, String name, String regexString) {
    input(page, name, name, "validationPattern").getSet("properties")
      .addSet("validationPattern").setString("regexString", regexString);
  }

  private static List<String> names(List<ValidationError> errors) {
    return errors.stream().map(error -> error.getI18n().replace("adminValidation.", "")).toList();
  }

  private static String pathOf(ValidationError error) {
    return error instanceof DataValidationError dataError ? dataError.getPropertyPath().toString() : null;
  }
}
