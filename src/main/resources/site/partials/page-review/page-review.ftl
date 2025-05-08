[#-- @ftlvariable name="locale" type="String" --]
[#-- @ftlvariable name="isPreviewReviewPage" type="Boolean" --]
[#-- @ftlvariable name="editUrl" type="String" --]
[#-- @ftlvariable name="backUrl" type="String" --]
[#-- @ftlvariable name="title" type="String" --]
[#-- @ftlvariable name="sections" type="java.util.List" --]
[#-- @ftlvariable name="section.title" type="String" --]
[#-- @ftlvariable name="section.fields" type="java.util.List" --]
[#-- @ftlvariable name="field.label" type="String" --]
[#-- @ftlvariable name="field.name" type="String" --]
[#-- @ftlvariable name="field.values" type="java.util.List<String>" --]
[#-- @ftlvariable name="field.valuesResolved" type="java.util.List<String>" --]
[#-- @ftlvariable name="submitButtonText" type="String" --]

[#if isPreviewReviewPage]
  <div class="form-view--review">
    <a href="${editUrl}" class="forms--edit-link">
      [@localize key="part.formView.edit" locale=locale /]
    </a>

    [@listSections /]

    <a href="${editUrl}" class="forms--edit-link">
      [@localize key="part.formView.edit" locale=locale /]
    </a>
  </div>
[#else]
  <div class="form-view--review">
    <form method="post">
      <a href="${backUrl}" class="forms--back-link">
        [@localize key="part.formView.back" locale=locale /]
      </a>

      <h1>${title}</h1>

      [@listSections /]

      [#-- Create input fields to submit all values of the form --]
      [#list sections as section]
        [#list section.fields![] as field]
          [#list field.values![] as value]
            <input type="hidden" name="${field.name}" value="${value}">
          [/#list]
        [/#list]
      [/#list]

      <button type="submit">${submitButtonText!"Send"}</button>
    </form>
  </div>
[/#if]

[#macro listSections]
  [#list sections as section]
    <section
      class="form-view--review-section"
      aria-labelledby="form-review-section-${section_index}">

      <h2 id="form-review-section-${section_index}">${section.title}</h2>

      [#list section.fields![]]
        <dl>
          [#items as field]
            <dt>${field.label}</dt>

            [#list field.valuesResolved![] as valueResolved]
              <dd>
                ${(valueResolved!"")?replace("\n", "<br>")}
              </dd>
            [#else]
              <dd><i>[@localize key="part.formView.notProvided" locale=locale /]</i></dd>
            [/#list]
          [/#items]
        </dl>
      [/#list]
    </section>
  [/#list]
[/#macro]
