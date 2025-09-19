[#-- @ftlvariable name="frameId" type="String" --]
[#-- @ftlvariable name="pages" type="java.util.ArrayList<String>" --]
[#-- @ftlvariable name="values" type="java.util.HashMap" --]
[#-- @ftlvariable name="errors" type="java.util.HashMap" --]
[#-- @ftlvariable name="adminErrors" type="java.util.List" --]
[#import "../../partials/input/input.ftlh" as Input]
[#import "../../partials/text-area/text-area.ftlh" as TextArea]
[#import "../../partials/select/select.ftlh" as Select]
[#import "../../partials/checkboxes/checkboxes.ftlh" as Checkboxes]
[#import "../../partials/radiobuttons/radiobuttons.ftlh" as RadioButtons]

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
    ${page?no_esc!}

    [#sep]<hr>[/#sep]
  [/#list]
</turbo-frame>
