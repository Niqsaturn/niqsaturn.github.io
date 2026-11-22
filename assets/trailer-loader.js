(() => {
  'use strict';
  const player = document.querySelector('[data-trailer-player]');
  const status = document.querySelector('[data-trailer-status]');
  if (!player) return;
  // Keep the local, editable Windows draft functional without an HTTP server.
  if (location.protocol === 'file:') {
    player.src = '/En-Route/assets/enroute-blitzkrieg-trailer-v0.2.20.mp4';
    player.load();
    return;
  }
  let inFlight = null, objectUrl = null;
  async function prepareTrailer() {
    if (inFlight) return inFlight;
    inFlight = (async () => {
      try {
        if (status) status.textContent = 'Loading trailer with original music…';
        const manifestResponse = await fetch('/En-Route/assets/trailer-parts/manifest.json', { cache: 'force-cache' });
        if (!manifestResponse.ok) throw new Error('Trailer manifest unavailable');
        const manifest = await manifestResponse.json();
        const chunks = await Promise.all(manifest.parts.map(async part => {
          const response = await fetch('/En-Route/assets/trailer-parts/' + part.file, { cache: 'force-cache' });
          if (!response.ok) throw new Error('Trailer part unavailable');
          const data = await response.arrayBuffer();
          if (data.byteLength !== part.bytes) throw new Error('Trailer part is incomplete');
          return data;
        }));
        const full = new Blob(chunks, { type: 'video/mp4' });
        if (full.size !== manifest.bytes) throw new Error('Trailer size mismatch');
        if (crypto.subtle) {
          const digest = await crypto.subtle.digest('SHA-256', await full.arrayBuffer());
          const hex = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
          if (hex !== manifest.sha256) throw new Error('Trailer integrity verification failed');
        }
        objectUrl = URL.createObjectURL(full);
        player.src = objectUrl;
        player.load();
        if (status) status.textContent = '';
      } catch (error) {
        if (status) status.textContent = 'The trailer is temporarily unavailable.';
        inFlight = null;
      }
    })();
    return inFlight;
  }
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        observer.disconnect();
        void prepareTrailer();
      }
    }, { rootMargin: '800px' });
    observer.observe(player);
  } else {
    void prepareTrailer();
  }
  player.addEventListener('pointerenter', () => { void prepareTrailer(); }, { once: true });
  player.addEventListener('focus', () => { void prepareTrailer(); }, { once: true });
  window.addEventListener('pagehide', () => { if (objectUrl) URL.revokeObjectURL(objectUrl); }, { once: true });
})();
