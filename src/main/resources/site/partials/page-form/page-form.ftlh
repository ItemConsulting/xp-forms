[#-- @ftlvariable name="frameId" type="String" --]
[#-- @ftlvariable name="pageId" type="String" --]
[#-- @ftlvariable name="errors" type="java.util.Map" --]
[#-- @ftlvariable name="backUrl" type="String" --]
[#-- @ftlvariable name="title" type="String" --]
[#-- @ftlvariable name="text" type="String" --]
[#-- @ftlvariable name="fields" type="java.util.List" --]
[#-- @ftlvariable name="submitButtonText" type="String" --]

[#import "../input-text/input-text.ftlh" as Input]
[#import "../input-text-area/input-text-area.ftlh" as TextArea]
[#import "../input-select/input-select.ftlh" as Select]
[#import "../input-checkboxes/input-checkboxes.ftlh" as Checkboxes]
[#import "../input-radiobuttons/input-radiobuttons.ftlh" as RadioButtons]

<form method="post" data-turbo-frame="${frameId}">
  [#if backUrl?has_content]
    <a href="${backUrl}" rel="prev" class="ds-link" data-turbo-frame="_self">
      ${portal.localize("part.formView.back")}
    </a>
  [/#if]

  [#list errors!{}]
    <ds-error-summary class="ds-error-summary">
      <h2>${portal.localize("part.formView.thereIsAProblem")}</h2>

      <ul class="ds-list">
        [#items as key, values]
          [#list values![] as value]
            <li>
              <a
                class="ds-link"
                data-color="neutral"
                href="#${pageId}-${key}"
                data-turbo="false">${value}
              </a>
            </li>
          [/#list]
        [/#items]
      </ul>
    </ds-error-summary>
  [/#list]

  <div class="html-area">
    [#if title?has_content]
      <h2 class="ds-heading" data-size="md">${title}</h2>
    [/#if]

    ${text?no_esc!}
  </div>

  [#list fields![] as field]
    [#switch field.type]
      [#case "text"]
        [@Input.render field errors /]
        [#break]
      [#case "textarea"]
        [@TextArea.render field errors /]
        [#break]
      [#case "select"]
        [@Select.render field errors /]
        [#break]
      [#case "checkboxes"]
        [@Checkboxes.render field errors /]
        [#break]
      [#case "radiobuttons"]
        [@RadioButtons.render field errors /]
        [#break]
      [#case "hidden"]
        <input type="hidden" name="${field.name}" value="${field.value!""}" />
        [#break]
    [/#switch]
  [/#list]

  [#if enableHoneypot?has_content && honeypotFiledId?has_content]
    <div class="input-field-p">
      <label for="${honeypotFiledId}">Nettside</label>
      <input name="${honeypotFiledId}" type="text" id="${honeypotFiledId}" value="" autocomplete="off" />
    </div>
  [/#if]

  <button type="submit" class="ds-button">
    ${submitButtonText}
  </button>
</form>
