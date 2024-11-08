[#macro render field errors={}]
  <div class="forms--radiobuttons">
    <fieldset>
      [#if field.label?has_content]
        <legend>${field.label}</legend>
      [/#if]

      [#if field.helpText?has_content]
        <div id="${field.id}-help-text">
          ${field.helpText}
        </div>
      [/#if]

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
    </fieldset>
  </div>
[/#macro]

