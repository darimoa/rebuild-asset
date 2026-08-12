// 스크롤 등장 (reduced-motion 시 CSS가 비활성이라 그대로 보임)
const els = document.querySelectorAll('.rv');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); } });
  }, { threshold: 0.15 });
  els.forEach(el => io.observe(el));
} else {
  els.forEach(el => el.classList.add('on'));
}

// 현재 페이지 메뉴 표시
const here = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nl a.top').forEach(a => {
  if (a.getAttribute('href').split('#')[0] === here) a.classList.add('here');
});

// 모바일 메뉴: 링크 클릭 시 닫기
const mtoggle = document.getElementById('mtoggle');
if (mtoggle) {
  document.querySelectorAll('.nl a').forEach(a => a.addEventListener('click', () => { mtoggle.checked = false; }));
}

// 데모 폼: 실제 발송 없음
const estform = document.getElementById('estform');
if (estform) {
  estform.addEventListener('submit', e => {
    e.preventDefault();
    document.getElementById('fdone').hidden = false;
    e.target.querySelector('button').disabled = true;
  });
}
