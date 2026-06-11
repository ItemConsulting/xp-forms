[#macro render field errors]
  <div class="ds-field">
    <label for="${field.id}" class="ds-label">
      ${field.label!}
      [#if !field.required!true]
        <span class="ds-tag" data-size="sm">
          ${portal.localize("part.formView.optional")}
        </span>
      [/#if]
    </label>

    [#if field.helpText?has_content]
      <div
        id="${field.id}-help-text"
        data-field="description">

        ${field.helpText?no_esc}
      </div>
    [/#if]

    [@renderErrorList field errors /]

    [#nested]
  </div>
[/#macro]

[#macro renderErrorList field errors={}]
  [#assign errorList=errors[field.name]![] /]

  [#list errorList]
    <div id="${field.id}-error-text">
      [#items as error]
        <div class="ds-validation-message" data-field="validation">
          ${error}
        </div>
      [/#items]
    </div>
  [/#list]
[/#macro]

[#function hasError field errors]
  [#return (errors[field.name])?has_content?string]
[/#function]

[#function ariaDescribedBy field errors]
  [#assign errorList=errors[field.name]![]]
  [#assign helpTextId=field.helpText?has_content?string("${field.id}-help-text", "")]
  [#assign errorTextId=errorList?has_content?string("${field.id}-error-text", "")]

  [#return [helpTextId, errorTextId]?filter(id -> id?has_content)?join(" ")]
[/#function]
