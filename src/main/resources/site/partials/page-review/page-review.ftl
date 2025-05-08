[#-- @ftlvariable name="locale" type="String" --]
[#-- @ftlvariable name="backUrl" type="String" --]
[#-- @ftlvariable name="title" type="String" --]
[#-- @ftlvariable name="sections" type="java.util.List" --]
[#-- @ftlvariable name="section.title" type="String" --]
[#-- @ftlvariable name="section.fields" type="java.util.List" --]
[#-- @ftlvariable name="field.label" type="String" --]
[#-- @ftlvariable name="field.name" type="String" --]
[#-- @ftlvariable name="field.values" type="java.util.List<String>" --]
[#-- @ftlvariable name="submitButtonText" type="String" --]

<div class="form-view--review">
  <form method="post">
    [#if backUrl?has_content]
      <a href="${backUrl}" class="forms--back-link">
        [@localize key="part.formView.back" locale=locale /]
      </a>
    [/#if]

    <h1>${title}</h1>

    [#list sections as section]
      <section
        class="form-view--review-section"
        aria-labelledby="form-review-section-${section_index}">

        <h2 id="form-review-section-${section_index}">${section.title}</h2>

        [#list section.fields![]]
          <dl>
            [#items as field]
              <dt>${field.label}</dt>

              [#list field.values![] as value]
                <dd>
                  ${(value!"")?replace("\n", "<br>")}
                  <input type="text" name="${field.name}" value="${value}">
                </dd>
              [#else]
                <dd><i>[@localize key="part.formView.notProvided" locale=locale /]</i></dd>
              [/#list]
            [/#items]
          </dl>
        [/#list]
      </section>
    [/#list]

    <button type="submit">${submitButtonText!"Send"}</button>
  </form>
</div>
