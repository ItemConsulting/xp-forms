[#macro render field errors={}]
  [#assign errorList=errors[field.name]![] /]

  <div class="forms--input ${errorList?has_content?string("forms--input-with-error","")}">
    <label for="${field.id}">
      ${field.label}
    </label>

    [#if field.helpText?has_content]
      <div id="${field.id}-help-text">
        ${field.helpText}
      </div>
    [/#if]

    [#list errorList as error]
      <div class="forms--error-text">
        ${error}
      </div>
    [/#list]

    <input
      type="text"
      id="${field.id}"
      name="${field.name}"
      [#if field.value?has_content]value="${field.value}"[/#if]
      [#if field.placeholder?has_content]placeholder="${field.placeholder}"[/#if]
      [#if field.inputmode?has_content]inputmode="${field.inputmode}"[/#if]
      [#if field.autocomplete?has_content]autocomplete="${field.autocomplete}"[/#if]
    >
  </div>
[/#macro]
