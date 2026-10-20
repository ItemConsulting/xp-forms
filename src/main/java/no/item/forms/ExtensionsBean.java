package no.item.forms;

import com.enonic.xp.app.ApplicationService;
import com.enonic.xp.content.ContentService;
import com.enonic.xp.portal.script.PortalScriptService;
import com.enonic.xp.resource.ResourceService;
import com.enonic.xp.script.ScriptValue;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;
import no.item.forms.mapper.FormTypeMapper;
import no.item.forms.mapper.IntegrationsMapper;
import no.item.forms.mapper.MapMapper;
import no.item.forms.record.ExtensionResult;

import java.util.Optional;
import java.util.stream.Collectors;

/** The form types for the scripts of this app. Each method takes the id of the form, or null. */
public class ExtensionsBean implements ScriptBean {
  private FormTypes formTypes;

  @Override
  public void initialize(final BeanContext context) {
    this.formTypes = new FormTypes(
      context.getService(ApplicationService.class),
      context.getService(ResourceService.class),
      context.getService(PortalScriptService.class),
      context.getService(ContentService.class)
    );
  }

  public Object getIntegrations(String formId) {
    return formTypes.getAll(formId)
      .map(IntegrationsMapper::new)
      .collect(Collectors.toList());
  }

  // Runs only the app of the form type, once for both what it is and the schema it expects
  public Object getFormType(String id, String formId) {
    return formTypes.get(id, formId)
            .map(FormTypeMapper::new)
            .orElse(null);
  }

  public Object getPrepopulationValues(String id, String formId) {
    return formTypes.get(id, formId)
            .map(ExtensionResult::value)
            .filter(ScriptValue::isObject)
            .flatMap(obj -> executeMemberFunction(obj, "values"))
            .map(res -> new MapMapper(res.getMap()))
            .orElse(null);
  }

  private Optional<ScriptValue> executeMemberFunction(ScriptValue obj, String functionName) {
    ScriptValue func = obj.getMember(functionName);

    if (func != null && func.isFunction()) {
      return Optional.of(func.call());
    } else {
      return Optional.empty();
    }
  }
}
