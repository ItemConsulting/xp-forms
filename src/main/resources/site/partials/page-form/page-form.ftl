[#-- @ftlvariable name="locale" type="String" --]
[#-- @ftlvariable name="frameId" type="String" --]
[#-- @ftlvariable name="pageId" type="String" --]
[#-- @ftlvariable name="errors" type="java.util.Map" --]
[#-- @ftlvariable name="backUrl" type="String" --]
[#-- @ftlvariable name="title" type="String" --]
[#-- @ftlvariable name="text" type="String" --]
[#-- @ftlvariable name="fields" type="java.util.List" --]
[#-- @ftlvariable name="submitButtonText" type="String" --]

[#import "../input/input.ftl" as Input]
[#import "../text-area/text-area.ftl" as TextArea]
[#import "../select/select.ftl" as Select]
[#import "../checkboxes/checkboxes.ftl" as Checkboxes]
[#import "../radiobuttons/radiobuttons.ftl" as RadioButtons]

<form method="post" data-turbo-frame="${frameId}">
  [#if backUrl?has_content]
    <a href="${backUrl}" class="forms--back-link" data-turbo-frame="_self">
      [@localize key="part.formView.back" locale=locale /]
    </a>
  [/#if]

  [#list errors!{}]
    <div
      role="alert"
      class="forms--error-list"
      tabindex="-1"
      autofocus>

      <h2>
        [@localize key="part.formView.thereIsAProblem" locale=locale /]
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

    ${text!""}
  </div>

  [#list fields![] as field]
    [#switch field.type]
      [#case "input"]
        [@Input.render field locale errors /]
        [#break]
      [#case "textarea"]
        [@TextArea.render field locale errors /]
        [#break]
      [#case "select"]
        [@Select.render field locale errors /]
        [#break]
      [#case "checkboxes"]
        [@Checkboxes.render field locale errors /]
        [#break]
      [#case "radiobuttons"]
        [@RadioButtons.render field locale errors /]
        [#break]
    [/#switch]
  [/#list]

  <button type="submit" class="form-view--submit-button">
    ${submitButtonText}
  </button>
</form>
