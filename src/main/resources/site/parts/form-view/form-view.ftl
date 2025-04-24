[#-- @ftlvariable name="locale" type="String" --]
[#-- @ftlvariable name="pages" type="java.util.ArrayList" --]
[#-- @ftlvariable name="values" type="java.util.HashMap" --]
[#-- @ftlvariable name="errors" type="java.util.HashMap" --]
[#-- @ftlvariable name="adminErrors" type="java.util.List" --]
[#-- @ftlvariable name="mode" type="String" --]
[#import "../../partials/input/input.ftl" as Input]
[#import "../../partials/text-area/text-area.ftl" as TextArea]
[#import "../../partials/select/select.ftl" as Select]
[#import "../../partials/checkboxes/checkboxes.ftl" as Checkboxes]
[#import "../../partials/radiobuttons/radiobuttons.ftl" as RadioButtons]

<div class="form-view">
  [#if adminErrors?has_content]
    [#list adminErrors.errors![] as error]
      <div class="form-view--admin-error">${error}</div>
    [/#list]

    [#list adminErrors.warnings![] as error]
      <div class="form-view--admin-error">${error}</div>
    [/#list]
  [/#if]

  [#list pages as page]
    [#switch page.type]
      [#case "form-page"]
        [@form page /]
        [#break]
      [#case "success-page"]
        [@success page /]
        [#break]
    [/#switch]

    [#sep]<hr>[/#sep]
  [/#list]
</div>

[#macro form page]
  <form method="post" data-turbo="false">
    [#if page.backUrl?has_content]
      <a href="${page.backUrl}" class="form-view--back-button">
        [@localize key="part.formView.back" locale=locale /]
      </a>
    [/#if]

    <div class="html-area">
      [#if page.title?has_content]
        <h2 class="form-view--title">${page.title}</h2>
      [/#if]

      ${page.text!""}
    </div>

    [#list page.fields![] as field]
      [#switch field.type]
        [#case "input"]
          [@Input.render field locale errors /]
          [#break]
        [#case "textarea"]
          [@TextArea.render field locale errors /]
          [#break]
        [#case "select"]
          [@Select.render field locale errors /]
          [#break]
        [#case "checkboxes"]
          [@Checkboxes.render field locale errors /]
          [#break]
        [#case "radiobuttons"]
          [@RadioButtons.render field locale errors /]
          [#break]
      [/#switch]
    [/#list]

    <button type="submit" class="form-view--submit-button">
      ${page.submitButtonText}
    </button>
  </form>
[/#macro]

[#macro success page]
  <div class="form-view--success">
    [#list page.sections as section]
      <div class="html-area flow">
        ${section.text!""}
      </div>
    [/#list]
  </div>
[/#macro]
