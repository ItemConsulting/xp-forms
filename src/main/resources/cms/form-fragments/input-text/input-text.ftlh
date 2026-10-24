[#import "../fields/fields.ftlh" as Field]

[#macro render field errors={}]
  [#assign ariaDescribedBy=Field.ariaDescribedBy(field, errors)]

  [@Field.render field errors]
    <input
      type="text"
      id="${field.id}"
      name="${field.name}"
      class="ds-input"
      [#if field.required!false]aria-required="true"[/#if]
      [#if errors[field.name]??]aria-invalid="true"[/#if]
      [#if ariaDescribedBy?has_content]aria-describedby="${ariaDescribedBy}"[/#if]
      [#if field.value?has_content]value="${field.value}"[/#if]
      [#if field.placeholder?has_content]placeholder="${field.placeholder}"[/#if]
      [#if field.inputmode?has_content]inputmode="${field.inputmode}"[/#if]
      [#if field.autocomplete?has_content]autocomplete="${field.autocomplete}"[/#if]
    >
  [/@Field.render]
[/#macro]
