/* =========================================================================
 * Bursztyn Builder RAD v3.0 - edytor: paleta, plotno, drzewo, menu kontekstowe
 * ========================================================================= */

const canvas = document.getElementById('canvas');
const propertiesPanel = document.getElementById('properties-panel');
const treePanel = document.getElementById('element-tree');
const ctxMenu = document.getElementById('context-menu');

let isDragging = false, isResizing = false;
let resizeDir = '', dragTarget = null;
let startX, startY, initialX, initialY, initialW, initialH;

/* ------------------------------ Paleta -------------------------------- */

function toggleAccordion(id) { document.getElementById(id).classList.toggle('open'); }

let paletteFilter = '';

window.setPaletteFilter = function (v) {
    paletteFilter = String(v || '').trim();
    buildPalette();
};

/* Wspolny kafelek komponentu z tooltipem pokazujacym uzywane API BWS. */
function paletteButtonHtml(comp) {
    let textArg = comp.name;
    if (['TComboBox', 'TListBox', 'TCheckListBox', 'TMainMenu', 'TPopupMenu'].includes(comp.type)) textArg = "Plik\\nEdycja\\nWidok";
    else if (comp.type === 'TRadioGroup') textArg = "Opcje\\nOpcja 1\\nOpcja 2";

    let onClickStr = `addElement('${comp.type}', 100, 100, ${comp.w}, ${comp.h}, '${textArg}')`;
    const apiTip = bwsApiForType(comp.type).replace(/"/g, '&quot;');
    return `
                <button onclick="${onClickStr}" title="${apiTip}" class="flex flex-col items-center justify-center p-2 bg-carbon-950 hover:bg-carbon-800 rounded border border-carbon-800 hover:border-bursztyn-500 transition-all group">
                    <span class="text-base group-hover:scale-110 transition-transform">${comp.icon}</span>
                    <span class="text-[9px] text-gray-400 mt-1 text-center leading-tight overflow-hidden text-ellipsis w-full whitespace-nowrap">${comp.name}</span>
                </button>
            `;
}

/* Wyniki wyszukiwania: filtrowanie po nazwie/typie/kategorii + automatyczne
 * sortowanie (trafienia "zaczyna sie od..." najpierw, potem alfabetycznie). */
function renderFilteredPalette(container) {
    const q = foldPl(paletteFilter);
    let matches = [];
    for (const [catName, components] of Object.entries(COMPONENT_DB)) {
        components.forEach(comp => {
            const hay = foldPl(comp.name + ' ' + comp.type + ' ' + catName);
            if (hay.includes(q)) matches.push(Object.assign({}, comp, { catName }));
        });
    }
    matches.sort((a, b) => {
        const pa = (foldPl(a.name).startsWith(q) || foldPl(a.type).startsWith(q)) ? 0 : 1;
        const pb = (foldPl(b.name).startsWith(q) || foldPl(b.type).startsWith(q)) ? 0 : 1;
        if (pa !== pb) return pa - pb;
        return a.name.localeCompare(b.name, 'pl');
    });

    let html = `<div class="text-[9px] text-gray-500 px-1 pb-1">${matches.length} wynik(ów) — posortowane</div>`;
    html += `<div class="grid grid-cols-2 gap-1">`;
    matches.forEach(comp => { html += paletteButtonHtml(comp); });
    html += `</div>`;
    container.innerHTML = html;
}

function buildPalette() {
    const container = document.getElementById('palette-container');

    if (paletteFilter !== '') { renderFilteredPalette(container); return; }

    let html = '';
    for (const [catName, components] of Object.entries(COMPONENT_DB)) {
        let catId = 'cat-' + catName.replace(/[^a-zA-Z]/g, '');
        html += `
            <div class="bg-carbon-800 rounded border border-carbon-700 overflow-hidden mb-1">
                <button onclick="toggleAccordion('${catId}')" class="w-full text-left px-3 py-1.5 bg-carbon-800 hover:bg-carbon-700 text-[9px] font-bold text-gray-300 border-b border-carbon-700 flex justify-between items-center tracking-widest uppercase">
                    ${catName} <span class="text-bursztyn-500">▼</span>
                </button>
                <div id="${catId}" class="accordion-content ${catName.includes('Podstawowe') ? 'open' : ''} grid-cols-2 gap-1 p-1 bg-carbon-900">
        `;
        components.forEach(comp => { html += paletteButtonHtml(comp); });
        html += `</div></div>`;
    }
    container.innerHTML = html;
    buildBlocksPalette();
}

/* Paleta bloków Edytora Wizualnego - kategorie kolorami jak w Scratch,
 * z polem wyszukiwania (automatyczne sortowanie wyników) i przeciaganiem
 * klockow do obszaru roboczego. */
let blockFilter = '';

window.setBlockFilter = function (v) {
    blockFilter = String(v || '').trim();
    buildBlocksPalette();
};

function catMeta(kat) {
    return BLOCK_CATS.find(c => c.id === kat) || { id: 'api', name: 'API BWS', color: '#E58A00' };
}

function hexAlpha(hexColor, a) {
    const h = String(hexColor || '#888888').replace('#', '');
    const r = parseInt(h.substring(0, 2), 16) || 0;
    const g = parseInt(h.substring(2, 4), 16) || 0;
    const b = parseInt(h.substring(4, 6), 16) || 0;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function blockChipHtml(key, def) {
    const meta = catMeta(def.kat);
    const wrapBadge = def.hat ? '▶ blok startowy'
        : (def.wrap === 'open' ? '▼ otwiera zakres'
            : (def.wrap === 'close' ? '▲ zamyka zakres'
                : (def.wrap === 'else' ? '◆ przeciwna gałąź' : '')));
    // Klik = dopisz blok na koniec skryptu; przeciaganie = wstaw w wybranym miejscu.
    return `<button draggable="true" data-block="${key}" onclick="addVisualEventModal('${key}')" title="${meta.name} — ${def.name}" class="block-chip ${def.hat ? 'hat-block' : ''}" style="border-left-color:${meta.color};background:linear-gradient(90deg, ${hexAlpha(meta.color, 0.22)}, rgba(24,24,24,0.92));">
        <span class="text-base shrink-0">${def.icon}</span>
        <span class="flex-1 min-w-0 text-left leading-tight">
            <span class="font-bold text-[10px] block truncate">${def.name}</span>
            ${wrapBadge ? `<span class="text-[8px] opacity-70">${wrapBadge}</span>` : ''}
        </span>
    </button>`;
}

/* Wyszukiwanie akcji: filtrowanie po nazwie/kodzie/kategorii + sortowanie
 * automatyczne (trafienia "zaczyna się od..." najpierw, potem alfabetycznie). */
function renderFilteredBlocks(container) {
    const q = foldPl(blockFilter);
    let matches = [];
    for (const key in ACTION_TYPES) {
        const def = ACTION_TYPES[key];
        const hay = foldPl(def.name + ' ' + key + ' ' + catMeta(def.kat).name);
        if (hay.includes(q)) matches.push({ key, def });
    }
    matches.sort((a, b) => {
        const pa = foldPl(a.def.name).startsWith(q) ? 0 : 1;
        const pb = foldPl(b.def.name).startsWith(q) ? 0 : 1;
        if (pa !== pb) return pa - pb;
        return a.def.name.localeCompare(b.def.name, 'pl');
    });
    container.innerHTML =
        `<div class="text-[9px] text-gray-500 px-1 pb-1">${matches.length} wynik(ów) — posortowane</div>
         <div class="grid grid-cols-1 gap-1">${matches.map(m => blockChipHtml(m.key, m.def)).join('')}</div>`;
}

function buildBlocksPalette() {
    const container = document.getElementById('blocks-palette');
    if (!container) return;

    if (blockFilter !== '') {
        renderFilteredBlocks(container);
        bindBlockDrag(container);
        return;
    }

    let html = '';
    BLOCK_CATS.forEach(cat => {
        const keys = Object.keys(ACTION_TYPES).filter(k => ACTION_TYPES[k].kat === cat.id);
        if (!keys.length) return;
        html += `<div class="mt-3 first:mt-0">
            <div class="text-[9px] font-bold uppercase tracking-widest mb-1 px-1.5 py-0.5 rounded" style="color:${cat.color};background:${hexAlpha(cat.color, 0.15)}">${cat.name}</div>
            <div class="flex flex-col gap-1">`;
        keys.forEach(k => { html += blockChipHtml(k, ACTION_TYPES[k]); });
        html += `</div></div>`;
    });
    container.innerHTML = html;
    bindBlockDrag(container);
}

/* Umozliwia przeciaganie klocka z palety do obszaru roboczego (Scratch). */
function bindBlockDrag(container) {
    container.querySelectorAll('[data-block]').forEach(chip => {
        chip.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('application/x-bws-block', chip.dataset.block);
            e.dataTransfer.effectAllowed = 'copy';
        });
    });
}

