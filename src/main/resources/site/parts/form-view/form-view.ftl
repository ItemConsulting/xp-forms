[#-- @ftlvariable name="locale" type="java.util.ArrayList" --]
[#-- @ftlvariable name="pages" type="java.util.ArrayList" --]
[#-- @ftlvariable name="values" type="java.util.HashMap" --]
[#-- @ftlvariable name="errors" type="java.util.HashMap" --]
[#-- @ftlvariable name="mode" type="String" --]
[#import "../../partials/input/input.ftl" as Input]
[#import "../../partials/text-area/text-area.ftl" as TextArea]
[#import "../../partials/select/select.ftl" as Select]
[#import "../../partials/checkboxes/checkboxes.ftl" as Checkboxes]
[#import "../../partials/radiobuttons/radiobuttons.ftl" as RadioButtons]

<div class="form-view">
  [#list pages as page]

    [@form page=page /]

    [#if page_has_next]
      <hr>
    [/#if]
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
          [@Input.render field=field errors=errors /]
          [#break]
        [#case "textarea"]
          [@TextArea.render field=field errors=errors /]
          [#break]
        [#case "select"]
          [@Select.render field=field errors=errors /]
          [#break]
        [#case "checkboxes"]
          [@Checkboxes.render field=field errors=errors /]
          [#break]
        [#case "radiobuttons"]
          [@RadioButtons.render field=field errors=errors /]
          [#break]
      [/#switch]
    [/#list]

    <button type="submit" class="form-view--submit-button">
      ${page.submitButtonText}
    </button>
  </form>
[/#macro]
