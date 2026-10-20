package no.item.forms.mapper;

import com.enonic.xp.script.serializer.MapGenerator;
import com.enonic.xp.script.serializer.MapSerializable;
import no.item.forms.record.ExtensionResult;

/**
 * A form type as the integration a form is sent to, along with the JSON Schema it expects a form to
 * have, from one run of its extension.
 */
public final class FormTypeMapper implements MapSerializable {
  private final ExtensionResult extension;

  public FormTypeMapper(final ExtensionResult extension) {
    this.extension = extension;
  }

  @Override
  public void serialize(final MapGenerator gen) {
    if (this.extension != null && this.extension.value().isObject()) {
      gen.map("integration");
      new IntegrationsMapper(this.extension).serialize(gen);
      gen.end();

      gen.map("jsonSchema");
      new JsonSchemaMapper(this.extension).serialize(gen);
      gen.end();
    }
  }
}
