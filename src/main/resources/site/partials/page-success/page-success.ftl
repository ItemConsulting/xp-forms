[#-- @ftlvariable name="locale" type="String" --]
[#-- @ftlvariable name="sections" type="java.util.List<String>" --]

<div class="form-view--success">
  [#list sections![] as section]
    <div class="html-area flow">
      ${section}
    </div>
  [#else]
    [@localize key="part.formView.success" locale=locale /]
  [/#list]
</div>
