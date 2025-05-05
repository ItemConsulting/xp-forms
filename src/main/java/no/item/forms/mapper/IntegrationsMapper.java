package no.item.forms.mapper;

import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.script.ScriptValue;
import com.enonic.xp.script.serializer.MapGenerator;
import com.enonic.xp.script.serializer.MapSerializable;
import no.item.forms.record.ExtensionResult;

import java.util.Map;

public final class IntegrationsMapper
  implements MapSerializable {
  private final ApplicationKey key;
  private final ScriptValue value;

  public IntegrationsMapper(final ExtensionResult res) {
    this.key = res.key();
    this.value = res.value();
  }

  @Override
  public void serialize(final MapGenerator gen) {

    if (this.value != null && this.value.isObject()) {
      serializeMap(gen, this.value, this.key.getName());
    }
  }

  public static void serializeMap(final MapGenerator gen, final ScriptValue val, final String keyName) {
    Map<?, ?> extensionObj = val.getMap();

    gen.value("id", keyName + ":" +extensionObj.get("id"));
    gen.value("displayName", extensionObj.get("displayName"));
    gen.value("description", extensionObj.get("description"));
    gen.value("application", keyName);
  }
}
