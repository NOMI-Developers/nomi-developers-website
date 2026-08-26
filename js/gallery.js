(function () {
  var lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  var stageImg = document.getElementById('lightboxImg');
  var meta = document.getElementById('lightboxMeta');
  var thumbsWrap = document.getElementById('lightboxThumbs');
  var closeBtn = document.getElementById('lightboxClose');
  var prevBtn = document.getElementById('lightboxPrev');
  var nextBtn = document.getElementById('lightboxNext');

  var currentPhotos = [];
  var currentIndex = 0;
  var lastFocused = null;
  var thumbEls = [];

  // Each .photo-grid on the page is its own gallery — the lightbox only
  // cycles through the photos of whichever grid was clicked.
  var grids = Array.prototype.slice.call(document.querySelectorAll('.photo-grid'));
  grids.forEach(function (grid) {
    var buttons = Array.prototype.slice.call(grid.querySelectorAll('button'));
    if (!buttons.length) return; // placeholder grids have no buttons yet
    var photos = buttons.map(function (btn) {
      var img = btn.querySelector('img');
      return { src: img.src, alt: img.alt };
    });
    buttons.forEach(function (btn, i) {
      btn.addEventListener('click', function () { open(photos, i); });
    });
  });

  function buildThumbs(photos) {
    thumbsWrap.innerHTML = '';
    thumbEls = photos.map(function (photo, i) {
      var t = document.createElement('img');
      t.src = photo.src; t.alt = ''; t.setAttribute('aria-hidden', 'true');
      t.addEventListener('click', function () { show(i); });
      thumbsWrap.appendChild(t);
      return t;
    });
  }

  function show(index) {
    currentIndex = (index + currentPhotos.length) % currentPhotos.length;
    var photo = currentPhotos[currentIndex];
    stageImg.src = photo.src; stageImg.alt = photo.alt;
    meta.textContent = (currentIndex + 1) + ' / ' + currentPhotos.length + (photo.alt ? ' — ' + photo.alt : '');
    thumbEls.forEach(function (t, i) { t.classList.toggle('is-active', i === currentIndex); });
    var activeThumb = thumbEls[currentIndex];
    if (activeThumb && activeThumb.scrollIntoView) activeThumb.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }

  function open(photos, index) {
    currentPhotos = photos;
    buildThumbs(photos);
    lastFocused = document.activeElement;
    show(index);
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function close() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', function () { show(currentIndex - 1); });
  nextBtn.addEventListener('click', function () { show(currentIndex + 1); });

  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) close();
  });

  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(currentIndex - 1);
    else if (e.key === 'ArrowRight') show(currentIndex + 1);
  });

  // basic swipe support on the stage
  var touchStartX = null;
  var stage = lightbox.querySelector('.lightbox-stage');
  stage.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });
  stage.addEventListener('touchend', function (e) {
    if (touchStartX === null) return;
    var dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) {
      show(currentIndex + (dx < 0 ? 1 : -1));
    }
    touchStartX = null;
  }, { passive: true });
})();
