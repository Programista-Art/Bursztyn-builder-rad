/* =========================================================================
 * Bursztyn Builder RAD v3.0 - inspektor obiektow i edytor wizualny logiki
 * ========================================================================= */

function renderProperties() {
    if (!selectedId) { propertiesPanel.innerHTML = '<div class="text-gray-600 text-center mt-10 text-xs">Wybierz komponent z płótna.</div>'; return; }
    const el = elements.find(e => e.id === selectedId); if (!el) return;

    // Rodzic-kontener (element, z ktorym bedzie przesuwany razem)
    let parentEl = null;
    const ecx = el.x + el.w / 2, ecy = el.y + el.h / 2;
    for (const p of elements) {
        if (p.id === el.id || !CONTAINER_TYPES.includes(p.type)) continue;
        if (p.type === 'window' && el.type === 'window') continue;
        if (ecx >= p.x && ecx < p.x + p.w && ecy >= p.y && ecy < p.y + p.h) {
            if (!parentEl || (p.w * p.h) < (parentEl.w * parentEl.h)) parentEl = p;
        }
    }

    let html = `<div class="mb-3 border-b border-carbon-800 pb-2"><input type="text" value="${el.name}" onchange="updateElementProp(${selectedId}, 'name', this.value)" class="w-full bg-transparent text-bursztyn-400 font-bold text-sm focus:outline-none border-b border-transparent focus:border-bursztyn-500"><div class="text-[10px] text-gray-500 mt-1">Typ: ${el.type}</div><div class="text-[9px] text-gray-500 mt-0.5 leading-tight" title="Wywołania BWS używane przez ten komponent">${bwsApiForType(el.type)}</div>${parentEl ? `<div class="text-[9px] text-bursztyn-400 mt-0.5">↳ Rodzic: ${parentEl.name} (przesuwane razem)</div>` : ''}</div>`;
    html += `<div class="grid grid-cols-2 gap-2 mb-3">`;
    html += createInputGroup('Poz X', 'x', el.x, 'number'); html += createInputGroup('Poz Y', 'y', el.y, 'number');
    html += createInputGroup('Szer (W)', 'w', el.w, 'number'); html += createInputGroup('Wys (H)', 'h', el.h, 'number');
    html += `</div>`; html += createInputGroup('Z-Order', 'z', el.z, 'number') + `<div class="mb-3"></div>`;

    if (['TComboBox', 'TListBox', 'TCheckListBox', 'TRadioGroup', 'TMainMenu', 'TPopupMenu'].includes(el.type)) {
        html += createInputGroup('Elementy listy/menu (po jednym w linii)', 'text', el.text, 'textarea') + `<div class="mb-3"></div>`;
    } else if (el.text !== undefined) {
        html += createInputGroup('Zawartość / Tekst', 'text', el.text, 'text') + `<div class="mb-3"></div>`;
    }

    if (el.bg !== undefined) html += createColorControl('KOLOR TŁA (BG)', 'bg', el.bg);
    if (el.color !== undefined) html += createColorControl('KOLOR TEKSTU/OBRAMOWANIA (FG)', 'color', el.color);

    // Ustawienia przyciskow paska tytulu okna glownego
    if (el.type === 'window') {
        html += `<div class="mb-3 bg-carbon-900 p-2 rounded border border-carbon-800"><label class="block text-gray-400 text-[10px] mb-1 font-bold tracking-widest">PRZYCISKI PASKA TYTUŁU</label>
            <label class="flex items-center gap-2 text-xs text-gray-300 mb-1 cursor-pointer"><input type="checkbox" ${el.minBtn !== false ? 'checked' : ''} onchange="toggleBorderIcon('minBtn', this.checked)" class="accent-amber-500"> Minimalizacji (−)</label>
            <label class="flex items-center gap-2 text-xs text-gray-300 cursor-pointer"><input type="checkbox" ${el.maxBtn !== false ? 'checked' : ''} onchange="toggleBorderIcon('maxBtn', this.checked)" class="accent-amber-500"> Maksymalizacji (□)</label>
        </div>`;
    }

    // Sekcja zdarzen dla wszystkich komponentow interaktywnych.
    if (EVENTOWALNE_TYPY.includes(el.type)) {
        html += `<div class="mt-5 border-t border-carbon-800 pt-3"><div class="flex justify-between items-center mb-2"><h3 class="text-[10px] font-bold text-bursztyn-500 uppercase tracking-widest">⚡ Zdarzenia (Click / Interakcja)</h3></div>`;
        if (el.eventMode === 'visual') {
            html += `<div class="bg-carbon-950 border border-carbon-700 rounded p-2 text-center mb-2 text-[10px] text-gray-400">Akcje blokowe: ${el.visualEvents.length}</div><button onclick="openVisualModal(${el.id})" class="w-full bg-bursztyn-600 hover:bg-bursztyn-500 text-white py-1.5 rounded text-xs font-bold transition-colors">🧩 Otwórz Edytor Wizualny</button>`;
        } else {
            html += `<textarea onchange="updateElementProp(${selectedId}, 'onClick', this.value)" class="w-full bg-carbon-950 border border-carbon-700 text-gray-300 rounded p-2 text-[10px] h-24 font-mono custom-scrollbar">${el.onClick || ''}</textarea>`;
        }
        html += `<div class="flex gap-2 mt-2"><button onclick="setEventMode('visual')" class="flex-1 text-[9px] py-1 bg-carbon-800 text-white rounded">Visual</button><button onclick="setEventMode('code')" class="flex-1 text-[9px] py-1 bg-carbon-800 text-white rounded">C++</button></div>`;
        if (el.type === 'TComboBox') {
            html += `<div class="text-[9px] text-gray-500 mt-2 italic">Rozwijanie listy i wybór pozycji są generowane automatycznie — powyższy kod uruchomi się dodatkowo po zmianie wyboru.</div>`;
        } else if (el.type === 'TCheckBox' || el.type === 'TRadioButton') {
            html += `<div class="text-[9px] text-gray-500 mt-2 italic">Przełączanie zaznaczenia jest generowane automatycznie — powyższy kod uruchomi się dodatkowo po kliknięciu.</div>`;
        }
        html += `</div>`;
    }
    propertiesPanel.innerHTML = html;
    initColorPickers();
}

