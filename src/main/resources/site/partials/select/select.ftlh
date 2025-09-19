[#import "../forms-control/forms-control.ftlh" as FormControl]

[#macro render field errors={}]
  [#assign ariaDescribedBy=FormControl.ariaDescribedBy(field, errors)]

  [@FormControl.render field errors]
    <select
      id="${field.id}"
      name="${field.name}">

      [#list field.options![] as option]
        <option
          value="${option.value}"
          [#if option.value == field.value!]selected[/#if]>

          ${option.text}
        </option>
      [/#list]
    </select>
  [/@FormControl.render]
[/#macro]
