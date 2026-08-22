/* Test dymny modulow Buildera w Node (stub DOM). */
const fs = require('fs');
const path = require('path');

function makeEl() {
    return {
        children: [], style: {}, classList: {
            add() {}, remove() {}, toggle() {}, contains() { return false; }
        },
        set className(v) { this._cn = v; }, get className() { return this._cn || ''; },
        set innerHTML(v) { this._html = v; }, get innerHTML() { return this._html || ''; },
        appendChild(c) { this.children.push(c); },
        addEventListener() {}, setAttribute() {}
    };
}

global.window = global;
global.document = {
    getElementById(id) { if (!this._els) this._els = {}; if (!this._els[id]) this._els[id] = makeEl(); return this._els[id]; },
    createElement() { return makeEl(); },
    addEventListener() {}, activeElement: null
};
global.alert = m => console.log('[alert]', m);
global.navigator = {};
window.onload = null;

// Wczytaj moduly w tej samej kolejnosci co index.html.
// Konkatenacja odwzorowuje wspolne globalne srodowisko leksykalne skryptow
// przegladarki (top-level let/const dzielone miedzy <script src=...>).
const files = ['utils.js', 'bws_api.js', 'components.js', 'state.js', 'editor.js', 'codegen.js', 'properties.js', 'api_browser.js', 'main.js'];

// Testy doklejone do wspolnego zrodla - tak jak kolejne <script> w przegladarce
// widza top-level let/const z poprzednich skryptow.
const tests = `
console.log('BWS_SYSCALLS:', BWS_SYSCALLS.length, 'wpisow');
const nums = new Set(BWS_SYSCALLS.map(s => s.nr));
for (let i = 1; i <= 56; i++) if (!nums.has(i)) console.log('UWAGA: brak wpisu referencyjnego dla BWS', i);
if (nums.size === 56) console.log('Pokrycie referencji BWS: kompletne 1..56');

let fails = 0;
for (const key in ACTION_TYPES) {
    const act = ACTION_TYPES[key];
    const p = {};
    (act.params || []).forEach(par => p[par.name] = par.default);
    let out;
    try { out = act.emit(p); } catch (e) { console.log('EMIT FAIL:', key, e.message); fails++; continue; }
    if (!out || String(out).trim() === '') { console.log('EMIT PUSTY:', key); fails++; }
}
console.log(fails === 0 ? 'Wszystkie akcje emituja kod C++.' : 'Akcji zblednych: ' + fails);
console.log('Liczba akcji w palecie wizualnej:', Object.keys(ACTION_TYPES).length);

console.log('--- przyklad print ---');
console.log(ACTION_TYPES.print.emit({ text: 'Ala "ma" kota\\ni psa' }));
console.log('--- przyklad net_http ---');
console.log(ACTION_TYPES.net_http.emit({ ip: '93.184.216.34', domain: 'example.com', path: '/index.html', buf: 4096 }));
console.log('--- przyklad drop_register ---');
console.log(ACTION_TYPES.drop_register.emit({ x: 10, y: 20, w: 120, h: 90, folder: '/dane' }));

try {
    addElement('TButton', 10, 10, 100, 30, 'Kliknij');
    const btn = elements[elements.length - 1];
    btn.visualEvents.push({ type: 'print', params: { text: 'Test' } }, { type: 'sound', params: { hz: 440, ms: 200 } });
    syncVisualToCode(btn);
    console.log('--- onClick po sync ---');
    console.log(btn.onClick);
    duplicateSelected();
    restoreDeleted();
    const cpp = generateCPPCode();
    console.log('generateCPPCode OK, dlugosc:', cpp.length);
    if (cpp.indexOf('#include "bursztyn_gui.h"') < 0) throw new Error('brak include bursztyn_gui.h');
    console.log('SMOKE TEST OK');
} catch (e) { console.log('CODEGEN FAIL:', e.stack); }
`;

const combined = files
    .map(f => fs.readFileSync(path.join(__dirname, '..', 'js', f), 'utf8'))
    .join('\n;\n') + '\n;\n' + tests;
eval(combined);
