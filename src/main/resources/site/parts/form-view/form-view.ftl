[#-- @ftlvariable name="locale" type="String" --]
[#-- @ftlvariable name="frameId" type="String" --]
[#-- @ftlvariable name="pages" type="java.util.ArrayList<String>" --]
[#-- @ftlvariable name="values" type="java.util.HashMap" --]
[#-- @ftlvariable name="errors" type="java.util.HashMap" --]
[#-- @ftlvariable name="adminErrors" type="java.util.List" --]
[#import "../../partials/input/input.ftl" as Input]
[#import "../../partials/text-area/text-area.ftl" as TextArea]
[#import "../../partials/select/select.ftl" as Select]
[#import "../../partials/checkboxes/checkboxes.ftl" as Checkboxes]
[#import "../../partials/radiobuttons/radiobuttons.ftl" as RadioButtons]

<turbo-frame
  id="${frameId}"
  class="forms"
  target="_top"
  data-turbo-action="advance">

  [#if adminErrors?has_content]
    [#list adminErrors.errors![] as error]
      <div class="form-view--admin-error">${error}</div>
    [/#list]

    [#list adminErrors.warnings![] as error]
      <div class="form-view--admin-warning">${error}</div>
    [/#list]
  [/#if]

  [#list pages as page]
    ${page!""}

    [#sep]<hr>[/#sep]
  [/#list]
</turbo-frame>
