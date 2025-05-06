[#import "../forms-control/forms-control.ftl" as FormControl]

[#macro render field locale errors={}]
  [#assign ariaDescribedBy=FormControl.ariaDescribedBy(field, errors)]
  [@FormControl.render field locale errors]
    <textarea
      id="${field.id}"
      name="${field.name}"
      [#if ariaDescribedBy?has_content]aria-describedby="${ariaDescribedBy}"[/#if]
      [#if field.rows?has_content]rows="${field.rows}"[/#if]
      [#if field.cols?has_content]cols="${field.cols}"[/#if]
      [#if field.placeholder?has_content]placeholder="${field.placeholder}"[/#if]
      [#if field.inputmode?has_content]inputmode="${field.inputmode}"[/#if]
      [#if field.autocomplete?has_content]autocomplete="${field.autocomplete}"[/#if]
      >[#if field.value?has_content]${field.value}[/#if]</textarea>
  [/@FormControl.render]
[/#macro]