/* --------------------------- Zakladki formularzy ----------------------- */

function renderTabs() {
    const bar = document.getElementById('form-tabs');
    if (!bar) return;
    ensureActiveForm();
    let html = '';
    formsList().forEach(f => {
        const icon = f.type === 'window' ? '🏠' : '🪟';
        const active = f.id === activeFormId;
        html += `<button onclick="selectFormTab(${f.id})" class="form-tab ${active ? 'active' : ''}" title="${f.type === 'window' ? 'Okno główne' : 'Okno podrzędne — własna zakładka'}">${icon} ${f.name}</button>`;
    });
    bar.innerHTML = html;
}

/* ------------------------------ Drzewo --------------------------------- */

let dragTreeId = null;

function treeDropReorder(srcId, targetId) {
    if (!srcId || !targetId || srcId === targetId) return;
    // Kolejnosc wyswietlania = z malejaco (najwyzszy u gory).
    const list = [...elements].sort((a, b) => b.z - a.z);
    const si = list.findIndex(x => x.id === srcId);
    if (si < 0) return;
    const [item] = list.splice(si, 1);
    const ti = list.findIndex(x => x.id === targetId);
    if (ti < 0) list.push(item); else list.splice(ti, 0, item);
    // Natychmiastowa aktualizacja parametru z-order.
    list.forEach((el, i) => { el.z = list.length - 1 - i; });
    updateUI();
}

