// Mobile nav toggle
const toggle = document.getElementById('navToggle');
const mobile = document.getElementById('navMobile');
if (toggle && mobile) {
  toggle.addEventListener('click', () => {
    const open = mobile.classList.toggle('open');
    mobile.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
  });
  // close the menu after tapping a link
  mobile.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => {
      mobile.classList.remove('open');
      mobile.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
    })
  );
}

// Current year in the footer
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

// Demo contact form (no backend on GitHub Pages)
const form = document.getElementById('contactForm');
const note = document.getElementById('formNote');
if (form && note) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    note.hidden = false;
    form.reset();
  });
}