function createInputGroup(label, prop, value, type) {
    let extra = type === 'textarea'
        ? `<textarea onchange="updateElementProp(${selectedId}, '${prop}', this.value)" class="w-full bg-carbon-800 border border-carbon-700 text-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-bursztyn-500 h-24 font-mono custom-scrollbar" placeholder="Element 1\nElement 2...">${value || ''}</textarea>`
        : `<input type="${type}" value="${value}" onchange="updateElementProp(${selectedId}, '${prop}', this.value)" class="w-full bg-carbon-800 border border-carbon-700 text-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-bursztyn-500">`;
    return `<div><label class="block text-gray-400 text-[10px] mb-0.5 font-bold tracking-wide">${label}</label>${extra}</div>`;
}

function createColorControl(label, prop, bHexValue) {
    let { a, hex } = parseBursztynColor(bHexValue);
    const hsv = hexToHsv(hex);
    const svBg = `linear-gradient(to top, #000, rgba(0,0,0,0)), linear-gradient(to right, #fff, ${hsvToHex(hsv.h, 1, 1)})`;
    return `
        <div class="mb-3 bg-carbon-900 p-2 rounded border border-carbon-800" data-bws-picker data-prop="${prop}">
            <label class="block text-gray-400 text-[10px] mb-1 font-bold tracking-widest">${label}</label>
            <div class="flex items-center gap-2 mb-2">
                <div id="bws-swatch-${prop}" style="width:26px;height:26px;border-radius:4px;border:1px solid #666;flex-shrink:0;background:${bursztynToRGBA(bHexValue)};"></div>
                <input id="bws-hex-${prop}" type="text" value="${hex.toUpperCase()}" onchange="applyHexInput('${prop}', this.value)" title="Wpisz kolor recznie, np. #FFBF00" class="flex-1 w-full bg-carbon-800 border border-carbon-700 text-gray-200 rounded px-2 py-1 text-xs font-mono focus:outline-none focus:border-bursztyn-500">
            </div>
            <div class="bws-sv" style="position:relative;height:64px;border:1px solid #555;cursor:crosshair;background:${svBg};">
                <div class="bws-dot-sv"></div>
            </div>
            <div class="bws-hue" style="position:relative;height:12px;margin-top:4px;border:1px solid #555;cursor:crosshair;background:linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00);">
                <div class="bws-dot-hue"></div>
            </div>
            <div class="flex items-center gap-2 mt-1">
                <label class="text-[9px] text-gray-400 font-bold tracking-widest">ALFA</label>
                <input type="range" min="0" max="255" value="${a}" oninput="updateColorAlphaLive('${prop}', this.value)" onchange="updateUI()" class="flex-1 accent-amber-500">
                <span id="bws-alphaval-${prop}" class="text-[9px] text-gray-400 w-7 text-right font-mono">${a}</span>
            </div>
        </div>`;
}

