/* =========================================================================
   Interior Note — shared interactions
   ========================================================================= */
(function(){
  'use strict';
  var SAVE_KEY = 'in_saved_v1';
  var CHECK_KEY = 'in_checks_v1';

  /* ---------- storage helpers ---------- */
  function getSaved(){ try{ return JSON.parse(localStorage.getItem(SAVE_KEY)) || []; }catch(e){ return []; } }
  function setSaved(arr){ try{ localStorage.setItem(SAVE_KEY, JSON.stringify(arr)); }catch(e){} }
  function getChecks(){ try{ return JSON.parse(localStorage.getItem(CHECK_KEY)) || {}; }catch(e){ return {}; } }
  function setChecks(o){ try{ localStorage.setItem(CHECK_KEY, JSON.stringify(o)); }catch(e){} }

  /* ---------- toast ---------- */
  var toastEl, toastTimer;
  function toast(msg){
    if(!toastEl){
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      document.body.appendChild(toastEl);
    }
    toastEl.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' + msg;
    requestAnimationFrame(function(){ toastEl.classList.add('show'); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ toastEl.classList.remove('show'); }, 2400);
  }

  /* ---------- save count badge ---------- */
  function refreshCount(){
    var n = getSaved().length;
    document.querySelectorAll('[data-save-count]').forEach(function(el){
      el.textContent = n;
      el.classList.toggle('show', n > 0);
    });
  }

  /* ---------- bookmark buttons ---------- */
  function initSave(){
    var saved = getSaved();
    document.querySelectorAll('[data-save]').forEach(function(btn){
      var id = btn.getAttribute('data-save');
      if(saved.indexOf(id) > -1) btn.classList.add('saved');
      btn.addEventListener('click', function(e){
        e.preventDefault(); e.stopPropagation();
        var list = getSaved();
        var i = list.indexOf(id);
        if(i > -1){ list.splice(i,1); btn.classList.remove('saved'); toast('Removed from your notes'); }
        else { list.push(id); btn.classList.add('saved'); toast('Saved to your notes'); }
        setSaved(list); refreshCount();
      });
    });
    refreshCount();
  }

  /* ---------- mobile menu ---------- */
  function initMenu(){
    var toggle = document.querySelector('.nav-toggle');
    var menu = document.querySelector('.mobile-menu');
    if(!toggle || !menu) return;
    toggle.addEventListener('click', function(){
      var open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    menu.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){ menu.classList.remove('open'); document.body.style.overflow=''; });
    });
  }

  /* ---------- size / category filter chips ---------- */
  function initFilters(){
    var groups = {};
    document.querySelectorAll('[data-filter-group]').forEach(function(chip){
      var g = chip.getAttribute('data-filter-group');
      (groups[g] = groups[g] || []).push(chip);
      chip.addEventListener('click', function(){
        if(chip.getAttribute('data-filter') === 'all'){
          groups[g].forEach(function(c){ c.classList.remove('active'); });
          chip.classList.add('active');
        } else {
          var allChip = groups[g].find(function(c){ return c.getAttribute('data-filter')==='all'; });
          if(allChip) allChip.classList.remove('active');
          chip.classList.toggle('active');
          var anyOn = groups[g].some(function(c){ return c.getAttribute('data-filter')!=='all' && c.classList.contains('active'); });
          if(!anyOn && allChip) allChip.classList.add('active');
        }
        applyFilters();
      });
    });
    if(Object.keys(groups).length) applyFilters();
  }

  function applyFilters(){
    var active = {};
    document.querySelectorAll('[data-filter-group].active').forEach(function(chip){
      var g = chip.getAttribute('data-filter-group');
      var f = chip.getAttribute('data-filter');
      if(f === 'all') return;
      (active[g] = active[g] || []).push(f);
    });
    var items = document.querySelectorAll('[data-tags]');
    var shown = 0;
    items.forEach(function(item){
      var tags = (item.getAttribute('data-tags')||'').split(/\s+/);
      var match = Object.keys(active).every(function(g){
        return active[g].some(function(f){ return tags.indexOf(f) > -1; });
      });
      item.style.display = match ? '' : 'none';
      if(match) shown++;
    });
    var counter = document.querySelector('[data-result-count]');
    if(counter) counter.textContent = shown;
    var empty = document.querySelector('[data-empty]');
    if(empty) empty.style.display = shown === 0 ? '' : 'none';
  }

  /* ---------- facet checkboxes (search page) ---------- */
  function initFacets(){
    document.querySelectorAll('.facet-opt').forEach(function(opt){
      opt.addEventListener('click', function(){ opt.classList.toggle('on'); applyFacets(); });
    });
    document.querySelectorAll('.switch').forEach(function(sw){
      sw.addEventListener('click', function(){ sw.classList.toggle('on'); applyFacets(); });
    });
    var search = document.querySelector('[data-search-input]');
    if(search) search.addEventListener('input', applyFacets);
  }
  function applyFacets(){
    var active = {};
    document.querySelectorAll('.facet-opt.on').forEach(function(opt){
      var g = opt.getAttribute('data-facet');
      (active[g] = active[g] || []).push(opt.getAttribute('data-val'));
    });
    var renterOnly = false;
    var sw = document.querySelector('.switch[data-facet="renter"]');
    if(sw && sw.classList.contains('on')) renterOnly = true;
    var q = '';
    var search = document.querySelector('[data-search-input]');
    if(search) q = search.value.trim().toLowerCase();

    var shown = 0;
    document.querySelectorAll('[data-tags]').forEach(function(item){
      var tags = (item.getAttribute('data-tags')||'').split(/\s+/);
      var title = (item.getAttribute('data-title')||'').toLowerCase();
      var ok = Object.keys(active).every(function(g){
        return active[g].some(function(v){ return tags.indexOf(v) > -1; });
      });
      if(renterOnly && tags.indexOf('renter') === -1) ok = false;
      if(q && title.indexOf(q) === -1) ok = false;
      item.style.display = ok ? '' : 'none';
      if(ok) shown++;
    });
    var counter = document.querySelector('[data-result-count]');
    if(counter) counter.textContent = shown;
    var empty = document.querySelector('[data-empty]');
    if(empty) empty.style.display = shown === 0 ? '' : 'none';
  }

  /* ---------- before / after slider ---------- */
  function initBA(){
    document.querySelectorAll('.ba-slider').forEach(function(sl){
      var after = sl.querySelector('.ba-after');
      var handle = sl.querySelector('.ba-handle');
      var knob = sl.querySelector('.ba-knob');
      var dragging = false;
      function setPos(x){
        var r = sl.getBoundingClientRect();
        var p = Math.max(0, Math.min(1, (x - r.left) / r.width));
        var pct = p * 100;
        after.style.clipPath = 'inset(0 0 0 ' + pct + '%)';
        handle.style.left = pct + '%';
        knob.style.left = pct + '%';
      }
      function down(e){ dragging = true; setPos((e.touches?e.touches[0]:e).clientX); e.preventDefault(); }
      function move(e){ if(dragging) setPos((e.touches?e.touches[0]:e).clientX); }
      function up(){ dragging = false; }
      sl.addEventListener('mousedown', down);
      sl.addEventListener('touchstart', down, {passive:false});
      window.addEventListener('mousemove', move);
      window.addEventListener('touchmove', move, {passive:false});
      window.addEventListener('mouseup', up);
      window.addEventListener('touchend', up);
    });
  }

  /* ---------- checklist ---------- */
  function initChecklist(){
    document.querySelectorAll('.checklist').forEach(function(list){
      var id = list.getAttribute('data-checklist') || 'default';
      var store = getChecks();
      var state = store[id] || {};
      var items = Array.prototype.slice.call(list.querySelectorAll('.checklist-item'));
      var bar = list.querySelector('.checklist-bar > span');
      var prog = list.querySelector('.checklist-progress');
      function render(){
        var done = 0;
        items.forEach(function(it, idx){
          var on = !!state[idx];
          it.classList.toggle('done', on);
          if(on) done++;
        });
        if(bar) bar.style.width = (items.length ? (done/items.length*100) : 0) + '%';
        if(prog) prog.textContent = done + ' / ' + items.length;
      }
      items.forEach(function(it, idx){
        it.addEventListener('click', function(){
          state[idx] = !state[idx];
          store[id] = state; setChecks(store);
          render();
        });
      });
      render();
    });
  }

  /* ---------- newsletter forms ---------- */
  function initNews(){
    document.querySelectorAll('[data-news-form]').forEach(function(form){
      form.addEventListener('submit', function(e){
        e.preventDefault();
        var input = form.querySelector('input[type="email"]');
        if(input && input.value){
          form.innerHTML = '<div style="display:flex;align-items:center;gap:10px;font-family:var(--display);font-weight:600;color:#fff;font-size:1.05rem;padding:6px 0;"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="var(--sand)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> You\'re in. Check your inbox to confirm.</div>';
        }
      });
    });
  }

  /* ---------- reveal on scroll ---------- */
  function initReveal(){
    var els = document.querySelectorAll('.reveal');
    if(!('IntersectionObserver' in window) || !els.length){ els.forEach(function(e){ e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
    }, {threshold:.12, rootMargin:'0px 0px -8% 0px'});
    els.forEach(function(e){ io.observe(e); });
  }

  /* ---------- init ---------- */
  document.addEventListener('DOMContentLoaded', function(){
    initSave(); initMenu(); initFilters(); initFacets();
    initBA(); initChecklist(); initNews(); initReveal();
  });
})();


(function(){
  function progress(){var b=document.querySelector('[data-reading-progress]'); if(!b) return; var h=document.documentElement; var max=h.scrollHeight-h.clientHeight; b.style.width=(max>0?Math.min(100,Math.max(0,h.scrollTop/max*100)):0)+'%';}
  window.addEventListener('scroll', progress, {passive:true}); window.addEventListener('resize', progress); progress();
  document.querySelectorAll('[data-share-url]').forEach(function(btn){btn.addEventListener('click', async function(){var url=btn.getAttribute('data-share-url')||location.href; try{ if(navigator.share){await navigator.share({title:document.title,url:url});} else {await navigator.clipboard.writeText(url); btn.textContent='Link copied'; setTimeout(function(){btn.textContent='Share';},1400);} }catch(e){} });});
})();