/* Elementy widoczne na aktywnej karcie formularza. */
function visibleElements() {
    return elements.filter(el => {
        if (FORM_TYPES.includes(el.type)) {
            if (el.type === 'window') return el.formId === activeFormId;
            return el.hostFormId === activeFormId; // podokno na karcie rodzica
        }
        return el.formId === activeFormId;
    });
}

function renderTree() {
    treePanel.innerHTML = '';
    const sortedElements = [...visibleElements()].sort((a, b) => b.z - a.z);
    if (!sortedElements.length) {
        treePanel.innerHTML = '<div class="text-[10px] text-gray-600 italic px-1">Pusto — dodaj komponent lub przełącz zakładkę.</div>';
        return;
    }
    sortedElements.forEach(el => {
        const btn = document.createElement('div');
        btn.className = `tree-item px-2 py-1.5 rounded transition-colors flex items-center gap-2 ${selectedId === el.id ? 'bg-bursztyn-600 text-white font-bold' : 'text-gray-400 hover:bg-carbon-800 hover:text-gray-200'}`;
        btn.draggable = true;
        btn.innerHTML = `<span>${getIconFor(el.type)}</span> <span class="truncate flex-1">${el.name}</span><span class="text-[9px] opacity-60">z:${el.z}</span>`;
        btn.title = 'Przeciągnij, aby zmienić kolejność (z-order)';
        btn.onclick = () => selectElement(el.id);
        btn.ondragstart = (e) => { dragTreeId = el.id; e.dataTransfer.setData('text/plain', String(el.id)); e.dataTransfer.effectAllowed = 'move'; };
        btn.ondragend = () => { dragTreeId = null; };
        btn.ondragover = (e) => { if (dragTreeId !== null && dragTreeId !== el.id) { e.preventDefault(); btn.classList.add('tree-over'); } };
        btn.ondragleave = () => btn.classList.remove('tree-over');
        btn.ondrop = (e) => {
            e.preventDefault();
            btn.classList.remove('tree-over');
            const srcId = parseInt(e.dataTransfer.getData('text/plain'), 10) || dragTreeId;
            treeDropReorder(srcId, el.id);
            dragTreeId = null;
        };
        treePanel.appendChild(btn);
    });
}

function updateUI() { renderTabs(); renderCanvas(); renderProperties(); renderTree(); }

/* ------------------------------- Plotno -------------------------------- */

function isNonVisual(type) { for (let cat in COMPONENT_DB) { let found = COMPONENT_DB[cat].find(c => c.type === type); if (found && found.n) return true; } return false; }
function getIconFor(type) { for (let cat in COMPONENT_DB) { let found = COMPONENT_DB[cat].find(c => c.type === type); if (found) return found.icon; } return '🧩'; }