/* =========================================================================
 * Plynnie probnik kolorow: kwadrat nasycenie/jasnosc + pasek odcienia.
 * Przeciaganie kursorem aktualizuje kolor "na zywo" (bez pelnego
 * przerenderowania panelu, co przerywaloby gest).
 * ========================================================================= */

function bwsSelectedEl() { return selectedId != null ? elements.find(e => e.id === selectedId) : null; }

function syncPickerDom(prop) {
    const el = bwsSelectedEl(); if (!el) return;
    const val = el[prop];
    if (val === undefined) return;
    const parsed = parseBursztynColor(val);
    const sw = document.getElementById('bws-swatch-' + prop);
    if (sw) sw.style.background = bursztynToRGBA(val);
    const inp = document.getElementById('bws-hex-' + prop);
    if (inp && document.activeElement !== inp) inp.value = parsed.hex.toUpperCase();
    const av = document.getElementById('bws-alphaval-' + prop);
    if (av) av.textContent = parsed.a;
    positionPickerDots(prop);
}

function positionPickerDots(prop) {
    const cont = propertiesPanel.querySelector(`[data-bws-picker][data-prop="${prop}"]`);
    if (!cont) return;
    const el = bwsSelectedEl(); if (!el || el[prop] === undefined) return;
    const { hex } = parseBursztynColor(el[prop]);
    const { h, s, v } = hexToHsv(hex);
    const svDot = cont.querySelector('.bws-dot-sv');
    if (svDot) {
        svDot.style.left = (s * 100) + '%';
        svDot.style.top = ((1 - v) * 100) + '%';
        svDot.style.background = hex.toUpperCase();
    }
    const hueDot = cont.querySelector('.bws-dot-hue');
    if (hueDot) {
        hueDot.style.left = ((h / 360) * 100) + '%';
        hueDot.style.top = '50%';
    }
}

function bwsSetPropLive(prop, hex) {
    const el = bwsSelectedEl();
    if (!el || el[prop] === undefined) return;
    const alpha = parseBursztynColor(el[prop]).a;
    el[prop] = buildBursztynColor(alpha, hex);
    renderCanvas();
    syncPickerDom(prop);
}

function attachColorPicker(cont) {
    const prop = cont.dataset.prop;
    const sv = cont.querySelector('.bws-sv');
    const hue = cont.querySelector('.bws-hue');

    function curHsv() {
        const el = bwsSelectedEl();
        if (!el || el[prop] === undefined) return { h: 36, s: 1, v: 1 };
        return hexToHsv(parseBursztynColor(el[prop]).hex);
    }
    function relPos(e, rectEl) {
        const r = rectEl.getBoundingClientRect();
        const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
        const y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
        return { x, y };
    }
    function startDrag(mode, e) {
        e.preventDefault();
        const pick = ev => {
            if (!bwsSelectedEl()) return;
            const c = curHsv();
            if (mode === 'sv') {
                const p = relPos(ev, sv);
                bwsSetPropLive(prop, hsvToHex(c.h, p.x, 1 - p.y));
            } else {
                const p = relPos(ev, hue);
                bwsSetPropLive(prop, hsvToHex(p.x * 360, c.s, c.v));
            }
        };
        pick(e);
        const mv = ev => pick(ev);
        const up = () => {
            document.removeEventListener('pointermove', mv);
            document.removeEventListener('pointerup', up);
            updateUI(); // pelne odswiezenie po zakonczeniu gestu
        };
        document.addEventListener('pointermove', mv);
        document.addEventListener('pointerup', up);
    }

    sv.addEventListener('pointerdown', e => startDrag('sv', e));
    hue.addEventListener('pointerdown', e => startDrag('hue', e));
}

function initColorPickers() {
    propertiesPanel.querySelectorAll('[data-bws-picker]').forEach(cont => {
        attachColorPicker(cont);
        positionPickerDots(cont.dataset.prop);
    });
}

