// Runs before the page paints: marks it as scripted, so content that fades in on scroll is only
// hidden when there's a script to show it again.
document.documentElement.classList.add('js')
