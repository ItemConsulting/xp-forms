[#macro render field errors={}]
  <div class="forms--select">
    <label for="${field.id}">
      ${field.label}
    </label>

    [#if field.helpText?has_content]
      <div id="${field.id}-help-text">
        ${field.helpText}
      </div>
    [/#if]

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
  </div>
[/#macro]
