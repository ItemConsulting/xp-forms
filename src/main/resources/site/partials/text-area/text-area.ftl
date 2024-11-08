[#macro render field errors={}]
  <div class="forms--textarea">
    <label for="${field.id}">
      ${field.label}
    </label>

    [#if field.helpText?has_content]
      <div id="${field.id}-help-text">
        ${field.helpText}
      </div>
    [/#if]

    <textarea
      id="${field.id}"
      name="${field.name}"
      [#if field.rows?has_content]rows="${field.rows}"[/#if]
      [#if field.cols?has_content]cols="${field.cols}"[/#if]
      [#if field.placeholder?has_content]placeholder="${field.placeholder}"[/#if]
      [#if field.inputmode?has_content]inputmode="${field.inputmode}"[/#if]
      [#if field.autocomplete?has_content]autocomplete="${field.autocomplete}"[/#if]
      >[#if field.value?has_content]${field.value}[/#if]</textarea>
  </div>
[/#macro]
