[#import "../forms-control/forms-control.ftlh" as FormControl]

[#macro render field errors={}]
  [@FormControl.render field errors "fieldset"]
    <div class="forms--radiobuttons-options">
      [#list field.options![] as option]
        [#assign id=field.id + "-" + option_index]
        <div class="forms--radiobutton-option">
          <input
            type="radio"
            id="${id}"
            name="${field.name}"
            value="${option.value}"
            [#if option.checked!false]checked[/#if] />

          <label for="${id}">
            ${option.text}
          </label>
        </div>
      [/#list]
    </div>
  [/@FormControl.render]
[/#macro]

