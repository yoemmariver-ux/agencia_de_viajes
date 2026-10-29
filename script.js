/* ===== CONFIGURACIÓN: cambiá estos datos por los de tu agencia ===== */
const WHATSAPP = '5493834000000';              // código país + característica + número, sin + ni espacios
const FECHA_FIN_OFERTA = '2026-12-15T23:59:59'; // fin de la cuenta regresiva
/* ==================================================================== */

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Año del footer y botón flotante */
$('#year').textContent = new Date().getFullYear();
$('#waFloat').href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Hola, quiero consultar por un viaje')}`;

/* Menú móvil */
const toggle = $('#navToggle'), menu = $('#menu');
toggle.addEventListener('click', () => {
  const abierto = menu.classList.toggle('open');
  toggle.setAttribute('aria-expanded', abierto);
});
$$('#menu a').forEach(a => a.addEventListener('click', () => {
  menu.classList.remove('open');
  toggle.setAttribute('aria-expanded', false);
}));

/* Barra de navegación y parallax del hero */
const nav = $('#nav'), capas = $$('[data-speed]');
function alScroll() {
  const y = window.scrollY;
  nav.classList.toggle('scrolled', y > 40);
  if (!reducir && y < window.innerHeight * 1.2) {
    capas.forEach(c => c.style.transform = `translateY(${y * c.dataset.speed}px)`);
  }
}
window.addEventListener('scroll', alScroll, { passive: true });
alScroll();

/* Efecto de profundidad con el mouse en el sol */
const sol = $('circle[data-speed="0.18"]');
if (!reducir && sol) {
  $('.hero').addEventListener('mousemove', e => {
    const x = (e.clientX / window.innerWidth - 0.5) * 30;
    sol.style.translate = `${x}px 0`;
  });
}

/* Aparición de secciones al hacer scroll */
const aparecer = new IntersectionObserver((items) => {
  items.forEach(i => { if (i.isIntersecting) { i.target.classList.add('in'); aparecer.unobserve(i.target); } });
}, { threshold: .15 });
$$('.card, .perks > div, .stats > div, .contact > *').forEach(el => { el.classList.add('reveal'); aparecer.observe(el); });

/* Filtros de destinos */
$$('.chip').forEach(chip => chip.addEventListener('click', () => {
  $$('.chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  const f = chip.dataset.filter;
  $$('.card').forEach(card => {
    card.classList.toggle('hide', f !== 'todos' && !card.dataset.cat.split(' ').includes(f));
  });
}));

/* Inclinación 3D de las tarjetas (solo con mouse) */
if (!reducir && window.matchMedia('(hover:hover)').matches) {
  $$('.card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => card.style.transform = '');
  });
}

/* Botón "Consultar": preselecciona el destino en el formulario */
$$('[data-reservar]').forEach(btn => btn.addEventListener('click', () => {
  $('#destino').value = btn.closest('.card').dataset.dest;
  $('#contacto').scrollIntoView({ behavior: reducir ? 'auto' : 'smooth' });
  setTimeout(() => $('#nombre').focus({ preventScroll: true }), 600);
}));

/* Cuenta regresiva */
const fin = new Date(FECHA_FIN_OFERTA).getTime();
const dos = n => String(n).padStart(2, '0');
function cuenta() {
  const t = Math.max(0, fin - Date.now());
  $('#cd-d').textContent = dos(Math.floor(t / 864e5));
  $('#cd-h').textContent = dos(Math.floor(t % 864e5 / 36e5));
  $('#cd-m').textContent = dos(Math.floor(t % 36e5 / 6e4));
  $('#cd-s').textContent = dos(Math.floor(t % 6e4 / 1e3));
}
cuenta();
setInterval(cuenta, 1000);

/* Contadores animados */
const contar = new IntersectionObserver((items) => {
  items.forEach(i => {
    if (!i.isIntersecting) return;
    const el = i.target, meta = +el.dataset.count, suf = el.dataset.suffix || '';
    if (reducir) { el.textContent = meta.toLocaleString('es-AR') + suf; contar.unobserve(el); return; }
    const t0 = performance.now(), dur = 1600;
    (function paso(t) {
      const p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(meta * (1 - Math.pow(1 - p, 3))).toLocaleString('es-AR') + suf;
      if (p < 1) requestAnimationFrame(paso);
    })(t0);
    contar.unobserve(el);
  });
}, { threshold: .6 });
$$('[data-count]').forEach(el => contar.observe(el));

/* Slider de opiniones */
const slides = $$('.slide'), dots = $('#dots');
let actual = 0, timer;
slides.forEach((_, i) => {
  const b = document.createElement('button');
  b.setAttribute('aria-label', `Ver opinión ${i + 1}`);
  b.addEventListener('click', () => { ir(i); iniciar(); });
  dots.appendChild(b);
});
function ir(n) {
  actual = (n + slides.length) % slides.length;
  slides.forEach((s, i) => s.classList.toggle('active', i === actual));
  $$('button', dots).forEach((b, i) => b.classList.toggle('on', i === actual));
}
function iniciar() {
  clearInterval(timer);
  if (!reducir) timer = setInterval(() => ir(actual + 1), 5500);
}
ir(0);
iniciar();

/* Formulario → WhatsApp */
$('#form').addEventListener('submit', e => {
  e.preventDefault();
  const nombre = $('#nombre').value.trim();
  const personas = parseInt($('#personas').value, 10);
  const error = $('#error');
  if (!nombre) { error.textContent = 'Escribí tu nombre para poder responderte.'; $('#nombre').focus(); return; }
  if (!personas || personas < 1) { error.textContent = 'Indicá cuántas personas viajan (mínimo 1).'; return; }
  error.textContent = '';
  const msg = `Hola, soy ${nombre}. Quiero un presupuesto para ${$('#destino').value} para ${personas} persona(s).`;
  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
});
