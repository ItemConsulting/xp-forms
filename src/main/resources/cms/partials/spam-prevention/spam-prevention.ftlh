[#macro render config]
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
