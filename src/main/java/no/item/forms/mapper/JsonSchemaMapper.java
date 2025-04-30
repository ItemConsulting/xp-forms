package no.item.forms.mapper;

import com.enonic.xp.script.serializer.MapGenerator;
import com.enonic.xp.script.serializer.MapSerializable;
import no.item.forms.record.ExtensionResult;
import java.util.Map;

public final class JsonSchemaMapper implements MapSerializable {
  private static final String KEY_JSON_SCHEMA = "jsonSchema";

  private final ExtensionResult extension;

  public JsonSchemaMapper(final ExtensionResult extension) {
    this.extension = extension;
  }

  @Override
  public void serialize(final MapGenerator gen) {
    if (this.extension != null && this.extension.value().isObject()) {

      Map<?, ?> extensionObj = extension.value().getMap();

      if (extensionObj.containsKey(KEY_JSON_SCHEMA) && extensionObj.get(KEY_JSON_SCHEMA) instanceof Map) {
        for ( final Map.Entry<?, ?> entry : ((Map<?,?>) extensionObj.get(KEY_JSON_SCHEMA)).entrySet() )
        {
          MapMapper.serializeKeyValue( gen, entry.getKey().toString(), entry.getValue() );
        }
      }
    }
  }
}

