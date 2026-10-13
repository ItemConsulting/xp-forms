[#macro errorSummary errors pageId]
  [#list errors!{}]
    <ds-error-summary class="ds-error-summary">
      <h2>${portal.localize("part.formView.thereIsAProblem")}</h2>

      <ul class="ds-list">
        [#items as key, values]
          [#list values![] as value]
            <li>
              <a
                class="ds-link"
                data-color="neutral"
                href="#${pageId}-${key}"
                data-turbo="false">

                ${value}
              </a>
            </li>
          [/#list]
        [/#items]
      </ul>
    </ds-error-summary>
  [/#list]
[/#macro]

[#macro spamPrevention config]
  [#switch config.type]
    [#case "honeypot"]
      [#assign fieldId = config.honeypotFiledName!'website' ]
      <div class="input-field-p">
        <label for="${fieldId}">Nettside</label>
        <input
          name="${fieldId}"
          type="text"
          id="${fieldId}"
          value=""
          autocomplete="off" />
      </div>
      [#break]
    [#case "turnstile"]
      <div
        class="cf-turnstile"
        data-sitekey="${config.turnstileSiteKey}"
        data-pending-text="${portal.localize("part.formView.verify.pending")}"></div>
      <div class="forms-turnstile-status" role="status"></div>
      [#break]
  [/#switch]
[/#macro]
