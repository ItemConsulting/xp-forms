package no.item.forms.mapper;

import com.enonic.xp.script.serializer.MapGenerator;
import com.enonic.xp.script.serializer.MapSerializable;
import no.item.forms.record.ExtensionResult;

import java.util.Map;

public final class IntegrationsMapper
  implements MapSerializable {
  private final ExtensionResult value;

  public IntegrationsMapper(final ExtensionResult value) {
    this.value = value;
  }

  @Override
  public void serialize(final MapGenerator gen) {
    if (this.value != null) {
      serializeMap(gen, this.value);
    }
  }

  public static void serializeMap(final MapGenerator gen, final ExtensionResult extension) {
    if (extension.value().isObject()) {
      Map<?, ?> extensionObj = extension.value().getMap();

      gen.value("id", extension.key().getName() + ":" +extensionObj.get("id"));
      gen.value("displayName", extensionObj.get("displayName"));
      gen.value("description", extensionObj.get("description"));
      gen.value("application", extension.key().getName());
    }
  }
}
