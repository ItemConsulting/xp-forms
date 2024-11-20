[#import "../form-control/form-control.ftl" as FormControl]

[#macro render field locale errors={}]
  [#assign ariaDescribedBy=FormControl.ariaDescribedBy(field, errors)]

  [@FormControl.render field locale errors]
    <input
      type="text"
      id="${field.id}"
      name="${field.name}"
      [#if ariaDescribedBy?has_content]aria-describedby="${ariaDescribedBy}"[/#if]
      [#if field.value?has_content]value="${field.value}"[/#if]
      [#if field.placeholder?has_content]placeholder="${field.placeholder}"[/#if]
      [#if field.inputmode?has_content]inputmode="${field.inputmode}"[/#if]
      [#if field.autocomplete?has_content]autocomplete="${field.autocomplete}"[/#if]
    >
  [/@FormControl.render]
[/#macro]
