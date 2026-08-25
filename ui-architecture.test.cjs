const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const view = fs.readFileSync(path.join(root, 'js/view.js'), 'utf8');
const controller = fs.readFileSync(path.join(root, 'js/controller.js'), 'utf8');

function test(name, fn) {
  try { fn(); console.log(`ok - ${name}`); }
  catch (err) { console.error(`not ok - ${name}`); throw err; }
}

test('Jornada has dedicated Metrics navigation and keeps journey explainer', () => {
  assert.match(html, /id=["']nav-metrics["']/);
  assert.match(html, /id=["']metrics["']/);
  assert.match(html, /Como funciona sua jornada/);
});

test('Jornada does not contain detailed competency metrics', () => {
  const home = html.match(/<section class="screen active" id="home">([\s\S]*?)<\/section>\s*<section class="screen" id="study">/)[1];
  assert.doesNotMatch(home, /homeSkills/);
  assert.doesNotMatch(home, /Domínio por competência/);
});

test('MVC assets are externalized and HTML has no inline click handlers', () => {
  assert.match(html, /css\/styles\.css/);
  assert.match(html, /js\/model\.js/);
  assert.match(html, /js\/view\.js/);
  assert.match(html, /js\/controller\.js/);
  assert.equal((html.match(/onclick=/g) || []).length, 0);
  assert.equal((view.match(/onclick=/g) || []).length, 0);
  assert.equal((controller.match(/onclick=/g) || []).length, 0);
});

test('Controller delegates core user actions', () => {
  for (const action of ['training','exam','daily','recommended','next','reset','auth-modal','submit-auth','study-concept','answer']) {
    assert.match(controller, new RegExp("case '" + action + "'"));
  }
});
