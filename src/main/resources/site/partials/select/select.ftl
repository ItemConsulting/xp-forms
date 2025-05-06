[#import "../forms-control/forms-control.ftl" as FormControl]

[#macro render field locale errors={}]
  [#assign ariaDescribedBy=FormControl.ariaDescribedBy(field, errors)]

  [@FormControl.render field locale errors]
    <select
      id="${field.id}"
      name="${field.name}">

      [#list field.options![] as option]
        <option
          value="${option.value}"
          [#if option.value == field.value!""]selected[/#if]>

          ${option.text}
        </option>
      [/#list]
    </select>
  [/@FormControl.render]
[/#macro]
