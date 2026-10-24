[#-- @ftlvariable name="sections" type="java.util.List<String>" --]

<div class="form-view--success">
  [#list sections![] as section]
    <div class="html-area flow">
      ${section?no_esc}
    </div>
  [#else]
    ${portal.localize("part.formView.success")}
  [/#list]
</div>
