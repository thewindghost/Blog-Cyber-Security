// 1. Hiện nút scroll to top nếu scroll xuống
function scrollHandler() {

  const btn = document.getElementById('scrollToTop');
  if (!btn) return;

  const y = window.scrollY || document.documentElement.scrollTop;
  btn.style.display = y > 200 ? 'block' : '';

}

function scrollToTop() {
  window.scrollTo({
     top: 0,
     behavior: 'smooth'
  });

}

// ---------------------------------------------------------------------------
// 2. back về home
function toggleBackButton() {

  const btn = document.getElementById('backHome');
  if (!btn) return;

  btn.style.display = window.location.hash ? 'block' : '';

}
