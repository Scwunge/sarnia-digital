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
  function showTip(el) {
    const letter = el.dataset.flag
    const m = meanings[letter]
    if (!m || !tip) return
    tip.innerHTML = `<b>${letter} · ${m[0]}</b>${m[1]}`
    tip.hidden = false
    const r = el.getBoundingClientRect()
    const w = tip.offsetWidth, h = tip.offsetHeight
    let x = r.right + 12, y = r.top + r.height / 2 - h / 2
    if (x + w > innerWidth - 12) x = Math.max(12, r.left - w - 12)
    if (x < 12) { x = Math.min(innerWidth - w - 12, Math.max(12, r.left)); y = r.bottom + 10 }
    tip.style.left = `${x}px`
    tip.style.top = `${Math.max(12, Math.min(y, innerHeight - h - 12))}px`
  }
  const hideTip = () => { if (tip) tip.hidden = true }
  document.addEventListener('mouseover', (e) => { const f = e.target.closest('[data-flag]'); if (f) showTip(f) })
  document.addEventListener('mouseout', (e) => { if (e.target.closest('[data-flag]')) hideTip() })
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
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
    }, { rootMargin: '0px 0px -8% 0px' })
    reveal.forEach((el) => io.observe(el))
  } else reveal.forEach((el) => el.classList.add('in'))

  /* ------------------------------------------------------ your name, in flags */
  const preview = $('#preview-flags'), note = $('#preview-note')
  const business = $('#business'), nameInput = $('.brief [name="name"]')
  const MAX = 32
  function flagSvg(letter) {
    return `<svg viewBox="0 0 50 40" role="img" aria-label="${letter}" data-flag="${letter}"><use href="${FLAGS}#flag-${letter}"/></svg>`
  }
  function draw() {
    if (!preview) return
    const raw = (business?.value || nameInput?.value || '').toUpperCase()
    const letters = raw.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Z ]/g, '').replace(/\s+/g, ' ').trim()
    const shown = letters.slice(0, MAX)
    if (!shown) {
      preview.classList.add('placeholder')
      preview.innerHTML = [...'SARNIA'].map(flagSvg).join('')
      note.textContent = 'Type your business name in the form.'
      return
    }
    preview.classList.remove('placeholder')
    // One hoist per word, so a line never breaks in the middle of one.
    preview.innerHTML = shown.split(' ').filter(Boolean)
      .map((word) => `<span class="word">${[...word].map(flagSvg).join('')}</span>`).join('')
    note.textContent = letters.length > MAX ? `The first ${MAX} letters. Real ships use shorter signals.` : `${shown}, as a ship would fly it.`
  }
  business?.addEventListener('input', draw)
  nameInput?.addEventListener('input', draw)
  draw()

  /* ----------------------------------------------------------- sending the brief */
  const form = $('#brief'), status = $('#form-status'), stamp = $('#t')
  if (stamp) stamp.value = String(Date.now())
  const say = (text, kind) => { status.textContent = text; status.className = `form-status ${kind || ''}` }
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
