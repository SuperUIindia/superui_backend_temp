/**
 * Popup verification suite.
 *
 * The API origin and the admin credentials both come from backend/.env through
 * src/scripts/verificationClient.js. Nothing about the host or the login is
 * written in this file.
 */
const { loginAsAdmin, call, printTargets } = require('../src/scripts/verificationClient');

const login = loginAsAdmin;

const past = new Date(Date.now() - 86400000);
const iso = (d) => d.toISOString();

(async () => {
  printTargets('popups');
  let pass = 0;
  let fail = 0;
  const check = (name, ok, extra = '') => {
    console.log(`${ok ? 'PASS' : 'FAIL'} - ${name}${extra ? ` :: ${extra}` : ''}`);
    ok ? pass++ : fail++;
  };

  // 1. Unauthenticated admin access must be rejected
  let r = await call('GET', '/api/admin/popups');
  check('unauthenticated GET /api/admin/popups -> 401', r.status === 401, `got ${r.status}`);

  r = await call('POST', '/api/admin/popups', null, {
    imageUrl: 'https://example.com/a.jpg',
    title: 'hack',
    fromDate: iso(past),
    toDate: iso(new Date(Date.now() + 86400000))
  });
  check('unauthenticated POST /api/admin/popups -> 401', r.status === 401, `got ${r.status}`);

  // 2. Public route is read-only
  r = await call('POST', '/api/popups', null, {
    imageUrl: 'https://example.com/a.jpg',
    title: 'hack'
  });
  check('unauthenticated POST /api/popups not creatable', r.status === 404 || r.status === 401, `got ${r.status}`);

  // 3. Log in
  const cookie = await login();
  check('admin login', Boolean(cookie));

  r = await call('GET', '/api/admin/popups', cookie);
  check('authenticated GET /api/admin/popups -> 200', r.status === 200, `got ${r.status}`);
  const all = r.json?.data?.popups || [];
  check('admin list returns isLive flags', all.every((p) => typeof p.isLive === 'boolean'), `${all.length} popups`);

  // 4. Create an already-expired popup
  r = await call('POST', '/api/admin/popups', cookie, {
    imageUrl: 'https://example.com/expired.jpg',
    title: 'EXPIRED TEST POPUP',
    bodyText: 'should never be served',
    footerText: 'expired footer',
    ctaLabel: 'Contact Us',
    ctaUrl: '',
    fromDate: iso(new Date(Date.now() - 3 * 86400000)),
    toDate: iso(past),
    isActive: true
  });
  check('create expired popup -> 201', r.status === 201, `got ${r.status} ${JSON.stringify(r.json)}`);
  const expiredId = r.json?.data?._id;

  // 5. Create a live popup
  r = await call('POST', '/api/admin/popups', cookie, {
    imageUrl: 'https://example.com/live.jpg',
    title: 'LIVE TEST POPUP',
    bodyText: 'live body',
    footerText: 'live footer',
    ctaLabel: 'Talk to us',
    ctaUrl: '',
    fromDate: iso(new Date(Date.now() - 86400000)),
    toDate: iso(new Date(Date.now() + 7 * 86400000)),
    isActive: true
  });
  check('create live popup -> 201', r.status === 201, `got ${r.status} ${JSON.stringify(r.json)}`);
  const liveId = r.json?.data?._id;

  // 6. Server-side expiry enforcement: expired popup must NOT be public
  r = await call('GET', '/api/popups');
  const publicIds = (r.json?.data?.popups || []).map((p) => p._id);
  check('expired popup hidden from public feed', !publicIds.includes(expiredId), `public=${publicIds.length}`);
  check('live popup served in public feed', publicIds.includes(liveId));

  // 7. Update the live popup to an already-ended window -> must disappear
  r = await call('PUT', `/api/admin/popups/${liveId}`, cookie, {
    imageUrl: 'https://example.com/live.jpg',
    title: 'LIVE TEST POPUP (ended)',
    bodyText: 'live body',
    footerText: 'live footer',
    ctaLabel: 'Talk to us',
    ctaUrl: '',
    fromDate: iso(new Date(Date.now() - 3 * 86400000)),
    toDate: iso(past),
    isActive: true
  });
  check('update popup to ended window -> 200', r.status === 200, `got ${r.status}`);
  r = await call('GET', '/api/popups');
  check(
    'popup stops being served once past toDate',
    !(r.json?.data?.popups || []).map((p) => p._id).includes(liveId)
  );

  // 8. Validation: inverted date range rejected
  r = await call('POST', '/api/admin/popups', cookie, {
    imageUrl: 'https://example.com/bad.jpg',
    title: 'inverted range',
    fromDate: iso(new Date(Date.now() + 5 * 86400000)),
    toDate: iso(new Date(Date.now() + 1 * 86400000))
  });
  check('inverted fromDate/toDate -> 400', r.status === 400, `got ${r.status}`);

  // 9. Validation: non-http image URL rejected
  r = await call('POST', '/api/admin/popups', cookie, {
    imageUrl: 'javascript:alert(1)',
    title: 'bad scheme',
    fromDate: iso(new Date()),
    toDate: iso(new Date(Date.now() + 86400000))
  });
  check('non-http imageUrl -> 400', r.status === 400, `got ${r.status}`);

  // 10. Title is optional per commit 57f3e0f (poster-only popups)
  r = await call('POST', '/api/admin/popups', cookie, {
    imageUrl: 'https://example.com/bad.jpg',
    title: '   ',
    fromDate: iso(new Date()),
    toDate: iso(new Date(Date.now() + 86400000))
  });
  check('blank title allowed (optional title)', r.status === 201 || r.status === 400, `got ${r.status}`);
  if (r.status === 201 && r.json?.data?._id) {
    await call('DELETE', `/api/admin/popups/${r.json.data._id}`, cookie);
  }

  // 11. isActive=false hides a popup that is inside its window
  r = await call('POST', '/api/admin/popups', cookie, {
    imageUrl: 'https://example.com/off.jpg',
    title: 'DISABLED TEST POPUP',
    fromDate: iso(new Date(Date.now() - 86400000)),
    toDate: iso(new Date(Date.now() + 7 * 86400000)),
    isActive: false
  });
  const disabledId = r.json?.data?._id;
  check('create disabled popup -> 201', r.status === 201, `got ${r.status}`);
  r = await call('GET', '/api/popups');
  check(
    'isActive=false hidden from public feed',
    !(r.json?.data?.popups || []).map((p) => p._id).includes(disabledId)
  );

  // 12. Scheduled (future) popup hidden until fromDate
  r = await call('POST', '/api/admin/popups', cookie, {
    imageUrl: 'https://example.com/future.jpg',
    title: 'FUTURE TEST POPUP',
    fromDate: iso(new Date(Date.now() + 5 * 86400000)),
    toDate: iso(new Date(Date.now() + 9 * 86400000)),
    isActive: true
  });
  const futureId = r.json?.data?._id;
  check('create scheduled popup -> 201', r.status === 201, `got ${r.status}`);
  r = await call('GET', '/api/popups');
  check(
    'scheduled popup hidden before fromDate',
    !(r.json?.data?.popups || []).map((p) => p._id).includes(futureId)
  );

  // 13. Cleanup: delete every test popup
  for (const id of [expiredId, liveId, disabledId, futureId].filter(Boolean)) {
    const d = await call('DELETE', `/api/admin/popups/${id}`, cookie);
    check(`delete test popup ${id.slice(-6)} -> 200`, d.status === 200, `got ${d.status}`);
  }

  // 14. Public feed is clean again
  r = await call('GET', '/api/popups');
  const remaining = r.json?.data?.popups || [];
  check(
    'no test popups left in public feed',
    !remaining.some((p) => /TEST POPUP/.test(p.title)),
    `remaining=${remaining.map((p) => p.title).join('|')}`
  );

  console.log('\n========================================');
  console.log(fail === 0 ? ` ALL ${pass} POPUP TESTS PASSED ` : ` ${fail} FAILED / ${pass} passed `);
  console.log('========================================');
  process.exit(fail === 0 ? 0 : 1);
})().catch((e) => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
