[#-- @ftlvariable name="frameId" type="String" --]
[#-- @ftlvariable name="pages" type="java.util.ArrayList<String>" --]
[#-- @ftlvariable name="values" type="java.util.HashMap" --]
[#-- @ftlvariable name="errors" type="java.util.HashMap" --]
<turbo-frame
  id="${frameId}"
  class="forms"
  target="_top"
  data-turbo-action="advance">

  [#list pages as page]
    ${page?no_esc!}

    [#sep]<hr>[/#sep]
  [/#list]
</turbo-frame>
