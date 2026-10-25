(function () {
  'use strict';

  var EMAIL = 'margolis@africaonline.co.zw';
  var WA_NUMBER = '263712602630';
  var PRICE_PER_M2 = 15;

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var fmt = function (n) { return n.toLocaleString('en-US'); };

  /* Header: solid on scroll, mobile menu */
  var header = $('.site-header');
  var onScroll = function () { header.classList.toggle('is-solid', window.scrollY > 40); };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  var toggle = $('#navToggle');
  var nav = $('#nav');
  var closeMenu = function () {
    nav.classList.remove('is-open');
    header.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  };
  toggle.addEventListener('click', function () {
    var open = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', open);
    header.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', closeMenu); });

  /* Hero video: make sure it plays on mobile browsers */
  var video = $('.hero-video');
  if (video) {
    video.muted = true;
    var p = video.play();
    if (p && p.catch) p.catch(function () {});
  }

  /* Reveal on scroll */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    $$('.reveal').forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 80 + 'ms';
      io.observe(el);
    });
  } else {
    $$('.reveal').forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Form helpers */
  var form = $('#enquiryForm');
  var setLocation = function (loc) {
    var r = $('input[name="location"][value="' + loc + '"]', form);
    if (r) r.checked = true;
  };
  var setSize = function (size) {
    var sel = $('#fSize');
    var label = fmt(size) + ' m²';
    var match = $$('option', sel).filter(function (o) { return o.value === label; })[0];
    if (!match) {
      match = document.createElement('option');
      match.textContent = label;
      sel.insertBefore(match, sel.lastElementChild);
    }
    sel.value = label;
  };
  var goToForm = function () {
    $('#enquire').scrollIntoView({ behavior: 'smooth' });
    setTimeout(function () { $('#fName').focus({ preventScroll: true }); }, 700);
  };

  /* Location cards */
  $$('[data-pick]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var loc = btn.getAttribute('data-pick');
      setLocation(loc);
      setSize(loc === 'Nyamazi' ? 4000 : 2000);
      goToForm();
    });
  });

  /* Estimator */
  var est = { loc: 'Juliasdale', size: 2000 };
  var range = $('#sizeRange');
  var renderEst = function () {
    var total = est.size * PRICE_PER_M2;
    range.value = est.size;
    range.disabled = est.loc === 'Nyamazi';
    range.style.setProperty('--fill', ((est.size - 2000) / 2000 * 100) + '%');
    $('#sizeOut').textContent = fmt(est.size) + ' m²';
    $('#estTotal').textContent = '$' + fmt(total);
    $('#estCalc').textContent = fmt(est.size) + ' m² × $' + PRICE_PER_M2 + ' per m²';
    $('#estNote').textContent = est.loc === 'Nyamazi'
      ? 'Nyamazi stands are a standard 4,000 m².'
      : 'Juliasdale stands range from 2,000 m². Slide to compare sizes.';
    $('#estCta').textContent = 'Enquire about this ' + est.loc + ' stand';
    $$('.seg-btn').forEach(function (b) {
      var on = b.getAttribute('data-est') === est.loc;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-checked', String(on));
    });
  };
  $$('.seg-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      est.loc = b.getAttribute('data-est');
      est.size = est.loc === 'Nyamazi' ? 4000 : Math.min(est.size, 4000);
      renderEst();
    });
  });
  range.addEventListener('input', function () { est.size = parseInt(range.value, 10); renderEst(); });
  $('#estCta').addEventListener('click', function (e) {
    e.preventDefault();
    setLocation(est.loc);
    setSize(est.size);
    goToForm();
  });
  renderEst();

  /* Gallery lightbox */
  var items = $$('.g-item');
  var lb = $('#lightbox');
  var lbImg = $('#lbImg');
  var lbCap = $('#lbCap');
  var current = 0;
  var lastFocus = null;
  var show = function (i) {
    current = (i + items.length) % items.length;
    var img = $('img', items[current]);
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbCap.textContent = $('.g-cap', items[current]).textContent + '  ·  ' + (current + 1) + ' / ' + items.length;
  };
  var openLb = function (i) {
    lastFocus = document.activeElement;
    show(i);
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    $('.lb-close', lb).focus();
  };
  var closeLb = function () {
    lb.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  };
  items.forEach(function (it, i) { it.addEventListener('click', function () { openLb(i); }); });
  $('.lb-close', lb).addEventListener('click', closeLb);
  $('.lb-prev', lb).addEventListener('click', function () { show(current - 1); });
  $('.lb-next', lb).addEventListener('click', function () { show(current + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowRight') show(current + 1);
    if (e.key === 'ArrowLeft') show(current - 1);
  });
  var touchX = null;
  lb.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) show(current + (dx < 0 ? 1 : -1));
    touchX = null;
  });

  /* Enquiry form → prewritten email / WhatsApp */
  var collect = function () {
    var d = new FormData(form);
    return {
      name: (d.get('name') || '').trim(),
      phone: (d.get('phone') || '').trim(),
      email: (d.get('email') || '').trim(),
      based: d.get('based'),
      location: d.get('location'),
      purpose: d.getAll('purpose'),
      size: d.get('size'),
      timeline: d.get('timeline'),
      message: (d.get('message') || '').trim(),
      brochure: d.get('brochure') === 'yes'
    };
  };
  var validate = function (v) {
    var err = $('#formError');
    var bad = [];
    $('#fName').classList.toggle('is-invalid', !v.name);
    $('#fPhone').classList.toggle('is-invalid', !v.phone);
    if (!v.name) bad.push('your name');
    if (!v.phone) bad.push('a phone or WhatsApp number');
    if (bad.length) {
      err.textContent = 'Please add ' + bad.join(' and ') + ' so we can get back to you.';
      err.hidden = false;
      (v.name ? $('#fPhone') : $('#fName')).focus();
      return false;
    }
    err.hidden = true;
    return true;
  };
  var buildBody = function (v) {
    var lines = [
      'Hello Margolis Real Estate,',
      '',
      'I would like to enquire about a holiday home stand in Nyanga.',
      '',
      'Preferred location: ' + v.location,
      'Stand size: ' + v.size,
      'Intended use: ' + (v.purpose.length ? v.purpose.join(', ') : 'Not specified'),
      'Buying timeline: ' + v.timeline,
      '',
      'Name: ' + v.name,
      'Phone / WhatsApp: ' + v.phone
    ];
    if (v.email) lines.push('Email: ' + v.email);
    lines.push('Based in: ' + v.based);
    if (v.message) lines.push('', v.message);
    if (v.brochure) lines.push('', 'Please also send me your company profile and brochure.');
    lines.push('', 'Kind regards,', v.name);
    return lines.join('\n');
  };

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = collect();
    if (!validate(v)) return;
    var subject = 'Nyanga Stand Enquiry - ' + v.location + ' - ' + v.name;
    var href = 'mailto:' + EMAIL +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(buildBody(v).replace(/\n/g, '\r\n'));
    window.location.href = href;
    $('#formOk').hidden = false;
  });

  $('#sendWa').addEventListener('click', function () {
    var v = collect();
    if (!validate(v)) return;
    window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(buildBody(v)), '_blank', 'noopener');
  });

  ['fName', 'fPhone'].forEach(function (id) {
    $('#' + id).addEventListener('input', function () { this.classList.remove('is-invalid'); });
  });

  /* Floating WhatsApp: show label briefly after load */
  var wa = $('.wa-float');
  setTimeout(function () { wa.classList.add('show-label'); }, 1800);
  setTimeout(function () { wa.classList.remove('show-label'); }, 6500);
})();
