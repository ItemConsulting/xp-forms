[#import "../input-field/input-field.ftlh" as Field]

[#macro render field errors={}]
  [#assign ariaDescribedBy=Field.ariaDescribedBy(field, errors)]

  [@Field.render field errors]
    <select
      id="${field.id}"
      name="${field.name}"
      class="ds-input"
      [#if field.required!false]aria-required="true"[/#if]
      [#if errors[field.name]??]aria-invalid="true"[/#if]
      [#if ariaDescribedBy?has_content]aria-describedby="${ariaDescribedBy}"[/#if]>

      [#list field.options![] as option]
        <option
          value="${option.value}"
          [#if option.value == field.value!]selected[/#if]>

          ${option.text}
        </option>
      [/#list]
    </select>
  [/@Field.render]
[/#macro]