function renderCanvas() {
    canvas.innerHTML = '';
    const SPEC_WIN = ['TChildWindow', 'TModalWindow', 'TPopupWindow'];
    const winKind = t => t === 'window' ? 0 : (SPEC_WIN.includes(t) ? 1 : 2);
    const sortedElements = [...visibleElements()].sort((a, b) => {
        const ra = winKind(a.type), rb = winKind(b.type);
        if (ra !== rb) return ra - rb;
        return a.z - b.z;
    });

    sortedElements.forEach(el => {
        const node = document.createElement('div');
        let isWindow = (el.type === 'window');
        let isSpecWin = SPEC_WIN.includes(el.type);

        node.className = `element-node ${selectedId === el.id ? 'selected' : ''} ${(isWindow || isSpecWin) ? 'window-node' : ''}`;
        node.style.left = `${el.x}px`; node.style.top = `${el.y}px`;
        node.style.width = `${el.w}px`; node.style.height = `${el.h}px`;
        node.style.zIndex = isWindow ? 0 : (isSpecWin ? 5 : (el.z + 10));

        let isNV = isNonVisual(el.type);

        if (isNV) {
            node.style.backgroundColor = 'rgba(28,28,28,0.8)'; node.style.border = '1px dashed #E58A00'; node.style.borderRadius = '4px';
            node.innerHTML = `<div class="w-full h-full flex flex-col items-center justify-center"><span class="text-lg">${getIconFor(el.type)}</span><span class="text-[8px] truncate w-full text-center text-gray-300">${el.name}</span></div>`;
        }
        else if (isWindow) {
            node.style.backgroundColor = bursztynToRGBA(el.bg); node.style.border = `2px solid ${bursztynToRGBA(OS_COLORS.AmberMid)}`;
            // Przyciski paska tytulu zalezne od ustawien (minBtn/maxBtn)
            let btns = '';
            if (el.maxBtn !== false) btns += `<div style="width:14px;height:14px;background:#E58A00;border-radius:2px;display:flex;align-items:center;justify-content:center;color:#000;font-size:9px">□</div>`;
            if (el.minBtn !== false) btns += `<div style="width:14px;height:14px;background:#E58A00;border-radius:2px;display:flex;align-items:center;justify-content:center;color:#000;font-size:10px">−</div>`;
            btns += `<div style="width:14px;height:14px;background:#AA0000;border-radius:2px;display:flex;align-items:center;justify-content:center;color:#FFF;font-size:10px">x</div>`;
            node.innerHTML = `<div style="background-color: ${bursztynToRGBA(OS_COLORS.AmberMid)}; height: 24px; color: #FFF; font-size: 11px; font-weight: bold; padding: 0 8px; display:flex; align-items:center; justify-content:space-between;"><span style="overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">${el.text}</span><div style="display:flex; gap: 4px;">${btns}</div></div>`;
        }
        else if (isSpecWin) {
            node.style.backgroundColor = bursztynToRGBA(el.bg);
            if (el.type === 'TChildWindow') node.style.border = `1px dashed ${bursztynToRGBA(OS_COLORS.AmberLight)}`;
            else if (el.type === 'TModalWindow') { node.style.border = `3px double #FFBF00`; node.style.boxShadow = '0 0 18px rgba(0,0,0,0.6)'; }
            else { node.style.border = `2px solid ${bursztynToRGBA(OS_COLORS.AmberLight)}`; node.style.borderRadius = '6px'; }
            const barH = el.type === 'TPopupWindow' ? 18 : 20;
            node.innerHTML = `<div style="background:${bursztynToRGBA(OS_COLORS.AmberMid)};height:${barH}px;color:#FFF;font-size:10px;font-weight:bold;padding:0 6px;display:flex;align-items:center;justify-content:space-between;"><span style="overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">${el.text}</span><div style="width:12px;height:12px;background:#AA0000;border-radius:2px;display:flex;align-items:center;justify-content:center;color:#FFF;font-size:9px;">x</div></div>${el.type === 'TModalWindow' ? `<div style="position:absolute;left:0;right:0;top:${barH}px;bottom:0;background:repeating-linear-gradient(45deg, rgba(255,191,0,0.07) 0 6px, transparent 6px 12px);pointer-events:none;"></div>` : ''}`;
        }
        else if (el.type === 'TPanel' || el.type.includes('Grid')) {
            node.style.backgroundColor = bursztynToRGBA(el.bg); node.style.border = `1px solid ${bursztynToRGBA(el.color)}`;
            if (el.type.includes('Grid')) {
                node.style.backgroundImage = 'linear-gradient(to right, #444 1px, transparent 1px), linear-gradient(to bottom, #444 1px, transparent 1px)';
                node.style.backgroundSize = '40px 20px';
            }
        }
        else if (el.type === 'TGroupBox' || el.type === 'TRadioGroup') {
            node.style.backgroundColor = bursztynToRGBA(el.bg); node.style.border = `1px solid #777`; node.style.borderRadius = '2px';
            node.innerHTML = `<div style="position:absolute; top:-8px; left:8px; background:${bursztynToRGBA(OS_COLORS.CarbonBg)}; padding:0 4px; font-size:10px; color:#A0A0A0;">${el.text}</div>`;
            if (el.type === 'TRadioGroup') {
                let items = (el.text || "Opcja").split('\n').slice(1).map(item => `<div style="display:flex;align-items:center;gap:4px;margin:2px 0;"><div style="width:10px;height:10px;border-radius:50%;border:1px solid #777;"></div><span style="font-size:9px">${item}</span></div>`).join('');
                node.innerHTML += `<div style="padding:10px;">${items}</div>`;
            }
        }
        else if (el.type === 'TButton' || el.type === 'TBitBtn') {
            node.style.backgroundColor = bursztynToRGBA(el.bg); node.style.color = bursztynToRGBA(el.color); node.style.border = `1px solid #777`;
            node.style.display = 'flex'; node.style.alignItems = 'center'; node.style.justifyContent = 'center'; node.style.fontSize = '12px'; node.innerText = el.text;
        }
        else if (el.type === 'TLabel' || el.type === 'TStaticText') {
            node.style.color = bursztynToRGBA(el.color); node.style.fontSize = `${12 * (el.scale || 1)}px`; node.innerText = el.text; node.style.whiteSpace = 'nowrap';
        }
        else if (el.type === 'TListBox' || el.type === 'TCheckListBox') {
            node.style.backgroundColor = bursztynToRGBA(el.bg); node.style.color = bursztynToRGBA(el.color); node.style.border = '1px solid #777'; node.style.fontSize = '11px'; node.style.overflow = 'hidden';
            let isCheck = el.type === 'TCheckListBox';
            let items = (el.text || "").split('\n').map((item, idx) => `<div style="padding: 2px 4px; display:flex; align-items:center; gap:4px; ${idx === 0 ? 'background:#0078D7; color:white;' : ''}">${isCheck ? '<div style="width:10px;height:10px;border:1px solid #555;background:white;"></div>' : ''}${item}</div>`).join('');
            node.innerHTML = items;
        }
        else if (el.type === 'TComboBox') {
            node.style.backgroundColor = bursztynToRGBA(el.bg); node.style.color = bursztynToRGBA(el.color); node.style.border = '1px solid #777';
            node.style.fontSize = '11px'; node.style.display = 'flex'; node.style.alignItems = 'center'; node.style.justifyContent = 'space-between';
            let firstItem = (el.text || "").split('\n')[0] || "";
            node.innerHTML = `<span style="padding-left:4px; overflow:hidden; white-space:nowrap;">${firstItem}</span><div style="background:#E0E0E0; border-left:1px solid #777; padding:0 4px; height:100%; display:flex; align-items:center; color:#333;">▼</div>`;
        }
        else if (el.type === 'TMainMenu') {
            node.style.backgroundColor = bursztynToRGBA(el.bg); node.style.color = bursztynToRGBA(el.color); node.style.borderBottom = '1px solid #404040';
            node.style.fontSize = '12px'; node.style.display = 'flex'; node.style.alignItems = 'center'; node.style.paddingLeft = '8px'; node.style.gap = '15px';
            let items = (el.text || "").split('\n').filter(i => i.trim() !== '').map(item => `<span>${item}</span>`).join('');
            node.innerHTML = items || '<span style="color:#777">Puste Menu</span>';
        }
        else if (el.type === 'TMemo' || el.type === 'TEdit') {
            node.style.backgroundColor = bursztynToRGBA(el.bg); node.style.color = bursztynToRGBA(el.color); node.style.border = '1px solid #777';
            node.style.fontSize = '11px'; node.style.padding = '4px'; node.style.overflow = 'hidden'; node.style.whiteSpace = el.type === 'TMemo' ? 'pre-wrap' : 'nowrap'; node.innerText = el.text;
        }
        else if (el.type === 'TCheckBox') {
            node.style.color = bursztynToRGBA(el.color); node.style.fontSize = '11px'; node.style.display = 'flex'; node.style.alignItems = 'center'; node.style.gap = '4px';
            node.innerHTML = `<div style="width:13px; height:13px; border:1px solid #777; background:#FFF; display:flex; align-items:center; justify-content:center; color:#000; font-size:10px; font-weight:bold;">✓</div><span>${el.text}</span>`;
        }
        else if (el.type === 'TRadioButton') {
            node.style.color = bursztynToRGBA(el.color); node.style.fontSize = '11px'; node.style.display = 'flex'; node.style.alignItems = 'center'; node.style.gap = '4px';
            node.innerHTML = `<div style="width:13px; height:13px; background:#FFF; border-radius:50%; display:flex; align-items:center; justify-content:center;"><div style="width:5px; height:5px; background:#000; border-radius:50%;"></div></div><span>${el.text}</span>`;
        }
        else if (el.type === 'TProgressBar') {
            node.style.backgroundColor = bursztynToRGBA(el.bg); node.style.border = '1px solid #777';
            node.innerHTML = `<div style="width:${el.value || 50}%; height:100%; background:${bursztynToRGBA(el.color)};"></div>`;
        }
        else if (el.type === 'TStatusBar') {
            node.style.backgroundColor = bursztynToRGBA(el.bg); node.style.color = bursztynToRGBA(el.color); node.style.border = '1px solid #777';
            node.style.fontSize = '10px'; node.style.display = 'flex'; node.style.alignItems = 'center'; node.style.padding = '0 4px';
            node.innerText = el.text;
        }
        else if (el.type === 'TScrollBar') {
            node.style.backgroundColor = '#E0E0E0'; node.style.border = '1px solid #777'; node.style.display = 'flex'; node.style.flexDirection = 'column'; node.style.justifyContent = 'space-between';
            node.innerHTML = `<div style="background:#CCC; border-bottom:1px solid #777; text-align:center; font-size:8px; color:black;">▲</div><div style="background:#CCC; border-top:1px solid #777; text-align:center; font-size:8px; color:black;">▼</div>`;
        }
        else {
            node.style.backgroundColor = 'rgba(255,255,255,0.1)'; node.style.border = '1px solid #777';
            node.innerHTML = `<div class="w-full h-full flex flex-col items-center justify-center text-[10px] text-gray-400 p-1 text-center overflow-hidden"><span class="text-sm">${getIconFor(el.type)}</span>${el.name}</div>`;
        }

        if (selectedId === el.id) {
            const dirs = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
            dirs.forEach(dir => {
                let handle = document.createElement('div'); handle.className = `resize-handle resize-${dir}`;
                handle.onmousedown = (e) => startResize(e, dir, el.id); node.appendChild(handle);
            });
        }
        node.onmousedown = (e) => startDrag(e, el.id);
        node.oncontextmenu = (e) => showContextMenu(e, el.id);
        canvas.appendChild(node);
    });
}

