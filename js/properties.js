/* =========================================================================
 * Bursztyn Builder RAD v3.0 - inspektor obiektow i edytor wizualny logiki
 * ========================================================================= */

function renderProperties() {
    if (!selectedId) { propertiesPanel.innerHTML = '<div class="text-gray-600 text-center mt-10 text-xs">Wybierz komponent z płótna.</div>'; return; }
    const el = elements.find(e => e.id === selectedId); if (!el) return;

    let html = `<div class="mb-3 border-b border-carbon-800 pb-2"><input type="text" value="${el.name}" onchange="updateElementProp(${selectedId}, 'name', this.value)" class="w-full bg-transparent text-bursztyn-400 font-bold text-sm focus:outline-none border-b border-transparent focus:border-bursztyn-500"><div class="text-[10px] text-gray-500 mt-1">Typ: ${el.type}</div></div>`;
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
}

function createInputGroup(label, prop, value, type) {
    let extra = type === 'textarea'
        ? `<textarea onchange="updateElementProp(${selectedId}, '${prop}', this.value)" class="w-full bg-carbon-800 border border-carbon-700 text-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-bursztyn-500 h-24 font-mono custom-scrollbar" placeholder="Element 1\nElement 2...">${value || ''}</textarea>`
        : `<input type="${type}" value="${value}" onchange="updateElementProp(${selectedId}, '${prop}', this.value)" class="w-full bg-carbon-800 border border-carbon-700 text-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-bursztyn-500">`;
    return `<div><label class="block text-gray-400 text-[10px] mb-0.5 font-bold tracking-wide">${label}</label>${extra}</div>`;
}

function createColorControl(label, prop, bHexValue) {
    let { a, hex } = parseBursztynColor(bHexValue);
    return `<div class="mb-3 bg-carbon-900 p-2 rounded border border-carbon-800"><label class="block text-gray-400 text-[10px] mb-1 font-bold tracking-widest">${label}</label><div class="flex items-center gap-2"><div class="w-6 h-6 rounded border border-gray-600 shadow-sm relative overflow-hidden" style="background-color: ${bursztynToRGBA(bHexValue)};"><input type="color" value="${hex}" oninput="updateColor('${prop}', this.value, 255)" class="absolute inset-0 w-[200%] h-[200%] top-[-50%] left-[-50%] opacity-0 cursor-pointer"></div><input type="text" value="${hex.toUpperCase()}" class="flex-1 w-full bg-carbon-800 border border-carbon-700 text-gray-200 rounded px-2 py-1 text-xs font-mono" readonly></div></div>`;
}

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
    let newEv = { type, params: {} };
    ACTION_TYPES[type].params.forEach(p => newEv.params[p.name] = p.default);
    tempVisualEvents.push(newEv); renderVisualWorkspace();
}
window.updateTempVisualParam = function (evIndex, paramName, value) { tempVisualEvents[evIndex].params[paramName] = value; }
window.removeTempVisualEvent = function (evIndex) { tempVisualEvents.splice(evIndex, 1); renderVisualWorkspace(); }

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
    el.visualEvents.push({ type: 'raw', params: { code: raw } });
    syncVisualToCode(el); updateUI(); closeApiBrowser();
};

/* Dodaje surowy blok kodu bezposrednio do otwartego edytora wizualnego. */
window.addVisualEventModalRaw = function (rawCode) {
    tempVisualEvents.push({ type: 'raw', params: { code: rawCode } });
    renderVisualWorkspace();
};

function renderParamInput(evIdx, p, val) {
    if (p.type === 'select') {
        let opts = p.options.map(o => `<option value="${o}" ${o === val ? 'selected' : ''}>${o}</option>`).join('');
        return `<select onchange="updateTempVisualParam(${evIdx}, '${p.name}', this.value)" class="flex-1 bg-carbon-950 border border-carbon-700 text-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-bursztyn-500">${opts}</select>`;
    }
    if (p.type === 'textarea') {
        return `<textarea onchange="updateTempVisualParam(${evIdx}, '${p.name}', this.value)" rows="3" class="flex-1 bg-carbon-950 border border-carbon-700 text-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-bursztyn-500 font-mono custom-scrollbar">${val}</textarea>`;
    }
    const inputType = (p.type === 'number') ? 'number' : ((p.type === 'color' || p.type === 'ip') ? 'text' : 'text');
    return `<input type="${inputType}" value="${val}" onchange="updateTempVisualParam(${evIdx}, '${p.name}', this.value)" class="flex-1 bg-carbon-950 border border-carbon-700 text-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-bursztyn-500 font-mono">`;
}

function renderVisualWorkspace() {
    let html = '';
    tempVisualEvents.forEach((ev, idx) => {
        const def = ACTION_TYPES[ev.type];
        if (!def) return;
        html += `<div class="bg-carbon-800 border border-carbon-700 rounded p-3 mb-2"><div class="flex justify-between items-center mb-2"><span class="text-sm font-bold text-bursztyn-400 flex items-center gap-2"><span class="text-xl">${def.icon}</span> ${def.name}</span><button onclick="removeTempVisualEvent(${idx})" class="bg-red-900/80 hover:bg-red-800 px-2 py-0.5 rounded text-xs text-white">Usuń</button></div><div class="flex flex-col gap-2">`;
        def.params.forEach(p => {
            let val = ev.params[p.name] !== undefined ? ev.params[p.name] : p.default;
            html += `<div class="flex items-center gap-3"><label class="text-xs text-gray-400 w-32 text-right shrink-0">${p.label}</label>${renderParamInput(idx, p, val)}</div>`;
        });
        html += `</div></div>`;
    });
    document.getElementById('visual-blocks-container').innerHTML = html || '<div class="text-gray-500">Brak akcji. Wybierz z panelu po lewej (pełne API BWS 1–56).</div>';
}

window.setEventMode = function (mode) {
    if (!selectedId) return;
    const el = elements.find(e => e.id === selectedId); el.eventMode = mode;
    if (mode === 'visual') syncVisualToCode(el); updateUI();
}

Object.assign(window, {
    renderProperties, openVisualModal, closeVisualModal, saveVisualModal,
    renderVisualWorkspace, setEventMode
});
