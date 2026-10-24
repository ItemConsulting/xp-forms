[#import "../fields/fields.ftlh" as Field]

[#macro render field errors={}]
  [#assign ariaDescribedBy=Field.ariaDescribedBy(field, errors)]

  [@Field.render field errors]
    <select
      id="${field.id}"
      name="${field.name}"
      class="ds-input">

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
