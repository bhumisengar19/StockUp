export function initInteractions() {
  if (typeof window === 'undefined' || document.getElementById('cursor-glow')) return;

  // 1. Soft Cursor Glow
  const glow = document.createElement('div');
  glow.id = 'cursor-glow';
  glow.className = 'cursor-glow';
  document.body.appendChild(glow);

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let glowX = mouseX;
  let glowY = mouseY;

  // Interaction State
  let currentCard: HTMLElement | null = null;
  let currentBtn: HTMLElement | null = null;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // 2. Magnetic Buttons (primary/CTA buttons)
    const btn = e.target instanceof Element ? (e.target.closest('.btn-primary') as HTMLElement) : null;
    if (btn) {
      if (currentBtn !== btn && currentBtn) currentBtn.style.transform = '';
      currentBtn = btn;
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const moveX = (x / (rect.width / 2)) * 8; // max 8px
      const moveY = (y / (rect.height / 2)) * 8; // max 8px
      btn.style.transform = `translate3d(${moveX}px, ${moveY}px, 0) scale(1.05)`;
    } else if (currentBtn) {
      currentBtn.style.transform = '';
      currentBtn = null;
    }

    // 3. Card Reactive Tilt
    const card = e.target instanceof Element ? (e.target.closest('.card') as HTMLElement) : null;
    if (card && card.classList.contains('group')) { // Targeting interactive cards
      if (currentCard !== card && currentCard) currentCard.style.transform = '';
      currentCard = card;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -5; // max 5deg tilt
      const rotateY = ((x - centerX) / centerX) * 5;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    } else if (currentCard) {
      currentCard.style.transform = '';
      currentCard = null;
    }
  }, { passive: true });

  // Button clicks down/up
  window.addEventListener('mousedown', (e) => {
    const btn = e.target instanceof Element ? (e.target.closest('.btn') as HTMLElement) : null;
    if (btn) btn.style.transform = 'scale(0.97)';
  });

  window.addEventListener('mouseup', (e) => {
    const btn = e.target instanceof Element ? (e.target.closest('.btn') as HTMLElement) : null;
    if (btn) {
      if (btn.classList.contains('btn-primary')) {
        // Return to magnetic scale if primary
        btn.style.transform = 'scale(1.05)';
      } else {
        btn.style.transform = '';
      }
    }
  });

  window.addEventListener('mouseleave', () => {
    if (currentCard) { currentCard.style.transform = ''; currentCard = null; }
    if (currentBtn) { currentBtn.style.transform = ''; currentBtn = null; }
  });

  // Render Loop: Smooth Glow & Parallax
  function render() {
    // Glow easing
    glowX += (mouseX - glowX) * 0.15;
    glowY += (mouseY - glowY) * 0.15;
    glow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0)`;

    // 4. Background Parallax
    document.querySelectorAll('.parallax-layer').forEach((el) => {
      const htmlEl = el as HTMLElement;
      const depth = parseFloat(htmlEl.dataset.depth || '0.02');
      const moveX = (window.innerWidth / 2 - mouseX) * depth;
      const moveY = (window.innerHeight / 2 - mouseY) * depth;
      htmlEl.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
    });

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}
