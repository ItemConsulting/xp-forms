package no.item.forms;

import com.enonic.xp.app.Application;
import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.app.ApplicationService;
import com.enonic.xp.portal.PortalRequest;
import com.enonic.xp.portal.PortalRequestAccessor;
import com.enonic.xp.portal.script.PortalScriptService;
import com.enonic.xp.resource.ResourceKey;
import com.enonic.xp.resource.ResourceService;
import com.enonic.xp.script.ScriptExports;
import com.enonic.xp.script.ScriptValue;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;
import no.item.forms.mapper.IntegrationsMapper;
import no.item.forms.mapper.JsonSchemaMapper;
import no.item.forms.mapper.PortalRequestMapper;
import no.item.forms.record.ExtensionResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Objects;
import java.util.function.Supplier;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class ExtensionsBean implements ScriptBean {
  private static final Logger LOG = LoggerFactory.getLogger(ExtensionsBean.class);

  private static final String SCRIPT_PATH = "forms/forms.js";

  private static final String EXTENSIONS_METHOD_NAME = "extensions";

  private Supplier<ApplicationService> applicationService;

  private Supplier<ResourceService> resourceService;

  private Supplier<PortalScriptService> portalScriptService;

  @Override
  public void initialize(final BeanContext context) {
    this.applicationService = context.getService(ApplicationService.class);
    this.resourceService = context.getService(ResourceService.class);
    this.portalScriptService = context.getService(PortalScriptService.class);
  }

  public Object getIntegrations() {
    return getExtensionsStream()
      .map(IntegrationsMapper::new)
      .collect(Collectors.toList());
  }

  public Object getReferenceJsonSchema(String id) {
    ApplicationKey key = ApplicationKey.from(id.split(":")[0]);

    ExtensionResult result = executeMethod(key);

    if (result != null) {
      return new JsonSchemaMapper(result);
    }

    return null;
  }

  private Stream<ExtensionResult> getExtensionsStream() {
    return applicationService.get().getInstalledApplications().stream()
      .map(Application::getKey)
      .map(this::executeMethod)
      .filter(Objects::nonNull);
  }

  private ExtensionResult executeMethod(ApplicationKey applicationKey) {
    PortalRequest oldPortalRequest = PortalRequestAccessor.get();

    PortalRequest tmpPortalRequest = copyPortalRequest(oldPortalRequest);
    tmpPortalRequest.setApplicationKey(applicationKey);
    PortalRequestAccessor.set(tmpPortalRequest);

    try {
      ResourceKey resourceKey = ResourceKey.from(applicationKey, SCRIPT_PATH);
      if (resourceService.get().getResource(resourceKey).exists()) {
        ScriptExports scriptExports = portalScriptService.get().execute(resourceKey);
        if (scriptExports != null) {
          if (scriptExports.hasMethod(EXTENSIONS_METHOD_NAME)) {
            try {
              ScriptValue value = scriptExports.executeMethod(EXTENSIONS_METHOD_NAME, new PortalRequestMapper(tmpPortalRequest));

              if (value != null) {
                return new ExtensionResult(applicationKey, value);
              }
            } catch (Exception e) {
              LOG.warn("{} function can not be extracted from {}", EXTENSIONS_METHOD_NAME, SCRIPT_PATH, e);
            }
          }
        }
      }
    } finally {
      PortalRequestAccessor.set( oldPortalRequest );
    }

    return null;
  }

  private PortalRequest copyPortalRequest(PortalRequest oldRequest) {
    PortalRequest portalRequest = new PortalRequest(oldRequest);

    portalRequest.setMode(oldRequest.getMode());
    portalRequest.setRepositoryId(oldRequest.getRepositoryId());
    portalRequest.setBranch(oldRequest.getBranch());
    portalRequest.setContentPath(oldRequest.getContentPath());
    portalRequest.setBaseUri(oldRequest.getBaseUri());
    portalRequest.setContextPath(oldRequest.getContextPath());
    portalRequest.setSite(oldRequest.getSite());
    portalRequest.setContent(oldRequest.getContent());
    portalRequest.setPageTemplate(oldRequest.getPageTemplate());
    portalRequest.setComponent(oldRequest.getComponent());
    portalRequest.setApplicationKey(oldRequest.getApplicationKey());
    portalRequest.setPageDescriptor(oldRequest.getPageDescriptor());
    portalRequest.setControllerScript(oldRequest.getControllerScript());
    portalRequest.setValidTicket(oldRequest.isValidTicket());

    return portalRequest;
  }
}


