[#macro render field errors={}]
  <div class="forms--input">
    <label for="${field.id}">
      ${field.label}
    </label>

    [#if field.helpText?has_content]
      <div id="${field.id}-help-text">
        ${field.helpText}
      </div>
    [/#if]

    [#list errors[field.name]![] as error]
      <div class="forms--error">
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