/* Reczne wpisanie wartosci koloru (#RRGGBB) w polu edycyjnym. */
window.applyHexInput = function (prop, value) {
    let v = String(value || '').trim().replace('#', '');
    const el = bwsSelectedEl();
    if (el && /^[0-9a-fA-F]{6}$/.test(v) && el[prop] !== undefined) {
        const a = parseBursztynColor(el[prop]).a;
        el[prop] = buildBursztynColor(a, '#' + v);
    }
    updateUI(); // przy bledzie przywraca poprzednia wartosc w polu
};

/* Suwak alfy - aktualizacja na zywo bez przerenderowania panelu. */
window.updateColorAlphaLive = function (prop, val) {
    const el = bwsSelectedEl();
    if (!el || el[prop] === undefined) return;
    const { hex } = parseBursztynColor(el[prop]);
    el[prop] = buildBursztynColor(val, hex);
    renderCanvas();
    const sw = document.getElementById('bws-swatch-' + prop);
    if (sw) sw.style.background = bursztynToRGBA(el[prop]);
    const av = document.getElementById('bws-alphaval-' + prop);
    if (av) av.textContent = parseBursztynColor(el[prop]).a;
};

/* Wlacz/wylacz przyciski paska tytulu okna glownego. */
window.toggleBorderIcon = function (name, checked) {
    const el = bwsSelectedEl();
    if (!el || el.type !== 'window') return;
    el[name] = !!checked;
    updateUI();
};

/* =========================================================================
 * Edytor wizualny logiki (bloki akcji API BWS)
 * ========================================================================= */

let activeVisualTargetId = null;
let tempVisualEvents = [];

function openVisualModal(id) {
    activeVisualTargetId = id;
    const el = elements.find(e => e.id === id);
    document.getElementById('visual-modal-target-name').innerText = `Komponent: ${el.name} (${el.type})`;
    tempVisualEvents = JSON.parse(JSON.stringify(el.visualEvents || []));
    renderVisualWorkspace(); document.getElementById('visual-modal').classList.add('active');
}
function closeVisualModal() { document.getElementById('visual-modal').classList.remove('active'); activeVisualTargetId = null; }

function saveVisualModal() {
    const el = elements.find(e => e.id === activeVisualTargetId);
    el.visualEvents = JSON.parse(JSON.stringify(tempVisualEvents));
    syncVisualToCode(el); closeVisualModal(); updateUI();
}

window.addVisualEventModal = function (type) {
    let newEv = { type, params: {}, uid: Math.random().toString(36).slice(2, 8) };
    ACTION_TYPES[type].params.forEach(p => newEv.params[p.name] = p.default);
    tempVisualEvents.push(newEv); renderVisualWorkspace();
}
window.updateTempVisualParam = function (evIndex, paramName, value) {
    tempVisualEvents[evIndex].params[paramName] = value;
    liveSyncScript();
}
window.removeTempVisualEvent = function (evIndex) { tempVisualEvents.splice(evIndex, 1); renderVisualWorkspace(); }
window.moveTempEvent = function (evIndex, dir) {
    const j = evIndex + dir;
    if (j < 0 || j >= tempVisualEvents.length) return;
    [tempVisualEvents[evIndex], tempVisualEvents[j]] = [tempVisualEvents[j], tempVisualEvents[evIndex]];
    renderVisualWorkspace();
}

/* Przenosi akcje z przegladarki API do biezacego edytowanego komponentu. */
window.insertApiSnippetAsAction = function (syscallNr) {
    const entry = BWS_SYSCALLS.find(s => s.nr === syscallNr);
    if (!entry) return;
    const raw = `${entry.przyklad}`;
    if (activeVisualTargetId !== null) {
        window.addVisualEventModalRaw(raw);
        return;
    }
    if (!selectedId) { alert('Najpierw zaznacz komponent, do którego ma zostać wstawione wywołanie.'); return; }
    const el = elements.find(e => e.id === selectedId);
    el.eventMode = 'visual';
    el.visualEvents.push({ type: 'raw', params: { code: raw }, uid: Math.random().toString(36).slice(2, 8) });
    syncVisualToCode(el); updateUI(); closeApiBrowser();
};

