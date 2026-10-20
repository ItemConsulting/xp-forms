package no.item.forms.validator;

import com.enonic.xp.app.ApplicationService;
import com.enonic.xp.content.ContentService;
import com.enonic.xp.content.ContentValidator;
import com.enonic.xp.content.ContentValidatorParams;
import com.enonic.xp.content.ValidationErrors;
import com.enonic.xp.data.PropertyTree;
import com.enonic.xp.portal.script.PortalScriptService;
import com.enonic.xp.resource.ResourceService;
import com.enonic.xp.schema.content.ContentTypeName;
import no.item.forms.FormTypes;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/*
  Points out the problems with a form when it is saved, which FormChecks finds. XP has no warnings
  for content, so each of them keeps the form from being published until it is fixed.
*/
@Component
public class FormValidator implements ContentValidator {
  private static final ContentTypeName CONTENT_TYPE = ContentTypeName.from(FormChecks.APPLICATION_KEY, "form");

  private final FormTypes formTypes;

  @Activate
  public FormValidator(
    @Reference final ApplicationService applicationService,
    @Reference final ResourceService resourceService,
    @Reference final PortalScriptService portalScriptService,
    @Reference final ContentService contentService
  ) {
    this.formTypes = new FormTypes(
      () -> applicationService,
      () -> resourceService,
      () -> portalScriptService,
      () -> contentService
    );
  }

  @Override
  public boolean supports(ContentTypeName contentType) {
    return CONTENT_TYPE.equals(contentType);
  }

  @Override
  public void validate(ContentValidatorParams params, ValidationErrors.Builder builder) {
    PropertyTree data = params.getData();
    String integrationId = data.getString("integrationId");
    String contentId = params.getContentId() != null ? params.getContentId().toString() : null;

    // The form types read their site's config and language from the form, as it was last saved
    FormTypeSchema formType = integrationId != null
      ? formTypes.get(integrationId, contentId).map(FormTypeSchema::from).orElse(null)
      : null;

    FormChecks.check(FormField.read(data), formType).forEach(builder::add);
  }
}
