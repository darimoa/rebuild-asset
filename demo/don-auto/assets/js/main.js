/* Don's Auto Upholstery — 향상 기능 전용.
   이 파일이 없어도 사이트의 모든 콘텐츠·링크·폼이 동작한다. */
(function () {
  'use strict';

  /* ---- 모바일 내비 ---- */
  /* 열고 닫는 동작 자체는 CSS(.nav-checkbox:checked ~ .site-nav)가 한다.
     JS는 스크린리더용 상태와 Esc 닫기만 얹는다. */
  var navToggle = document.getElementById('navtoggle');
  var navLabel = document.querySelector('.nav-toggle');
  if (navToggle && navLabel) {
    navToggle.setAttribute('aria-controls', 'nav');
    navToggle.setAttribute('aria-expanded', String(navToggle.checked));
    navToggle.addEventListener('change', function () {
      navToggle.setAttribute('aria-expanded', String(navToggle.checked));
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navToggle.checked) {
        navToggle.checked = false;
        navToggle.dispatchEvent(new Event('change'));
        navLabel.focus();
      }
    });
  }

  /* ---- 견적 위저드 ---- */
  var WEB3FORMS_KEY = ''; // web3forms.com 무료 키를 여기 넣는다. 비워두면 메일 앱 폴백.
  var form = document.getElementById('quote');
  if (!form) return;

  function addHidden(name, value) {
    var el = document.createElement('input');
    el.type = 'hidden';
    el.name = name;
    el.value = value;
    form.appendChild(el);
  }

  // 키가 있을 때만 Web3Forms API로 전환한다. 비어 있으면 HTML의 mailto 폴백을 그대로 둔다
  // (no-JS 경로도 항상 이 mailto로 제출되므로, JS가 켜졌을 때 기본값을 바꿔서는 안 된다).
  if (WEB3FORMS_KEY) {
    form.setAttribute('action', 'https://api.web3forms.com/submit');
    form.setAttribute('enctype', 'multipart/form-data');
    addHidden('access_key', WEB3FORMS_KEY);
    addHidden('subject', 'Free estimate request — dons-upholstery.com');
    addHidden('botcheck', '');
  }

  var status = form.querySelector('.wz-status');
  var stepList = form.querySelector('.wz-steps');
  var allSteps = [].slice.call(form.querySelectorAll('.wz-step'));
  var backBtn = form.querySelector('[data-wz="back"]');
  var nextBtn = form.querySelector('[data-wz="next"]');
  var submitBtn = form.querySelector('[data-wz="submit"]');

  form.classList.add('js');
  // JS가 단계별로 검사하므로 네이티브 검증을 끈다.
  // JS가 없을 때는 markup에 novalidate가 없어 브라우저 기본 검증이 그대로 동작한다.
  form.setAttribute('novalidate', '');

  // 현재 흐름 = 1단계 + (선택된 카테고리에 맞는 2단계) + 3단계 + 4단계
  function flow() {
    var cat = form.querySelector('input[name="category"]:checked');
    var want = cat ? cat.value.toLowerCase() : null;
    return allSteps.filter(function (s) {
      var f = s.getAttribute('data-for');
      return !f || f === want;
    });
  }

  var index = 0;

  function render() {
    var steps = flow();
    if (index >= steps.length) index = steps.length - 1;
    allSteps.forEach(function (s) { s.classList.remove('active'); });
    steps[index].classList.add('active');

    [].slice.call(stepList.children).forEach(function (li, i) {
      if (i === index) li.setAttribute('aria-current', 'step');
      else li.removeAttribute('aria-current');
    });

    backBtn.style.display = index === 0 ? 'none' : '';
    var last = index === steps.length - 1;
    nextBtn.style.display = last ? 'none' : '';
    submitBtn.parentNode.style.display = last ? '' : 'none';
  }

  function valid() {
    var step = flow()[index];
    if (step.querySelector('input[name="category"]')) {
      if (!form.querySelector('input[name="category"]:checked')) {
        say('Pick what the job is on.', 'error');
        var firstRadio = form.querySelector('input[name="category"]');
        if (firstRadio) firstRadio.focus();
        return false;
      }
    }
    var name = step.querySelector('input[name="name"]');
    if (name) {
      if (!name.value.trim()) { say('Enter your name.', 'error'); name.focus(); return false; }
      var phone = form.querySelector('input[name="phone"]').value.trim();
      var email = form.querySelector('input[name="email"]').value.trim();
      if (!phone && !email) { say('Enter a phone number or an email.', 'error'); return false; }
    }
    say('', '');
    return true;
  }

  function goToStep(i) {
    index = i;
    render();
    focusStep();
  }

  function focusStep() {
    var s = flow()[index];
    if (!s) return;
    s.setAttribute('tabindex', '-1');
    s.focus();
  }

  // 제출 직전 폼 전체를 본다. 단계 검사(valid)와 달리 어느 단계에 있든 같은 결과를 낸다.
  function validateAll() {
    var steps = flow();
    if (!form.querySelector('input[name="category"]:checked')) {
      goToStep(0);
      say('Pick what the job is on.', 'error');
      var firstRadio = form.querySelector('input[name="category"]');
      if (firstRadio) firstRadio.focus();
      return false;
    }
    var nameEl = form.querySelector('input[name="name"]');
    var phone = form.querySelector('input[name="phone"]').value.trim();
    var email = form.querySelector('input[name="email"]').value.trim();
    if (!nameEl.value.trim()) {
      goToStep(steps.length - 1);
      say('Enter your name.', 'error');
      nameEl.focus();
      return false;
    }
    if (!phone && !email) {
      goToStep(steps.length - 1);
      say('Enter a phone number or an email.', 'error');
      form.querySelector('input[name="phone"]').focus();
      return false;
    }
    say('', '');
    return true;
  }

  function say(msg, state) {
    status.textContent = msg;
    if (state) status.setAttribute('data-state', state);
    else status.removeAttribute('data-state');
  }

  nextBtn.addEventListener('click', function () {
    if (!valid()) return;
    index += 1;
    render();
    focusStep();
  });
  backBtn.addEventListener('click', function () {
    index = Math.max(0, index - 1);
    render();
    focusStep();
  });
  form.addEventListener('change', function (e) {
    if (e.target.name !== 'category') return;
    var want = e.target.value.toLowerCase();
    allSteps.forEach(function (s) {
      var f = s.getAttribute('data-for');
      if (f && f !== want) {
        var boxes = s.querySelectorAll('input[type="checkbox"]');
        for (var i = 0; i < boxes.length; i++) boxes[i].checked = false;
      }
    });
    render();
  });

  /* ---- 제출 ---- */
  function mailtoFallback(data) {
    var lines = [];
    ['category', 'item', 'details', 'name', 'phone', 'email', 'notes'].forEach(function (k) {
      var v = data.get(k);
      if (v) lines.push(k + ': ' + v);
    });
    var work = data.getAll('work');
    if (work.length) lines.push('work: ' + work.join(', '));
    lines.push('', '(Photos could not be attached automatically — please attach them to this email.)');
    window.location.href =
      'mailto:DonsAutoUph@gmail.com?subject=' +
      encodeURIComponent('Free estimate request') +
      '&body=' + encodeURIComponent(lines.join('\n'));
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var steps = flow();
    // 텍스트 입력에서 Enter를 누르면 브라우저가 제출을 일으킨다.
    // 마지막 단계가 아니면 보내지 말고 다음 단계로 넘긴다.
    if (index < steps.length - 1) {
      if (valid()) { index += 1; render(); focusStep(); }
      return;
    }
    if (!validateAll()) return;
    var data = new FormData(form);

    if (!WEB3FORMS_KEY) {
      say('Opening your email app. If nothing happens, email DonsAutoUph@gmail.com or call 360-859-3411.', 'ok');
      mailtoFallback(data);
      return;
    }

    say('Sending…', '');
    submitBtn.disabled = true;
    fetch('https://api.web3forms.com/submit', { method: 'POST', body: data })
      .then(function (r) { return r.json(); })
      .then(function (r) {
        if (!r.success) throw new Error(r.message || 'failed');
        form.querySelectorAll('.wz-step, .wz-steps, .wz-nav').forEach(function (n) { n.style.display = 'none'; });
        submitBtn.parentNode.style.display = 'none';
        say('Thanks — we got your request and will get back to you with a free estimate.', 'ok');
      })
      .catch(function () {
        submitBtn.disabled = false;
        say('Could not send. Opening your email app instead.', 'error');
        mailtoFallback(data);
      });
  });

  render();
})();