/* Dodaje surowy blok kodu bezposrednio do otwartego edytora wizualnego. */
window.addVisualEventModalRaw = function (rawCode) {
    tempVisualEvents.push({ type: 'raw', params: { code: rawCode }, uid: Math.random().toString(36).slice(2, 8) });
    renderVisualWorkspace();
};

function renderParamInput(evIdx, p, val, compact) {
    if (p.type === 'select') {
        let opts = p.options.map(o => `<option value="${o}" ${o === val ? 'selected' : ''}>${o}</option>`).join('');
        return `<select onchange="updateTempVisualParam(${evIdx}, '${p.name}', this.value)" title="${p.label}" class="${compact ? 'ws-input' : 'flex-1 bg-carbon-950 border border-carbon-700 text-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-bursztyn-500'}">${opts}</select>`;
    }
    if (p.type === 'win') {
        const opts = elements.filter(e => ['TChildWindow', 'TModalWindow', 'TPopupWindow'].includes(e.type));
        const sel = opts.map(o => `<option value="${o.id}" ${String(val) === String(o.id) ? 'selected' : ''}>${o.name}</option>`).join('');
        return `<select onchange="updateTempVisualParam(${evIdx}, '${p.name}', this.value)" title="${p.label}" class="${compact ? 'ws-input' : 'flex-1 bg-carbon-950 border border-carbon-700 text-gray-200 rounded px-2 py-1 text-xs'}">${sel || '<option value="">— brak pod-okien —</option>'}</select>`;
    }
    if (p.type === 'textarea') {
        return `<textarea onchange="updateTempVisualParam(${evIdx}, '${p.name}', this.value)" rows="${compact ? 2 : 3}" placeholder="${p.label}" class="w-full ${compact ? 'ws-input' : 'bg-carbon-950 border border-carbon-700 text-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-bursztyn-500 font-mono custom-scrollbar'}">${val}</textarea>`;
    }
    const inputType = (p.type === 'number') ? 'number' : ((p.type === 'color' || p.type === 'ip') ? 'text' : 'text');
    return `<input type="${inputType}" value="${val}" onchange="updateTempVisualParam(${evIdx}, '${p.name}', this.value)" placeholder="${p.label}" class="w-full ${compact ? 'ws-input' : 'bg-carbon-950 border border-carbon-700 text-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-bursztyn-500 font-mono'}">`;
}

/* Pole parametru klocka z widocznym podpisem wyjasniajacym (np. "X", "Szerokość").
 * Podpis jest zawsze widoczny — nie znika przy wpisywaniu jak placeholder. */
function wsParamField(evIdx, p, val) {
    return `<label class="ws-field" title="${p.label}">
        <span class="ws-lbl">${p.label}</span>
        ${renderParamInput(evIdx, p, val, true)}
    </label>`;
}

/* =========================================================================
 * Pomoc bloku: ikona "?" pokazuje opis, znaczenie pol i podglad kodu C++.
 * ========================================================================= */

