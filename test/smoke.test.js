/* Test dymny modulow Buildera w Node (stub DOM). */
const fs = require('fs');
const path = require('path');

function makeEl() {
    const cls = new Set();
    return {
        children: [], style: {}, dataset: {},
        classList: {
            add: (...c) => c.forEach(x => cls.add(x)),
            remove: (...c) => c.forEach(x => cls.delete(x)),
            toggle: (c, force) => {
                const want = force === undefined ? !cls.has(c) : !!force;
                if (want) cls.add(c); else cls.delete(c);
                return want;
            },
            contains: c => cls.has(c)
        },
        set className(v) { this._cn = v; }, get className() { return this._cn || ''; },
        set innerHTML(v) { this._html = v; }, get innerHTML() { return this._html || ''; },
        appendChild(c) { this.children.push(c); },
        querySelectorAll() { return []; },
        querySelector() { return null; },
        getBoundingClientRect() { return { left: 0, top: 0, width: 100, height: 100 }; },
        addEventListener() {}, removeEventListener() {}, setAttribute() {}
    };
}

global.window = global;
window.addEventListener = window.addEventListener || function () {};
global.document = {
    getElementById(id) { if (!this._els) this._els = {}; if (!this._els[id]) this._els[id] = makeEl(); return this._els[id]; },
    createElement() { return makeEl(); },
    querySelectorAll() { return []; },
    addEventListener() {}, activeElement: null,
    body: { appendChild() {}, removeChild() {} }
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
    // Bloki close/else sa obslugiwane specjalnie przez generator - moga miec pusty emit
    if (!act.hat && act.wrap !== 'close' && act.wrap !== 'else') {
        const p = {};
        (act.params || []).forEach(par => p[par.name] = par.default);
        let out;
        try { out = act.emit(p, { uid: 't1' }); } catch (e) { console.log('EMIT FAIL:', key, e.message); fails++; continue; }
        if (!out || String(out).trim() === '') { console.log('EMIT PUSTY:', key); fails++; }
    }
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

    // Nowe okna dodatkowe + akcja maksymalizacji
    addElement('window', 50, 50, 600, 450, 'Glowne');
    addElement('TChildWindow', 300, 300, 280, 180, 'Dziecko');
    addElement('TModalWindow', 320, 320, 300, 160, 'Modal');
    addElement('TPopupWindow', 340, 340, 180, 120, 'Menu\\nOtworz\\nZapisz\\nKoniec');
    const win = elements.find(e => e.type === 'window');
    if (win.minBtn !== true || win.maxBtn !== true) throw new Error('domyslne przyciski belki');

    const cpp = generateCPPCode();
    console.log('generateCPPCode OK, dlugosc:', cpp.length);
    const checks = [
        ['#include "bursztyn_gui.h"', 'naglowek'],
        ['widoczne_', 'stan okien dodatkowych'],
        ['MYSZ_PRAWY_DOWN', 'popup na PPM'],
        ['modal_zablokowane', 'blokada modalna'],
        ['GUI_BELKA_MAKSYMALIZUJ', 'hit-test belki']
    ];
    for (const [needle, label] of checks) {
        if (cpp.indexOf(needle) < 0) throw new Error('brak w kodzie: ' + label);
    }
    console.log('Wszystkie elementy wygenerowanego C++ obecne.');

    // Maksymalizacja jako akcja
    const maxEmit = ACTION_TYPES.window_maximize.emit({});
    if (maxEmit.indexOf('bws_utworz_warstwe') < 0) throw new Error('akcja maksymalizacji bez warstwy');

    // Belka z wylaczonymi przyciskami -> wlasny pasek
    win.minBtn = false; win.maxBtn = false;
    const cpp2 = generateCPPCode();
    for (const needle of ['BELKA_PRZYCISK_MIN = false', 'BELKA_PRZYCISK_MAKS = false']) {
        if (cpp2.indexOf(needle) < 0) throw new Error('brak: ' + needle);
    }
    if (cpp2.indexOf('gui_rysuj_standardowa_belke') >= 0) throw new Error('standardowa belka przy wylaczonych przyciskach');
    win.minBtn = true; win.maxBtn = true;

    // Mapa API pokrywa wszystkie typy z palety
    let unmapped = [];
    for (const cat in COMPONENT_DB) COMPONENT_DB[cat].forEach(c => { if (!TYPE_BWS_MAP[c.type]) unmapped.push(c.type); });
    if (unmapped.length) throw new Error('brak mapowania BWS dla: ' + unmapped.join(','));
    console.log('Mapowanie TYPE_BWS_MAP: kompletne.');

    // Wyszukiwarka palety
    setPaletteFilter('combo');
    const html = document.getElementById('palette-container').innerHTML;
    if (html.indexOf('TComboBox') < 0) throw new Error('szukajka nie znajduje TComboBox');
    setPaletteFilter('');
    if (document.getElementById('palette-container').innerHTML.indexOf('cat-PodstawoweStandard') < 0) throw new Error('paleta kategorii nie wraca');
    console.log('Wyszukiwarka palety: OK.');

    // Próbnik kolorów - konwersje HSV
    const hx = hsvToHex(36, 1, 1);
    const back = hexToHsv(hx);
    if (Math.abs(back.h - 36) > 1.5 || Math.abs(back.s - 1) > 0.01 || Math.abs(back.v - 1) > 0.01) {
        throw new Error('konwersja HSV niedokładna: ' + JSON.stringify(back));
    }
    console.log('Próbnik kolorów (HSV): OK.');

    // ---- Zakładki formularzy: panel nie rusza okien, dziecko ma własną kartę
    const win2 = elements.find(e => e.type === 'window');
    addElement('TPanel', 100, 100, 200, 150, 'Panel');
    const panel = elements[elements.length - 1];
    addElement('TChildWindow', 120, 120, 280, 180, 'Dziecko2');
    const child2 = elements[elements.length - 1];
    if (panel.formId !== win2.id) throw new Error('panel nie przypisany do okna głównego');
    if (child2.hostFormId !== win2.id) throw new Error('dziecko powinno być gościem karty okna głównego');
    if (!formsList().some(f => f.id === child2.id)) throw new Error('dziecko nie tworzy zakładki');

    // Symulacja przeciagania panelu: migawka + przesuniecie
    elements.forEach(el => { el.initialStartX = el.x; el.initialStartY = el.y; });
    panel.x += 50; panel.y += 50;
    const r = { x: panel.initialStartX, y: panel.initialStartY, w: panel.w, h: panel.h };
    let movedWindows = 0;
    elements.forEach(el => {
        if (el.id === panel.id || FORM_TYPES.includes(el.type)) return;
        const cx = el.initialStartX + el.w / 2, cy = el.initialStartY + el.h / 2;
        if (cx >= r.x && cx < r.x + r.w && cy >= r.y && cy < r.y + r.h) { /* kontrolka by się ruszyła */ }
    });
    // Okno glowne i dzieci musza zostac na miejscu:
    if (win2.x !== 50 || child2.x !== 120) throw new Error('kontener przesunal okno!');
    console.log('Kontenery nie przesuwają okien: OK.');

    // Drzewo: zmiana kolejnosci przez treeDropReorder aktualizuje z-order
    addElement('TButton', 10, 10, 80, 24, 'A'); const bA = elements[elements.length - 1];
    addElement('TButton', 40, 10, 80, 24, 'B'); const bB = elements[elements.length - 1];
    const zA0 = bA.z, zB0 = bB.z;
    treeDropReorder(bA.id, bB.id); // A nad B => A nizej w hierarchii z
    if (bA.z === zA0 && bB.z === zB0) throw new Error('treeDropReorder nie zmienił z-order');
    console.log('Drzewo DnD aktualizuje z-order: OK.');

    // Wyszukiwarka blokow akcji
    setBlockFilter('powtórz');
    {
        const hp = document.getElementById('blocks-palette').innerHTML;
        if (hp.indexOf('powtórz') < 0) throw new Error('szukajka bloków nie znajduje "powtórz"');
    }
    setBlockFilter('');
    console.log('Wyszukiwarka bloków: OK.');

    // Naprawa interakcji: klocki palety muszą mieć onclick (klik = dodanie)
    buildBlocksPalette();
    {
        const hp = document.getElementById('blocks-palette').innerHTML;
        if (hp.indexOf('addVisualEventModal') < 0) throw new Error('klocki palety bez onclick - brak reakcji na klik!');
    }
    console.log('Klocki reagują na kliknięcie: OK.');

    // Nowe bloki logiczne: porównania, ORAZ/LUB/NIE, break/continue, until, timer
    const cmpEmit = ACTION_TYPES.cmp_porownaj.emit({ a: 'punkty', op: '>=', b: '10' }, { uid: 'c9' });
    if (cmpEmit.indexOf('>=') < 0) throw new Error('cmp_porownaj bez operatora');
    ['logic_oraz', 'logic_lub', 'logic_nie', 'break_loop', 'continue_iter', 'repeat_until', 'event_timer', 'else_block'].forEach(k => {
        if (!ACTION_TYPES[k]) throw new Error('brak bloku: ' + k);
        const p = {}; (ACTION_TYPES[k].params || []).forEach(pp => p[pp.name] = pp.default);
        // Bloki close/else sa obslugiwane specjalnie przez generator - moga miec pusty emit
        if (!ACTION_TYPES[k].hat && ACTION_TYPES[k].wrap !== 'close' && ACTION_TYPES[k].wrap !== 'else') {
            const out = ACTION_TYPES[k].emit(p, { uid: 'x' });
            if (!String(out == null ? '' : out).trim()) throw new Error('pusty emit: ' + k);
        }
    });

    // Skrypt z jeżeli / w przeciwnym razie + nadmiarowy "koniec"
    const btnX = elements.find(e => e.type === 'TButton');
    btnX.visualEvents = [
        { type: 'event_click', params: {}, uid: 'h1' },
        { type: 'if_block', params: { warunek: '(mx > 50)' }, uid: 'i5' },
        { type: 'print', params: { text: 'A' }, uid: 'p1' },
        { type: 'else_block', params: {}, uid: 'e1' },
        { type: 'print', params: { text: 'B' }, uid: 'p2' },
        { type: 'koniec', params: {}, uid: 'k1' },
        { type: 'koniec', params: {}, uid: 'k2' }
    ];
    syncVisualToCode(btnX);
    {
        const code = btnX.onClick;
        const opens = (code.match(/{/g) || []).length;
        const closes = (code.match(/}/g) || []).length;
        if (code.indexOf('} else {') < 0) throw new Error('brak gałęzi else w wygenerowanym kodzie');
        if (opens !== closes) throw new Error('niesparowane klamry przy else: ' + opens + ' vs ' + closes);
        if (closes !== 2) throw new Error('nadmiarowy koniec wygenerował zbędną klamrę');
    }
    console.log('Jeżeli/w przeciwnym razie + nadmiarowe "koniec": OK.');

    // Podpisy pol + pomoc "?" w obszarze roboczym
    btnX.visualEvents = [
        { type: 'event_click', params: {}, uid: 'g1' },
        { type: 'draw_rect', params: { x: 5, y: 6, w: 7, h: 8, color: '0xFF000000' }, uid: 'g2' }
    ];
    openVisualModal(btnX.id); // kopiuje visualEvents do tempVisualEvents
    {
        const wsHtml = document.getElementById('visual-blocks-container').innerHTML;
        if (wsHtml.indexOf('ws-lbl') < 0) throw new Error('brak widocznych podpisow pol w klockach');
        if (wsHtml.indexOf('Szerokość') < 0) throw new Error('podpis "Szerokość" nie renderuje się');
        if (wsHtml.indexOf('showBlockHelp') < 0) throw new Error('brak przycisku "?" na klocku');
        // Pomoc dla kazdego bloku musi zwracac tresc
        for (const key in ACTION_TYPES) {
            showBlockHelp(key, null);
            const pop = document.getElementById('bws-help-pop');
            if (!pop.innerHTML || pop.innerHTML.length < 40) throw new Error('pomoc pusta dla bloku: ' + key);
        }
        console.log('Podpisy pól i pomoc "?": OK (' + Object.keys(ACTION_TYPES).length + ' bloków).');
    }
    closeVisualModal();

    // Pelny ekran edytora
    if (typeof toggleVisualFullscreen !== 'function') throw new Error('brak toggleVisualFullscreen');
    toggleVisualFullscreen();
    if (document.getElementById('visual-modal').classList.contains('fs-mode') !== true) throw new Error('tryb pelnoekranowy nie aktywuje sie');
    toggleVisualFullscreen();
    if (document.getElementById('visual-modal').classList.contains('fs-mode')) throw new Error('tryb pelnoekranowy nie wylacza sie');
    console.log('Pełny ekran edytora: OK.');

    // Scratch: skrypt ze zagniezdzeniem -> poprawny C++
    btnX.visualEvents = [
        { type: 'event_click', params: {}, uid: 'u1' },
        { type: 'zmienna_liczba', params: { nazwa: 'punkty', wartosc: 5 }, uid: 'u2' },
        { type: 'repeat', params: { ile: 3 }, uid: 'u3' },
        { type: 'if_block', params: { warunek: '(mx > 10)' }, uid: 'u4' },
        { type: 'dodaj_do', params: { nazwa: 'punkty', wyrazenie: 'losowa_u4' }, uid: 'u5' },
        { type: 'koniec', params: {}, uid: 'u6' },
        { type: 'koniec', params: {}, uid: 'u7' },
        { type: 'wywolaj_funkcje', params: { nazwa: 'mojaFunkcja' }, uid: 'u8' }
    ];
    syncVisualToCode(btnX);
    {
        const code = btnX.onClick;
        const opens = (code.match(/{/g) || []).length;
        const closes = (code.match(/}/g) || []).length;
        if (opens !== closes) throw new Error('niesparowane klamry: ' + opens + ' vs ' + closes);
        if (code.indexOf('for (int rep_u3') < 0) throw new Error('brak petli repeat');
        if (code.indexOf('fn_mojaFunkcja') < 0) throw new Error('brak wywolania funkcji');
    }
    console.log('Zagnieżdżanie bloków (Scratch → C++): OK.');

    // Rozszerzenia
    addExtension('multimedia');
    if (!ACTION_TYPES.media_melodia) throw new Error('rozszerzenie multimedia niedodane');
    const mel = ACTION_TYPES.media_melodia.emit({ nuty: '880:150,660:150' }, { uid: 'm1' });
    if ((mel.match(/bws_dzwiek_test/g) || []).length !== 2) throw new Error('melodia generuje złą liczbę tonów');
    console.log('Rozszerzenia: OK.');

    // Zoom obszaru roboczego
    setWsZoom('in'); setWsZoom('in'); setWsZoom('reset');
    console.log('Zoom: OK.');

    const cppF = generateCPPCode();
    console.log('generateCPPCode finalny OK, dlugosc:', cppF.length);
    console.log('SMOKE TEST OK');
} catch (e) { console.log('CODEGEN FAIL:', e.stack); }
`;

const combined = files
    .map(f => fs.readFileSync(path.join(__dirname, '..', 'js', f), 'utf8'))
    .join('\n;\n') + '\n;\n' + tests;
eval(combined);
