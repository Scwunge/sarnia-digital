// Sarnia Digital: the small amount of behaviour the page has. Everything works without it; this
// adds the flag meanings on hover, the Guernsey clock, the name-in-flags preview, scroll reveals and
// sending the brief without leaving the page.
(() => {
  const $ = (s, root = document) => root.querySelector(s)
  const $$ = (s, root = document) => [...root.querySelectorAll(s)]
  const FLAGS = '/img/flags.svg'
  const meanings = window.FLAG_MEANINGS || {}

  /* ----------------------------------------------------------- flag meanings */
  const tip = $('#flag-tip')
  if (tip) tip.hidden = false // from here on it's shown and hidden by .open, so it can fade
  let tipFlag = null, tipClosedAt = 0
  function showTip(el) {
    const letter = el.dataset.flag
    const m = meanings[letter]
    if (!m || !tip) return
    // Straight from one flag to the next, the tip just moves: no fade, it's already been asked for.
    const instant = tip.classList.contains('open') || Date.now() - tipClosedAt < 200
    tip.classList.toggle('instant', instant)
    tipFlag = el
    tip.innerHTML = `<b>${letter} · ${m[0]}</b>${m[1]}`
    const r = el.getBoundingClientRect()
    const w = tip.offsetWidth, h = tip.offsetHeight
    let x = r.right + 12, y = r.top + r.height / 2 - h / 2
    if (x + w > innerWidth - 12) x = Math.max(12, r.left - w - 12)
    if (x < 12) { x = Math.min(innerWidth - w - 12, Math.max(12, r.left)); y = r.bottom + 10 }
    y = Math.max(12, Math.min(y, innerHeight - h - 12))
    tip.style.left = `${x}px`
    tip.style.top = `${y}px`
    // Grow out of the flag, wherever the tip ended up relative to it.
    tip.style.transformOrigin = `${r.left + r.width / 2 - x}px ${r.top + r.height / 2 - y}px`
    tip.classList.add('open')
  }
  const hideTip = () => {
    if (!tip || !tip.classList.contains('open')) return
    tip.classList.remove('open', 'instant')
    tipFlag = null; tipClosedAt = Date.now()
  }
  document.addEventListener('mouseover', (e) => { const f = e.target.closest('[data-flag]'); if (f && f !== tipFlag) showTip(f) })
  document.addEventListener('mouseout', (e) => {
    const f = e.target.closest('[data-flag]')
    // Moving between the parts of one flag (button, svg, use) isn't leaving it.
    if (f && !f.contains(e.relatedTarget)) hideTip()
  })
  document.addEventListener('focusin', (e) => { const f = e.target.closest('[data-flag]'); if (f) showTip(f) })
  document.addEventListener('focusout', hideTip)
  // A tap shows it too (phones have no hover); a tap elsewhere hides it.
  document.addEventListener('click', (e) => { const f = e.target.closest('[data-flag]'); if (f) showTip(f); else hideTip() })
  addEventListener('scroll', hideTip, { passive: true })

  /* --------------------------------------------------------------- the clock */
  const clock = $('[data-clock]')
  const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Guernsey', hour: '2-digit', minute: '2-digit' })
  const tick = () => { if (clock) clock.textContent = fmt.format(new Date()) }
  tick(); setInterval(tick, 20_000)
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear() })

  /* ---------------------------------------------------------- header on scroll */
  const top = $('.top')
  const onScroll = () => top && top.classList.toggle('scrolled', scrollY > 8)
  onScroll(); addEventListener('scroll', onScroll, { passive: true })

  /* ------------------------------------------------------------ reveal on scroll */
  const reveal = $$('.section-head, .signal-card, .case, .steps li, .brief, .preview')
  reveal.forEach((el) => el.classList.add('reveal'))
  // Once an element has arrived, it drops the reveal classes so its own transitions (the form's
  // shadow, say) are its own again.
  const settle = (el) => {
    const done = (e) => {
      if (e.target !== el || e.propertyName !== 'opacity') return
      el.removeEventListener('transitionend', done)
      el.classList.remove('reveal', 'in'); el.style.transitionDelay = ''
    }
    el.addEventListener('transitionend', done)
  }
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      // Things that come into view together (a row of cards) arrive one after another, 60ms apart.
      entries.filter((e) => e.isIntersecting).forEach((e, i) => {
        e.target.style.transitionDelay = `${Math.min(i, 5) * 60}ms`
        settle(e.target)
        e.target.classList.add('in'); io.unobserve(e.target)
      })
    }, { rootMargin: '0px 0px -8% 0px' })
    reveal.forEach((el) => io.observe(el))
  } else reveal.forEach((el) => el.classList.add('in'))

  /* ------------------------------------------------------ your name, in flags */
  const preview = $('#preview-flags'), note = $('#preview-note')
  const business = $('#business'), nameInput = $('.brief [name="name"]')
  const MAX = 32
  let drawn = '' // the letters currently flown, so only a newly typed one is hoisted
  function flagSvg(letter, fresh) {
    return `<svg viewBox="0 0 50 40" role="img" aria-label="${letter}" data-flag="${letter}"${fresh ? ' class="new"' : ''}><use href="${FLAGS}#flag-${letter}"/></svg>`
  }
  function draw() {
    if (!preview) return
    const raw = (business?.value || nameInput?.value || '').toUpperCase()
    const letters = raw.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Z ]/g, '').replace(/\s+/g, ' ').trim()
    const shown = letters.slice(0, MAX)
    if (!shown) {
      preview.classList.add('placeholder')
      preview.innerHTML = [...'SARNIA'].map((l) => flagSvg(l)).join('')
      note.textContent = 'Type your business name in the form.'
      drawn = ''
      return
    }
    preview.classList.remove('placeholder')
    // Letters up to the first change are already flying; only the ones after it are new.
    const now = shown.replace(/ /g, '')
    let same = 0
    while (same < now.length && now[same] === drawn[same]) same++
    drawn = now
    // One hoist per word, so a line never breaks in the middle of one.
    let n = 0
    preview.innerHTML = shown.split(' ').filter(Boolean)
      .map((word) => `<span class="word">${[...word].map((l) => flagSvg(l, n++ >= same)).join('')}</span>`).join('')
    note.textContent = letters.length > MAX ? `The first ${MAX} letters. Real ships use shorter signals.` : `${shown}, as a ship would fly it.`
  }
  business?.addEventListener('input', draw)
  nameInput?.addEventListener('input', draw)
  draw()

  /* ----------------------------------------------------------- sending the brief */
  const form = $('#brief'), status = $('#form-status'), stamp = $('#t')
  if (stamp) stamp.value = String(Date.now())
  const say = (text, kind) => {
    status.textContent = text; status.className = `form-status ${kind || ''}`
    // A soft blur-in, so one message turns into the next instead of swapping.
    status.animate?.([{ opacity: 0, filter: 'blur(2px)' }, { opacity: 1, filter: 'blur(0)' }], { duration: 200, easing: 'ease-out' })
  }
  form?.addEventListener('submit', async (e) => {
    e.preventDefault()
    let firstBad = null
    for (const el of $$('[required]', form)) {
      const bad = !el.value.trim() || (el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()))
      el.setAttribute('aria-invalid', bad ? 'true' : 'false')
      if (bad && !firstBad) firstBad = el
    }
    if (firstBad) { say('Your name, email and a few lines, please.', 'bad'); firstBad.focus(); return }
    const button = $('button[type="submit"]', form)
    button.disabled = true
    say('Sending…')
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      const body = await res.json().catch(() => ({}))
      if (!res.ok || !body.ok) throw new Error(body.message || 'not sent')
      form.classList.add('sent')
      form.reset(); draw()
      say('Signal received. We’ll be in touch soon.', 'ok')
    } catch (err) {
      say('That didn’t send. Email hello@sarnia.digital and we’ll pick it up there.', 'bad')
    } finally {
      button.disabled = false
    }
  })
})()