window.showBlockHelp = function (key, anchorEl) {
    const def = ACTION_TYPES[key];
    if (!def) return;
    const meta = catMeta(def.kat);

    // Podglad wygenerowanego kodu na domyslnych wartosciach
    let codePreview = '';
    try {
        const p0 = {};
        (def.params || []).forEach(pp => p0[pp.name] = pp.default);
        codePreview = String(def.emit(p0, { uid: 'przyklad' }) || '').trim();
        if (def.wrap === 'close') codePreview = '}';
        if (def.wrap === 'else') codePreview = '} else {';
    } catch (_) { codePreview = ''; }

    const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const paramsHtml = (def.params || []).map(p => `
        <div class="flex gap-2 items-baseline">
            <span class="text-bursztyn-400 font-bold text-[10px] min-w-[110px] inline-block">${esc(p.label)}</span>
            <span class="text-gray-400 text-[10px]">(${p.type}${p.options ? ': ' + p.options.join('/') : ''})${p.default !== undefined && p.default !== '' ? ` — np. <span class="font-mono">${esc(p.default)}</span>` : ''}</span>
        </div>`).join('');

    const kindText = def.hat ? '🟡 Blok startowy (hat) — określa, KIEDY wykona się zawartość skryptu.'
        : def.wrap === 'open' ? '▼ Otwiera zakres — kolejne bloki aż do „koniec" wykonują się w jego wnętrzu.'
            : def.wrap === 'close' ? '▲ Zamyka ostatni otwarty zakres (pętlę / warunek / funkcję).'
                : def.wrap === 'else' ? '◆ Przełącza ostatni blok „jeżeli" na gałąź przeciwną.'
                    : 'Zwykła akcja — wykonuje się w miejscu, w którym ją postawisz.';

    let pop = document.getElementById('bws-help-pop');
    if (!pop) {
        pop = document.createElement('div');
        pop.id = 'bws-help-pop';
        document.body.appendChild(pop);
    }

    pop.innerHTML = `
        <div class="flex justify-between items-start gap-3 mb-1">
            <div class="font-bold text-sm" style="color:${meta.color}">${def.icon} ${esc(def.name)}</div>
            <button onclick="document.getElementById('bws-help-pop').style.display='none'" style="background:rgba(255,255,255,.12);color:#fff;border-radius:4px;padding:1px 6px;font-size:10px">✕</button>
        </div>
        <div class="text-[9px] uppercase tracking-widest mb-2 opacity-70">${meta.name}</div>
        ${def.opis ? `<div class="text-[11px] leading-relaxed mb-2">${esc(def.opis)}</div>` : ''}
        <div class="text-[10px] text-gray-300 mb-2 italic">${kindText}</div>
        ${paramsHtml ? `<div class="mb-2"><div class="text-[9px] uppercase tracking-widest text-gray-500 mb-1">Pola:</div>${paramsHtml}</div>` : ''}
        ${codePreview ? `<div><div class="text-[9px] uppercase tracking-widest text-gray-500 mb-1">Generuje (C++):</div><pre class="text-[9px] bg-black/50 rounded p-2 overflow-x-auto whitespace-pre-wrap border border-carbon-700 font-mono">${esc(codePreview)}</pre></div>` : ''}
    `;
    pop.style.display = 'block';

    // Pozycjonowanie obok kliknietego "?"
    if (anchorEl && anchorEl.getBoundingClientRect) {
        const r = anchorEl.getBoundingClientRect();
        const W = Math.min(430, window.innerWidth - 24);
        pop.style.width = W + 'px';
        const x = Math.min(window.innerWidth - W - 12, Math.max(12, r.left - 60));
        let y = r.bottom + 8;
        if (y + 280 > window.innerHeight) y = Math.max(12, Math.max(12, r.top - 300));
        pop.style.left = x + 'px';
        pop.style.top = y + 'px';
    }
};

// Zamkniecie podpowiedzi klikiem gdziekolwiek indziej lub klawiszem Escape
document.addEventListener('mousedown', (e) => {
    const pop = document.getElementById('bws-help-pop');
    if (pop && pop.style.display === 'block' && !pop.contains(e.target) && !(e.target.closest && e.target.closest('.ws-help'))) {
        pop.style.display = 'none';
    }
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const pop = document.getElementById('bws-help-pop');
        if (pop) pop.style.display = 'none';
    }
});

/* =========================================================================
 * Pelny ekran edytora wizualnego
 * ========================================================================= */

window.toggleVisualFullscreen = function () {
    const modal = document.getElementById('visual-modal');
    if (!modal) return;
    const goingFs = !modal.classList.contains('fs-mode');
    modal.classList.toggle('fs-mode', goingFs);
    const btn = document.getElementById('btn-visual-fs');
    if (btn) btn.innerHTML = goingFs ? '⛶ Zwykły rozmiar' : '⛶ Pełny ekran';
    try {
        if (goingFs && modal.requestFullscreen) modal.requestFullscreen().catch(() => {});
        else if (!goingFs && document.fullscreenElement === modal && document.exitFullscreen) document.exitFullscreen().catch(() => {});
    } catch (_) { /* fallback CSS wystarczy */ }
};

document.addEventListener('fullscreenchange', () => {
    const modal = document.getElementById('visual-modal');
    if (!modal) return;
    const nativeFs = document.fullscreenElement === modal;
    if (!nativeFs) {
        modal.classList.remove('fs-mode');
        const btn = document.getElementById('btn-visual-fs');
        if (btn) btn.innerHTML = '⛶ Pełny ekran';
    }
});

/* =========================================================================
 * Obszar roboczy typu Scratch: klocki z zagniezdzeniem (kontrola), przeciaganie
 * miedzy paleta a obszarem, zoom (+ / - / =) i rozszerzenia.
 * ========================================================================= */