/* ---------------------------- Drag i resize ---------------------------- */

function startDrag(e, id) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.classList.contains('resize-handle')) return;
    if (e.button !== 0) return;
    e.preventDefault(); e.stopPropagation(); selectElement(id);
    isDragging = true; dragTarget = elements.find(el => el.id === id);
    startX = e.clientX; startY = e.clientY;
    // Migawka pozycji wszystkich elementow - potrzebna do wspolnego przesuwania
    // dzieci lezacych srodkiem w przeciaganym kontenerze (panel/okno/grupa).
    elements.forEach(el => { el.initialStartX = el.x; el.initialStartY = el.y; });
}
function startResize(e, dir, id) {
    e.preventDefault(); e.stopPropagation(); selectElement(id);
    isResizing = true; resizeDir = dir; dragTarget = elements.find(el => el.id === id);
    startX = e.clientX; startY = e.clientY;
    initialW = dragTarget.w; initialH = dragTarget.h; initialX = dragTarget.x; initialY = dragTarget.y;
}

function onGlobalMove(e) {
    if (isDragging && dragTarget) {
        let dx = Math.round((e.clientX - startX) / 10) * 10;
        let dy = Math.round((e.clientY - startY) / 10) * 10;
        dragTarget.x = dragTarget.initialStartX + dx; dragTarget.y = dragTarget.initialStartY + dy;
        const isContainer = CONTAINER_TYPES.includes(dragTarget.type);
        if (dragTarget.type === 'window') {
            // Okno glowne pociaga za soba cala zawartosc swojej karty.
            elements.forEach(el => {
                if (el.id === dragTarget.id || FORM_TYPES.includes(el.type)) return;
                el.x = el.initialStartX + dx; el.y = el.initialStartY + dy;
            });
        } else if (isContainer) {
            // Panel/grupa: przesuwa WYLACZNIE zwykle kontrolki lezace srodkiem
            // w jego prostokacie. Nigdy nie rusza zadnych okien (glownego,
            // podrzednych, modalnych, pop-up).
            const r = { x: dragTarget.initialStartX, y: dragTarget.initialStartY, w: dragTarget.w, h: dragTarget.h };
            elements.forEach(el => {
                if (el.id === dragTarget.id || FORM_TYPES.includes(el.type)) return;
                if (el.formId !== activeFormId) return; // tylko zawartosc tej karty
                const cx = el.initialStartX + el.w / 2;
                const cy = el.initialStartY + el.h / 2;
                if (cx >= r.x && cx < r.x + r.w && cy >= r.y && cy < r.y + r.h) {
                    el.x = el.initialStartX + dx;
                    el.y = el.initialStartY + dy;
                }
            });
        }
        renderCanvas(); renderProperties();
    }
    else if (isResizing && dragTarget) {
        let dx = Math.round((e.clientX - startX) / 5) * 5; let dy = Math.round((e.clientY - startY) / 5) * 5;
        if (resizeDir.includes('e')) dragTarget.w = Math.max(10, initialW + dx);
        if (resizeDir.includes('s')) dragTarget.h = Math.max(10, initialH + dy);
        if (resizeDir.includes('w')) { let aDx = Math.min(dx, initialW - 10); dragTarget.x = initialX + aDx; dragTarget.w = initialW - aDx; }
        if (resizeDir.includes('n')) { let aDy = Math.min(dy, initialH - 10); dragTarget.y = initialY + aDy; dragTarget.h = initialH - aDy; }
        renderCanvas(); renderProperties();
    }
}
function onGlobalUp() { if (isDragging || isResizing) { isDragging = false; isResizing = false; dragTarget = null; updateUI(); } }

