[#macro render errors pageId]
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
