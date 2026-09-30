<?php
/*
 * Sends a project brief from the contact form to hello@sarnia.digital.
 *
 * The page posts here with fetch() and asks for JSON; without JavaScript the form posts here
 * directly and gets a small thank-you page back. OVH's mail() needs the From address on the site's
 * own domain, so the visitor's address goes in Reply-To: pressing reply answers them.
 *
 * Spam is kept down three ways: a field only bots fill in (answered with a fake "thanks"), a check
 * that the form wasn't submitted within three seconds of the page loading, and at most five briefs
 * an hour from one address (kept outside the web root, keyed by a hash of the IP).
 */
declare(strict_types=1);

const TO = 'hello@sarnia.digital';
const FROM_ADDRESS = 'hello@sarnia.digital';
const PER_HOUR = 5;

$wantsJson = str_contains($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json');

function finish(bool $ok, string $message, int $status = 200): never
{
    global $wantsJson;
    http_response_code($status);
    header('Cache-Control: no-store');
    if ($wantsJson) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => $ok, 'message' => $message]);
        exit;
    }
    header('Content-Type: text/html; charset=utf-8');
    $title = $ok ? 'Signal received' : 'Not sent';
    $text = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');
    echo <<<HTML
<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{$title} · Sarnia Digital</title><link rel="stylesheet" href="/css/site.css?v=1"></head>
<body><main class="section"><div class="wrap"><p class="label">Sarnia Digital</p><h2>{$title}.</h2>
<p class="section-lede spaced">{$text}</p><p><a class="btn btn-ink" href="/">Back to sarnia.digital</a></p></div></main></body></html>
HTML;
    exit;
}

/** A form field as clean text: trimmed, capped, no control characters except new lines. */
function field(string $key, int $max): string
{
    $value = $_POST[$key] ?? '';
    if (!is_string($value)) {
        return '';
    }
    $value = preg_replace('/[^\P{C}\n]/u', '', $value) ?? '';
    return trim(mb_substr($value, 0, $max));
}

/** No new lines in anything that goes into a mail header. */
function oneLine(string $s): string
{
    return trim(preg_replace('/[\r\n]+/', ' ', $s) ?? '');
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    finish(false, 'Please use the form on sarnia.digital.', 405);
}

// Bots: pretend it worked, send nothing.
if (field('website', 200) !== '') {
    finish(true, 'Thanks, we’ll be in touch soon.');
}
$stamp = (int) ($_POST['t'] ?? 0);
$elapsed = (int) (microtime(true) * 1000) - $stamp;
if ($stamp > 0 && $elapsed >= 0 && $elapsed < 3000) {
    finish(true, 'Thanks, we’ll be in touch soon.');
}

$name = oneLine(field('name', 80));
$email = oneLine(field('email', 160));
$business = oneLine(field('business', 120));
$message = field('message', 4000);
$needs = [];
foreach ((array) ($_POST['needs'] ?? []) as $n) {
    if (is_string($n) && $n !== '') {
        $needs[] = oneLine(mb_substr($n, 0, 40));
    }
}
$needs = array_slice(array_unique($needs), 0, 6);

if ($name === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    finish(false, 'We need your name, a working email address and a few lines about the project.', 422);
}

// At most PER_HOUR briefs an hour from one address.
$dir = dirname(__DIR__) . '/.sarnia-briefs';
if (!is_dir($dir)) {
    @mkdir($dir, 0700, true);
}
$ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$ip = trim(explode(',', $ip)[0]);
$file = $dir . '/' . hash('sha256', 'sarnia|' . $ip) . '.json';
$now = time();
$recent = [];
if (is_file($file)) {
    $recent = array_filter((array) json_decode((string) @file_get_contents($file), true), fn ($t) => is_int($t) && $t > $now - 3600);
}
if (count($recent) >= PER_HOUR) {
    finish(false, 'That’s a lot of briefs in an hour. Email hello@sarnia.digital directly and we’ll pick it up there.', 429);
}

$subject = 'Project brief: ' . ($business !== '' ? $business : $name);
$lines = [
    'A new brief from sarnia.digital.',
    '',
    'Name:      ' . $name,
    'Email:     ' . $email,
    'Business:  ' . ($business !== '' ? $business : '-'),
    'Needs:     ' . ($needs ? implode(', ', $needs) : '-'),
    '',
    $message,
    '',
    '--',
    'Sent from the contact form at https://sarnia.digital/ on ' . gmdate('j M Y, H:i') . ' UTC.',
    'Reply to this email to answer ' . $name . ' directly.',
];
$headers = [
    'From: ' . mb_encode_mimeheader('Sarnia Digital website', 'UTF-8', 'Q') . ' <' . FROM_ADDRESS . '>',
    'Reply-To: ' . mb_encode_mimeheader($name, 'UTF-8', 'Q') . ' <' . $email . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'X-Mailer: sarnia.digital',
];

$sent = mail(TO, mb_encode_mimeheader($subject, 'UTF-8', 'Q'), implode("\r\n", $lines), implode("\r\n", $headers), '-f' . FROM_ADDRESS);
if (!$sent) {
    finish(false, 'The brief didn’t send. Please email hello@sarnia.digital instead.', 502);
}

$recent[] = $now;
@file_put_contents($file, json_encode(array_values($recent)), LOCK_EX);
finish(true, 'Thanks, your brief is on its way. We’ll be in touch soon.');