let visualZoom = 1;
let dndBlock = null; // {source:'palette', key} lub {source:'ws', index}
let dropIndex = -1;

window.setWsZoom = function (mode) {
    if (mode === 'in') visualZoom = Math.min(1.8, visualZoom + 0.15);
    else if (mode === 'out') visualZoom = Math.max(0.5, visualZoom - 0.15);
    else visualZoom = 1;
    applyWsZoom();
};

function applyWsZoom() {
    const el = document.getElementById('ws-canvas');
    if (el) {
        el.style.transform = `scale(${visualZoom})`;
        el.style.transformOrigin = 'top left';
        el.style.width = (100 / visualZoom) + '%';
    }
    const lbl = document.getElementById('ws-zoom-label');
    if (lbl) lbl.textContent = Math.round(visualZoom * 100) + '%';
}

/* Na zywo odswieza kod C++ edytowanego komponentu podczas edycji parametrow. */
function liveSyncScript() {
    if (activeVisualTargetId !== null) {
        const el = elements.find(e => e.id === activeVisualTargetId);
        if (el) syncVisualToCode(el);
    }
}

function renderVisualWorkspace() {
    tempVisualEvents.forEach(ensureEventUid);
    liveSyncScript();

    const container = document.getElementById('visual-blocks-container');
    let depth = 0;
    let html = '';

    tempVisualEvents.forEach((ev, idx) => {
        const def = ACTION_TYPES[ev.type];
        if (!def) return;
        const meta = catMeta(def.kat);
        const color = meta.color;
        const pad = depth * 24;
        html += `<div class="ws-insert ${dropIndex === idx ? 'active' : ''}" data-insert="${idx}"></div>`;

        const badge = def.hat ? '<span class="text-[8px] uppercase tracking-wider font-black opacity-80">▶ start</span>'
            : (def.wrap === 'open' ? '<span class="text-[8px] opacity-70">▼ otwiera zakres</span>'
                : (def.wrap === 'close' ? '<span class="text-[8px] opacity-70">▲ zamyka</span>' : ''));

        html += `<div draggable="true" data-ws-index="${idx}" class="ws-block" style="--blk:${color};margin-left:${pad}px;">
            <span class="text-lg leading-none shrink-0">${def.icon}</span>
            <div class="flex-1 min-w-0">
                <div class="font-bold text-[11px] flex items-center gap-2 flex-wrap">
                    <span>${def.name}</span> ${badge}
                    <button onclick="showBlockHelp('${ev.type}', this)" title="Co robi ten blok i jak użyć?" class="ws-btn ws-help">?</button>
                </div>
                ${(def.params && def.params.length) ? `<div class="mt-1 grid grid-cols-2 gap-x-2 gap-y-1">${def.params.map(pp => wsParamField(idx, pp, ev.params[pp.name] !== undefined ? ev.params[pp.name] : pp.default)).join('')}</div>` : ''}
            </div>
            <div class="flex flex-col gap-0.5 shrink-0">
                <button onclick="moveTempEvent(${idx},-1)" title="Wyżej" class="ws-btn">▲</button>
                <button onclick="moveTempEvent(${idx},1)" title="Niżej" class="ws-btn">▼</button>
            </div>
            <button onclick="removeTempVisualEvent(${idx})" title="Usuń blok" class="ws-btn ws-btn-del shrink-0">✕</button>
        </div>`;

        if (def.wrap === 'open') depth++;
        if (def.wrap === 'close' && depth > 0) depth--;
    });

    html += `<div class="ws-insert ${dropIndex >= tempVisualEvents.length ? 'active' : ''}" data-insert="${tempVisualEvents.length}"></div>`;

    // Ostrzezenia o niedomknietych blokach
    let openCount = depth;
    while (openCount > 0) {
        openCount--;
        html += `<div class="ws-block ws-missing" style="margin-left:${openCount * 24}px"><span>⚠</span><span class="text-[10px]">brakujący blok "koniec"</span></div>`;
    }

    container.innerHTML = html || '<div class="text-gray-500">Przeciągnij klocki z palety po lewej albo kliknij, aby dodać.</div>';
    bindWsDnD();
    applyWsZoom();
}

