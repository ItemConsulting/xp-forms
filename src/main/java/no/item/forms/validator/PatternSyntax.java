package no.item.forms.validator;

import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.regex.PatternSyntaxException;

/** Reads a pattern the way json-schema.ts does, when it makes the schema the form is validated against */
final class PatternSyntax {
  private static final Pattern BETWEEN_SLASHES = Pattern.compile("^/(.+)/([dgimsuvy]*)$");

  // The flags that are checked. "g" does not change whether a pattern matches.
  private static final String CHECKED_FLAGS = "gim";

  private PatternSyntax() {}

  record Parsed(String source, String flags) {}

  /**
   * Either between slashes, with flags after it, as in "/^\d+$/i", or the bare regular expression.
   * Only what can be flags of a JavaScript regular expression, each at most once, is read as flags,
   * so that "/kontakt/oss" is a bare pattern. Null when there is no pattern.
   */
  static Parsed parse(String regexString) {
    if (regexString == null || regexString.isEmpty()) {
      return null;
    }

    Matcher matcher = BETWEEN_SLASHES.matcher(regexString);

    return matcher.matches() && !hasRepeatedCharacter(matcher.group(2))
      ? new Parsed(matcher.group(1), matcher.group(2))
      : new Parsed(regexString, "");
  }

  /** The flags of a pattern that change whether it matches, but are not checked */
  static String getIgnoredFlags(String flags) {
    StringBuilder ignored = new StringBuilder();

    for (char flag : flags.toCharArray()) {
      if (CHECKED_FLAGS.indexOf(flag) == -1) {
        ignored.append(flag);
      }
    }

    return ignored.toString();
  }

  /**
   * Whether the pattern compiles. The form is validated with JavaScript's regular expressions, which
   * Java's are close to, but not the same as, so a rare pattern can be judged differently here.
   */
  static boolean isValid(String source) {
    try {
      Pattern.compile(source);
      return true;
    } catch (PatternSyntaxException e) {
      return false;
    }
  }

  private static boolean hasRepeatedCharacter(String value) {
    return value.chars().distinct().count() != value.length();
  }
}
