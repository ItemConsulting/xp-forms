[#macro render field locale errors elementType="div"]
  <${elementType}
    class="forms--control"
    data-has-error="${hasError(field, errors)}">

    [#if elementType=="fieldset" && field.label?has_content]
      <legend>
        ${field.label}
      </legend>
    [#elseif elementType!="fieldset"]
      <label for="${field.id}">
        ${field.label!}
        [#if !field.required!true]
          <span class="forms--optional">[@localize key="part.formView.optional" locale=locale!"no" /]</span>
        [/#if]
      </label>
    [/#if]

    [#if field.helpText?has_content]
      <div
        id="${field.id}-help-text"
        class="forms--help-text">

        ${field.helpText}
      </div>
    [/#if]

    [@renderErrorList field errors /]

    [#nested]
  </${elementType}>
[/#macro]

[#macro renderErrorList field errors={}]
  [#assign errorList=errors[field.name]![] /]

  [#list errorList]
    <div
      id="${field.id}-error-text"
      class="forms--error-texts">

      [#items as error]
        <div class="forms--error-text">
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