function bindWsDnD() {
    const cont = document.getElementById('visual-workspace');
    if (!cont) return;

    // Przeciaganie istniejacych klockow (reorganizacja)
    document.querySelectorAll('#visual-blocks-container [data-ws-index]').forEach(chip => {
        // Klasyczny fix: input/select/textarea wewnatrz elementu draggable
        // nie lapia fokusu, dopoki rodzic jest draggable — wylaczamy to
        // na czas interakcji z polem i przywracamy po puszczeniu myszy.
        chip.addEventListener('mousedown', (e) => {
            if (e.target.closest('input, select, textarea')) chip.draggable = false;
        });
        const restoreDrag = () => { chip.draggable = true; };
        chip.addEventListener('mouseup', restoreDrag);
        chip.addEventListener('mouseleave', restoreDrag);

        chip.addEventListener('dragstart', (e) => {
            dndBlock = { source: 'ws', index: parseInt(chip.dataset.wsIndex, 10) };
            e.dataTransfer.setData('text/plain', 'bws-ws');
            e.dataTransfer.effectAllowed = 'move';
        });
        chip.addEventListener('dragend', () => {
            restoreDrag();
            dndBlock = null; dropIndex = -1; renderVisualWorkspace();
        });
    });

    // Strefy wstawiania
    document.querySelectorAll('#visual-blocks-container .ws-insert').forEach(zone => {
        zone.addEventListener('dragover', (e) => {
            if (!dndBlock) return;
            e.preventDefault();
            dropIndex = parseInt(zone.dataset.insert, 10);
            document.querySelectorAll('.ws-insert').forEach(z => z.classList.remove('active'));
            zone.classList.add('active');
        });
        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            handleBlockDrop(parseInt(zone.dataset.insert, 10));
        });
    });

    // Upuszczenie gdziekolwiek w obszarze = wstaw na koncu
    cont.addEventListener('dragover', (e) => { if (dndBlock) e.preventDefault(); });
    cont.addEventListener('drop', (e) => {
        if (!dndBlock) return;
        e.preventDefault();
        if (dropIndex < 0) handleBlockDrop(tempVisualEvents.length);
        dropIndex = -1;
    });
}

function handleBlockDrop(beforeIdx) {
    if (!dndBlock) { dropIndex = -1; renderVisualWorkspace(); return; }

    if (dndBlock.source === 'palette') {
        const def = ACTION_TYPES[dndBlock.key];
        if (def) {
            const ev = { type: dndBlock.key, params: {}, uid: Math.random().toString(36).slice(2, 8) };
            (def.params || []).forEach(p => ev.params[p.name] = p.default);
            const at = Math.max(0, Math.min(tempVisualEvents.length, beforeIdx));
            tempVisualEvents.splice(at, 0, ev);
        }
    } else {
        const from = dndBlock.index;
        const [item] = tempVisualEvents.splice(from, 1);
        const to = Math.max(0, Math.min(tempVisualEvents.length, beforeIdx > from ? beforeIdx - 1 : beforeIdx));
        tempVisualEvents.splice(to, 0, item);
    }

    dndBlock = null;
    dropIndex = -1;
    renderVisualWorkspace();
}

/* =========================================================================
 * Rozszerzenia (przycisk "+ Dodaj rozszerzenie")
 * ========================================================================= */

window.toggleExtMenu = function () {
    const menu = document.getElementById('ext-menu');
    if (!menu) return;
    if (!menu.classList.contains('hidden')) { menu.classList.add('hidden'); return; }
    menu.innerHTML = window.listExtensions().map(ext => `
        <button onclick="addExtension('${ext.id}'); toggleExtMenu();" class="block w-full text-left px-3 py-2 hover:bg-carbon-700 text-[11px] ${ext.loaded ? 'opacity-50' : ''}">
            ${ext.icon} ${ext.name}${ext.loaded ? ' ✓' : ''}
        </button>`).join('');
    menu.classList.remove('hidden');
};

window.setEventMode = function (mode) {
    if (!selectedId) return;
    const el = elements.find(e => e.id === selectedId); el.eventMode = mode;
    if (mode === 'visual') syncVisualToCode(el); updateUI();
}

Object.assign(window, {
    renderProperties, openVisualModal, closeVisualModal, saveVisualModal,
    renderVisualWorkspace, setEventMode,
    initColorPickers,
    setWsZoom, toggleExtMenu,
    showBlockHelp, toggleVisualFullscreen
});
