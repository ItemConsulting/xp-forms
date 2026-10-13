[#import "../input-field/input-field.ftlh" as Field]

[#macro render field errors={}]
  <fieldset class="ds-fieldset">
    <legend class="ds-label" data-weight="medium">${field.label}</legend>

    [#if field.helpText?has_content]
      <p class="ds-paragraph" data-variant="default">
        ${field.helpText?no_esc}
      </p>
    [/#if]

    [@Field.renderErrorList field errors /]

    [#list field.options![] as option]
      [#assign id=field.id + "-" + option_index]
      <div class="ds-field">
        <input
          type="radio"
          class="ds-input"
          id="${id}"
          name="${field.name}"
          value="${option.value}"
          [#if errors[field.name]??]aria-invalid="true"[/#if]
          [#if option.checked!false]checked[/#if] />

        <label
          class="ds-label"
          for="${id}">

          ${option.text}
        </label>
      </div>
    [/#list]
 </fieldset>
[/#macro]