/* --------------------------- Menu kontekstowe --------------------------- */

function showContextMenu(e, id) {
    e.preventDefault(); e.stopPropagation();
    if (id !== null) selectElement(id);
    ctxMenu.style.left = e.clientX + 'px'; ctxMenu.style.top = e.clientY + 'px'; ctxMenu.classList.remove('hidden');
    let html = '';
    if (id !== null) {
        html += `<div onclick="duplicateSelected(); document.getElementById('context-menu').classList.add('hidden');" class="ctx-item hover:text-bursztyn-400 flex justify-between"><span>📄 Duplikuj</span><span class="text-[10px] text-gray-500">Ctrl+D</span></div>`;
        html += `<div onclick="deleteSelected(); document.getElementById('context-menu').classList.add('hidden');" class="ctx-item text-red-400 hover:bg-red-900/30 flex justify-between"><span>🗑️ Usuń obiekt</span> <span class="text-[10px] text-gray-500">Del</span></div>`;
    } else if (deletedElements.length > 0) {
        html += `<div onclick="restoreDeleted(); document.getElementById('context-menu').classList.add('hidden');" class="ctx-item hover:text-bursztyn-400 flex justify-between"><span>↩️ Przywróć usunięty</span><span class="text-[10px] text-gray-500">Ctrl+Z</span></div>`;
    }
    if (html === '') html = '<div class="ctx-item text-gray-500">Brak akcji</div>';
    ctxMenu.innerHTML = html;
}

Object.assign(window, {
    toggleAccordion, buildPalette, buildBlocksPalette,
    renderTree, updateUI, renderCanvas, renderTabs, treeDropReorder, visibleElements,
    isNonVisual, getIconFor, hexAlpha,
    startDrag, startResize, onGlobalMove, onGlobalUp, showContextMenu
});