[#-- @ftlvariable name="frameId" type="String" --]
[#-- @ftlvariable name="pages" type="java.util.ArrayList<String>" --]
[#-- @ftlvariable name="values" type="java.util.HashMap" --]
[#-- @ftlvariable name="errors" type="java.util.HashMap" --]
[#-- @ftlvariable name="adminErrors" type="java.util.List" --]
<turbo-frame
  id="${frameId}"
  class="forms"
  target="_top"
  data-turbo-action="advance">

  [#if adminErrors?has_content]
    [#list adminErrors.errors![] as error]
      <div class="forms-alert" data-color="danger">${error}</div>
    [/#list]

    [#list adminErrors.warnings![] as error]
      <div class="forms-alert" data-color="warning">${error}</div>
    [/#list]
  [/#if]

  [#list pages as page]
    ${page?no_esc!}

    [#sep]<hr>[/#sep]
  [/#list]
</turbo-frame>
