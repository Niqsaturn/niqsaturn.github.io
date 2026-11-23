(() => {
  'use strict';
  const startForm = document.getElementById('signup-form');
  const verifyForm = document.getElementById('verify-form');
  const status = document.getElementById('signup-feedback');
  const success = document.getElementById('signup-complete');
  if (!startForm || !verifyForm || !status || !success) return;
  const KEY = 'enroute-web-signup-binding';
  const PENDING = 'enroute-web-signup-pending';
  const API_ORIGIN = window.EnRouteApiRoot || 'https://en-route.ringtail-anoles.ts.net:8443/enroute-account/api';
  const API_ROUTES = Object.freeze({
    start: '/auth/register',
    verify: '/auth/register/verify',
    resend: '/auth/register/resend'
  });
  const randomBinding = () => {
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  };
  const getBinding = () => {
    let existing = sessionStorage.getItem(KEY);
    if (!/^[A-Za-z0-9_-]{43}$/.test(existing || '')) {
      existing = randomBinding();
      sessionStorage.setItem(KEY, existing);
    }
    return existing;
  };
  const display = text => { status.textContent = text; };
  const friendly = (error, fallback) => {
    const message = String(error?.message || '');
    if (/Failed to fetch|NetworkError|Load failed/i.test(message))
      return 'Unable to reach the verification service from this browser. Some VPNs or browser network protections can block account requests. Try another device or network.';
    return message || fallback;
  };
  const buttons = (form, busy) => {
    for (const el of form.querySelectorAll('button')) el.disabled = busy;
    form.setAttribute('aria-busy', String(busy));
  };
  const api = async (action, values) => {
    if (location.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(location.hostname))
      throw new Error('Signup requires an HTTPS website.');
    if (!Object.hasOwn(API_ROUTES, action)) throw new Error('Unsupported signup action.');
    const response = await fetch(API_ORIGIN + API_ROUTES[action], {
      mode: 'cors',
      referrerPolicy: 'no-referrer',
      method: 'POST',
      credentials: 'omit',
      cache: 'no-store',
      redirect: 'error',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...values, binding: getBinding() }),
      signal: AbortSignal.timeout(12000)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(response.status === 429 ? 'Too many attempts. Try again later.' :
        data.message || data.error || 'Unable to complete this request. Try again later.');
    }
    return data;
  };
  const verifyStep = () => {
    startForm.hidden = true;
    verifyForm.hidden = false;
    verifyForm.querySelector('input')?.focus({preventScroll: true});
  };
  if (sessionStorage.getItem(PENDING) === '1' && sessionStorage.getItem(KEY)) verifyStep();
  startForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (!startForm.reportValidity()) return;
    const data = Object.fromEntries(new FormData(startForm));
    if (data.password !== data.passwordConfirmation) { display('Passwords must match.'); return; }
    buttons(startForm, true);
    display('Sending a verification email if this username and address are available…');
    try {
      await api('start', { username: data.username, email: data.email, password: data.password });
      sessionStorage.setItem(PENDING, '1');
      startForm.reset();
      verifyStep();
      display('If eligible, a secure verification code is on its way. Check your email.');
    } catch (error) { display(friendly(error, 'Signup unavailable.')); }
    finally { buttons(startForm, false); }
  });
  verifyForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (!verifyForm.reportValidity()) return;
    buttons(verifyForm, true);
    display('Verifying your account…');
    try {
      const data = await api('verify', { code: verifyForm.elements.code.value.trim() });
      if (!data.verified) throw new Error('The server did not confirm account verification.');
      verifyForm.reset();
      verifyForm.hidden = true;
      success.hidden = false;
      sessionStorage.removeItem(KEY);
      sessionStorage.removeItem(PENDING);
      display('Account verified. You can now sign in from the game launcher.');
    } catch (error) { display(friendly(error, 'Verification unavailable.')); }
    finally { buttons(verifyForm, false); }
  });
  document.getElementById('resend-verify')?.addEventListener('click', async event => {
    const resendButton = event.currentTarget;
    resendButton.disabled = true;
    try {
      await api('resend', {});
      display('If this request is eligible, another verification email is on its way.');
    } catch (error) { display(friendly(error, 'Resend unavailable.')); }
    finally { setTimeout(() => { resendButton.disabled = false; }, 60000); }
  });
  document.getElementById('restart-signup')?.addEventListener('click', () => {
    sessionStorage.removeItem(KEY);
    sessionStorage.removeItem(PENDING);
    startForm.hidden = false;
    verifyForm.hidden = true;
    verifyForm.reset();
    display('');
    document.getElementById('register-name')?.focus({preventScroll:true});
  });
})();