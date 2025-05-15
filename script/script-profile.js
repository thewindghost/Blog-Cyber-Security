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

// matrix code pen binary
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
const FONT_SIZE = 14;


let width, height;
let drops = [];

const words = [
  'XSS', 'SSRF', 'LFI', 'RCE', 'Open Redirect',
  'Cache Poisoning', 'PWNED', 'SQL Injection',
  'AUTH BYPASS', 'OS Command Injection', 'RFI',
  'Access Control', 'CSRF Injection', 'Host Header Injection'
];

// Khoảng cách theo cột (px)
const columnWidth = 120;
// Khoảng cách hàng (khoảng cách giữa các lần in cùng một từ)
const rowHeight = 40;

function resize() {

  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;

  const colCount = Math.floor(width / columnWidth);
  drops = [];

  for (let i = 0; i < colCount; i++) {

     drops.push({

        x: i * columnWidth + 10, // offset 10px để không sát mép
        y: Math.random() * -1000, // random bắt đầu trên màn hình
        word: words[Math.floor(Math.random() * words.length)]

     });
  }
}

function draw() {
  // làm mờ khung cũ để tạo trail
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#0F0';
  ctx.font = `${FONT_SIZE}px monospace`; // <-- dùng FONT_SIZE thay vì '20px'
  ctx.textBaseline = 'top';

  drops.forEach(drop => {
     ctx.fillText(drop.word, drop.x, drop.y);

     // di chuyển từ xuống
     drop.y += rowHeight;

     // nếu đã rơi hết thì reset lên trên và pick word mới
     if (drop.y > height) {

        drop.y = Math.random() * -500;
        drop.word = words[Math.floor(Math.random() * words.length)];

     }
  });
}

window.addEventListener('resize', resize);
resize();
setInterval(draw, 100); // 200ms cho tốc độ chậm lại