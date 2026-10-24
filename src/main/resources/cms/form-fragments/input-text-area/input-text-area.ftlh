[#import "../fields/fields.ftlh" as Field]

[#macro render field errors={}]
  [#assign ariaDescribedBy=Field.ariaDescribedBy(field, errors)]
  [@Field.render field errors]
    <textarea
      id="${field.id}"
      name="${field.name}"
      class="ds-input"
      [#if field.required!false]aria-required="true"[/#if]
      [#if errors[field.name]??]aria-invalid="true"[/#if]
      [#if ariaDescribedBy?has_content]aria-describedby="${ariaDescribedBy}"[/#if]
      [#if field.rows?has_content]rows="${field.rows}"[/#if]
      [#if field.cols?has_content]cols="${field.cols}"[/#if]
      [#if field.placeholder?has_content]placeholder="${field.placeholder}"[/#if]
      [#if field.inputmode?has_content]inputmode="${field.inputmode}"[/#if]
      [#if field.autocomplete?has_content]autocomplete="${field.autocomplete}"[/#if]
      >[#if field.value?has_content]${field.value}[/#if]</textarea>
  [/@Field.render]
[/#macro]
