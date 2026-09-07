[#-- @ftlvariable name="frameId" type="String" --]
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
[#-- @ftlvariable name="errors" type="java.util.Map" --]
[#-- @ftlvariable name="pageId" type="String" --]
[#-- @ftlvariable name="spamPreventionConfig" type="java.util.Map" --]

[#import "../page-utils/page-utils.ftlh" as PageUtils]

[#if isPreviewReviewPage]
  <div class="form-view--review">
    <a href="${editUrl}" class="forms--edit-link" data-turbo-frame="_self">
      ${portal.localize("part.formView.edit")}
    </a>

    [@listSections /]

    <a href="${editUrl}" class="forms--edit-link" data-turbo-frame="_self">
      ${portal.localize("part.formView.edit")}
    </a>
  </div>
[#else]
  <div class="form-view--review">
    [@PageUtils.errorSummary errors pageId /]

    <form method="post" data-turbo-frame="${frameId}">
      <a href="${backUrl}" rel="prev" class="ds-link" data-turbo-frame="_self">
        ${portal.localize("part.formView.back")}
      </a>

      <h1 class="ds-heading" data-size="xl">${title}</h1>

      [@listSections /]

      [#-- Create input-text fields to submit all values of the form --]
      [#list sections as section]
        [#list section.fields![] as field]
          [#list field.values![] as value]
            <input type="hidden" name="${field.name}" value="${value}">
          [/#list]
        [/#list]
      [/#list]

      [@PageUtils.spamPrevention spamPreventionConfig /]

      <button type="submit" class="ds-button">${submitButtonText!"Send"}</button>
    </form>
  </div>
[/#if]

[#macro listSections]
  [#list sections as section]
    <div class="form-view--review-section">
      <h2>${section.title!}</h2>

      [#list section.fields![]]
        <dl>
          [#items as field]
            <dt>${field.label!}</dt>

            [#list field.valuesResolved![] as valueResolved]
              <dd>
                ${(valueResolved!)?replace("\n", "<br>")?no_esc}
              </dd>
            [#else]
              <dd><i>${portal.localize("part.formView.notProvided")}</i></dd>
            [/#list]
          [/#items]
        </dl>
      [/#list]
    </div>
  [/#list]
[/#macro]
