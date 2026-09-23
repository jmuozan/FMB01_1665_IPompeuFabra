/* TRANSLATE BUTTON (CA -> ES) Google website-translator */

(function () {
  const COOKIE_NAME = 'googtrans';
  const PAGE_LANG = 'ca';
  const TARGET_LANG = 'es';

  function getCookie(name) {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  function setCookie(value) {
    const expires = 'expires=Fri, 31 Dec 9999 23:59:59 GMT';
    document.cookie = `${COOKIE_NAME}=${value}; path=/; ${expires}`;
    const host = window.location.hostname;
    if (host && host !== 'localhost') {
      document.cookie = `${COOKIE_NAME}=${value}; path=/; domain=${host}; ${expires}`;
    }
  }

  function clearCookie() {
    const expired = 'expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = `${COOKIE_NAME}=; path=/; ${expired}`;
    const host = window.location.hostname;
    if (host && host !== 'localhost') {
      document.cookie = `${COOKIE_NAME}=; path=/; domain=${host}; ${expired}`;
    }
  }

  function isTranslated() {
    const value = getCookie(COOKIE_NAME);
    return !!value && value.indexOf(`/${PAGE_LANG}/${TARGET_LANG}`) !== -1;
  }

  function injectWidget() {
    if (document.getElementById('google_translate_element')) return;

    const container = document.createElement('div');
    container.id = 'google_translate_element';
    document.body.appendChild(container);

    window.googleTranslateElementInit = function () {
      new google.translate.TranslateElement(
        { pageLanguage: PAGE_LANG, includedLanguages: TARGET_LANG, autoDisplay: false },
        'google_translate_element'
      );
    };

    const script = document.createElement('script');
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.body.appendChild(script);
  }

  function updateButton(btn) {
    const translated = isTranslated();
    btn.textContent = translated ? 'CA' : 'ES';
    const label = translated ? 'Tornar al català' : 'Traduir al castellà';
    btn.setAttribute('aria-label', label);
    btn.title = label;
  }

  function createButton() {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'translate-btn';
    updateButton(btn);
    btn.addEventListener('click', () => {
      if (isTranslated()) {
        clearCookie();
      } else {
        setCookie(`/${PAGE_LANG}/${TARGET_LANG}`);
      }
      window.location.reload();
    });
    document.body.appendChild(btn);
  }

  document.addEventListener('DOMContentLoaded', () => {
    injectWidget();
    createButton();
  });
})();
