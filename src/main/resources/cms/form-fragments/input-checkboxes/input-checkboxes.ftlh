[#import "../fields/fields.ftlh" as Field]

[#macro render field errors={}]
  [#assign ariaDescribedBy=Field.ariaDescribedBy(field, errors)]

  <fieldset
    class="ds-fieldset"
    [#if ariaDescribedBy?has_content]aria-describedby="${ariaDescribedBy}"[/#if]>

    <legend class="ds-label">${field.label}</legend>

    [#if field.helpText?has_content]
      <p id="${field.id}-help-text" class="ds-paragraph" data-variant="default">
        ${field.helpText?no_esc}
      </p>
    [/#if]

    [@Field.renderErrorList field errors /]

    [#list field.options![] as option]
      [#assign id=field.id + "-" + option_index]
      <div class="ds-field">
        <input
          type="checkbox"
          class="ds-input"
          id="${id}"
          name="${field.name}"
          value="${option.value}"
          [#if (field.required!false) && (field.options![])?size == 1]aria-required="true"[/#if]
          [#if errors[field.name]??]aria-invalid="true"[/#if]
          [#if option.checked!false]checked[/#if] />

        <label
          for="${id}"
          class="ds-label"
          data-weight="regular">

          ${option.text}
        </label>
      </div>
    [/#list]
  </fieldset>
[/#macro]
