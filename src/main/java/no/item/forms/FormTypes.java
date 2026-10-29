package no.item.forms;

import com.enonic.xp.app.Application;
import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.app.ApplicationService;
import com.enonic.xp.content.Content;
import com.enonic.xp.content.ContentId;
import com.enonic.xp.content.ContentNotFoundException;
import com.enonic.xp.content.ContentService;
import com.enonic.xp.portal.PortalRequest;
import com.enonic.xp.portal.PortalRequestAccessor;
import com.enonic.xp.portal.script.PortalScriptService;
import com.enonic.xp.resource.ResourceKey;
import com.enonic.xp.resource.ResourceService;
import com.enonic.xp.script.ScriptExports;
import com.enonic.xp.script.ScriptValue;
import com.enonic.xp.site.Site;
import no.item.forms.mapper.PortalRequestMapper;
import no.item.forms.record.ExtensionResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.function.Supplier;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/*
  Runs the form types that apps register in forms/forms.js. Used by ExtensionsBean for the scripts of
  this app, and by FormValidator when a form is saved.

  Each method takes the id of the form, or null. The form types read the site's config from the
  current request, so they are run with the form's site in it. Guillotine is served outside any
  site, and would otherwise give them none. They also read their language from the request, so
  they are given the form's language, which the rest of the form is in. Saving a form happens
  outside any request, and they are given an empty one.
*/
public final class FormTypes {
  private static final Logger LOG = LoggerFactory.getLogger(FormTypes.class);

  private static final String SCRIPT_PATH = "forms/forms.js";

  private static final String EXTENSIONS_METHOD_NAME = "extensions";

  private final Supplier<ApplicationService> applicationService;

  private final Supplier<ResourceService> resourceService;

  private final Supplier<PortalScriptService> portalScriptService;

  private final Supplier<ContentService> contentService;

  public FormTypes(
    Supplier<ApplicationService> applicationService,
    Supplier<ResourceService> resourceService,
    Supplier<PortalScriptService> portalScriptService,
    Supplier<ContentService> contentService
  ) {
    this.applicationService = applicationService;
    this.resourceService = resourceService;
    this.portalScriptService = portalScriptService;
    this.contentService = contentService;
  }

  /** The form types of every installed app */
  public Stream<ExtensionResult> getAll(String formId) {
    FormContext form = getFormContext(formId);

    return applicationService.get().getInstalledApplications().stream()
            .map(Application::getKey)
            .flatMap(applicationKey -> executeMethod(applicationKey, form));
  }

  /** The form type with the id "<app>:<id>", from a run of only that app's form types */
  public Optional<ExtensionResult> get(String id, String formId) {
    String[] parts = id.split(":");

    if (parts.length != 2) {
      return Optional.empty();
    }

    return executeMethod(ApplicationKey.from(parts[0]), getFormContext(formId))
            .filter(res -> parts[1].equals(getIdFromScriptValue(res.value())))
            .findFirst();
  }

  private String getIdFromScriptValue(ScriptValue value) {
    return value.isObject() ? (String) value.getMap().get("id") : null;
  }

  private Stream<ExtensionResult> executeMethod(ApplicationKey applicationKey, FormContext form) {
    PortalRequest currentRequest = PortalRequestAccessor.get();
    PortalRequest tmpPortalRequest = currentRequest != null ? copyPortalRequest(currentRequest) : new PortalRequest();
    tmpPortalRequest.setApplicationKey(applicationKey);
    if (form.site() != null) {
      tmpPortalRequest.setSite(form.site());
    }

    // In XP 8 the request is a scoped value, which set() does not replace while it is bound
    List<ExtensionResult> results = PortalRequestAccessor.callWith(
      tmpPortalRequest,
      () -> executeExtensions(applicationKey, new PortalRequestMapper(tmpPortalRequest, form.locale()))
    );

    return results.stream();
  }

  private List<ExtensionResult> executeExtensions(ApplicationKey applicationKey, PortalRequestMapper portalRequest) {
    ResourceKey resourceKey = ResourceKey.from(applicationKey, SCRIPT_PATH);
    if (resourceService.get().getResource(resourceKey).exists()) {
      ScriptExports scriptExports = portalScriptService.get().execute(resourceKey);
      if (scriptExports != null) {
        if (scriptExports.hasMethod(EXTENSIONS_METHOD_NAME)) {
          try {
            ScriptValue value = scriptExports.executeMethod(EXTENSIONS_METHOD_NAME, portalRequest);

            if (value != null) {
              return unwrapResultArrays(new ExtensionResult(applicationKey, value)).collect(Collectors.toList());
            }
          } catch (Exception e) {
            LOG.warn("{} function can not be extracted from {}", EXTENSIONS_METHOD_NAME, SCRIPT_PATH, e);
          }
        }
      }
    }

    return List.of();
  }

  /*
    Without a form, both are null, which leaves the site and language of the request. That is also
    the case for a form that is being created, and is validated before it is saved. The site is null
    when the form is not in a site, and the language when neither the form nor its site has one.
  */
  private FormContext getFormContext(String formId) {
    if (formId == null) {
      return new FormContext(null, null);
    }

    ContentId contentId = ContentId.from(formId);
    Content content;

    try {
      content = contentService.get().getById(contentId);
    } catch (ContentNotFoundException e) {
      return new FormContext(null, null);
    }

    Site site = contentService.get().getNearestSite(contentId);
    Locale locale = content.getLanguage() != null ? content.getLanguage() : site != null ? site.getLanguage() : null;

    return new FormContext(site, locale);
  }

  private record FormContext(Site site, Locale locale) {}

  private Stream<ExtensionResult> unwrapResultArrays(ExtensionResult result) {
    if (result == null) {
      return Stream.empty();
    } else if (result.value().isArray()) {
      return result.value().getArray().stream().map(value -> new ExtensionResult(result.key(), value));
    } else {
      return Stream.of(result);
    }
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
    portalRequest.setProject(oldRequest.getProject());
    portalRequest.setContent(oldRequest.getContent());
    portalRequest.setComponent(oldRequest.getComponent());
    portalRequest.setApplicationKey(oldRequest.getApplicationKey());
    portalRequest.setPageDescriptor(oldRequest.getPageDescriptor());
    portalRequest.setControllerScript(oldRequest.getControllerScript());
    portalRequest.setValidTicket(oldRequest.isValidTicket());

    return portalRequest;
  }
}
