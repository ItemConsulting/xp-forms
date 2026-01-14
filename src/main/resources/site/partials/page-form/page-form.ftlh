[#-- @ftlvariable name="frameId" type="String" --]
[#-- @ftlvariable name="pageId" type="String" --]
[#-- @ftlvariable name="errors" type="java.util.Map" --]
[#-- @ftlvariable name="backUrl" type="String" --]
[#-- @ftlvariable name="title" type="String" --]
[#-- @ftlvariable name="text" type="String" --]
[#-- @ftlvariable name="fields" type="java.util.List" --]
[#-- @ftlvariable name="submitButtonText" type="String" --]

[#import "../input/input.ftlh" as Input]
[#import "../text-area/text-area.ftlh" as TextArea]
[#import "../select/select.ftlh" as Select]
[#import "../checkboxes/checkboxes.ftlh" as Checkboxes]
[#import "../radiobuttons/radiobuttons.ftlh" as RadioButtons]

<form method="post" data-turbo-frame="${frameId}">
  [#if backUrl?has_content]
    <a href="${backUrl}" class="forms--back-link" data-turbo-frame="_self">
      ${portal.localize("part.formView.back")}
    </a>
  [/#if]

  [#list errors!{}]
    <div
      role="alert"
      class="forms--error-list"
      tabindex="-1"
      autofocus>

      <h2>
        ${portal.localize("part.formView.thereIsAProblem")}
      </h2>

      <ul>
        [#items as key, values]
          [#list values![] as value]
            <li>
              <a href="#${pageId}-${key}" data-turbo="false">${value}</a>
            </li>
          [/#list]
        [/#items]
      </ul>
    </div>
  [/#list]

  <div class="html-area">
    [#if title?has_content]
      <h2 class="form-view--title">${title}</h2>
    [/#if]

    ${text?no_esc!}
  </div>

  [#list fields![] as field]
    [#switch field.type]
      [#case "input"]
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
    [/#switch]
  [/#list]

  [#if enableHoneypot?has_content && honeypotFiledId?has_content]
    <div class="input-field-p">
      <label for="${honeypotFiledId}">Nettside</label>
      <input name="${honeypotFiledId}" type="text" id="${honeypotFiledId}" value="" autocomplete="off" />
    </div>
  [/#if]

  <button type="submit" class="form-view--submit-button">
    ${submitButtonText}
  </button>
</form>
