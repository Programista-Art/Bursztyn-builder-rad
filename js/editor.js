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

function buildPalette() {
    const container = document.getElementById('palette-container');
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
        components.forEach(comp => {
            let textArg = comp.name;
            if (['TComboBox', 'TListBox', 'TCheckListBox', 'TMainMenu', 'TPopupMenu'].includes(comp.type)) textArg = "Plik\\nEdycja\\nWidok";
            else if (comp.type === 'TRadioGroup') textArg = "Opcje\\nOpcja 1\\nOpcja 2";

            let onClickStr = `addElement('${comp.type}', 100, 100, ${comp.w}, ${comp.h}, '${textArg}')`;
            html += `
                <button onclick="${onClickStr}" class="flex flex-col items-center justify-center p-2 bg-carbon-950 hover:bg-carbon-800 rounded border border-carbon-800 hover:border-bursztyn-500 transition-all group">
                    <span class="text-base group-hover:scale-110 transition-transform">${comp.icon}</span>
                    <span class="text-[9px] text-gray-400 mt-1 text-center leading-tight overflow-hidden text-ellipsis w-full whitespace-nowrap">${comp.name}</span>
                </button>
            `;
        });
        html += `</div></div>`;
    }
    container.innerHTML = html;
    buildBlocksPalette();
}

/* Paleta akcji API w Edytorze Wizualnym - pogrupowana wg obszarow BWS. */
function buildBlocksPalette() {
    const groups = {};
    for (const key in ACTION_TYPES) {
        const act = ACTION_TYPES[key];
        const g = act.grupa || 'Inne';
        if (!groups[g]) groups[g] = [];
        groups[g].push({ key, ...act });
    }
    let html = '';
    for (const g in groups) {
        html += `<div class="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-3 mb-1 border-t border-carbon-800 pt-2 first:border-t-0 first:mt-0">${g}</div>`;
        groups[g].forEach(act => {
            html += `<button onclick="addVisualEventModal('${act.key}')" title="${act.name}" class="flex items-center gap-2 p-2 bg-carbon-800 hover:bg-carbon-700 border border-carbon-700 rounded text-left transition-colors"><span class="text-lg shrink-0">${act.icon}</span><div class="text-[10px] font-bold text-gray-200 leading-tight">${act.name}</div></button>`;
        });
    }
    document.getElementById('blocks-palette').innerHTML = html;
}

/* --------------------------- Drzewo obiektow -------------------------- */

function renderTree() {
    treePanel.innerHTML = '';
    const sortedElements = [...elements].sort((a, b) => b.z - a.z);
    sortedElements.forEach(el => {
        const btn = document.createElement('div');
        btn.className = `tree-item px-2 py-1.5 rounded transition-colors flex items-center gap-2 ${selectedId === el.id ? 'bg-bursztyn-600 text-white font-bold' : 'text-gray-400 hover:bg-carbon-800 hover:text-gray-200'}`;
        btn.innerHTML = `<span>${getIconFor(el.type)}</span> <span class="truncate">${el.name}</span>`;
        btn.onclick = () => selectElement(el.id);
        treePanel.appendChild(btn);
    });
}

function updateUI() { renderCanvas(); renderProperties(); renderTree(); }

/* ------------------------------- Plotno -------------------------------- */

function isNonVisual(type) { for (let cat in COMPONENT_DB) { let found = COMPONENT_DB[cat].find(c => c.type === type); if (found && found.n) return true; } return false; }
function getIconFor(type) { for (let cat in COMPONENT_DB) { let found = COMPONENT_DB[cat].find(c => c.type === type); if (found) return found.icon; } return '🧩'; }

function renderCanvas() {
    canvas.innerHTML = '';
    const sortedElements = [...elements].sort((a, b) => {
        if (a.type === 'window' && b.type !== 'window') return -1;
        if (b.type === 'window' && a.type !== 'window') return 1;
        return a.z - b.z;
    });

    sortedElements.forEach(el => {
        const node = document.createElement('div');
        let isWindow = (el.type === 'window');

        node.className = `element-node ${selectedId === el.id ? 'selected' : ''} ${isWindow ? 'window-node' : ''}`;
        node.style.left = `${el.x}px`; node.style.top = `${el.y}px`;
        node.style.width = `${el.w}px`; node.style.height = `${el.h}px`;
        node.style.zIndex = isWindow ? 0 : (el.z + 10);

        let isNV = isNonVisual(el.type);

        if (isNV) {
            node.style.backgroundColor = 'rgba(28,28,28,0.8)'; node.style.border = '1px dashed #E58A00'; node.style.borderRadius = '4px';
            node.innerHTML = `<div class="w-full h-full flex flex-col items-center justify-center"><span class="text-lg">${getIconFor(el.type)}</span><span class="text-[8px] truncate w-full text-center text-gray-300">${el.name}</span></div>`;
        }
        else if (isWindow) {
            node.style.backgroundColor = bursztynToRGBA(el.bg); node.style.border = `2px solid ${bursztynToRGBA(OS_COLORS.AmberMid)}`;
            node.innerHTML = `<div style="background-color: ${bursztynToRGBA(OS_COLORS.AmberMid)}; height: 24px; color: #FFF; font-size: 11px; font-weight: bold; padding: 0 8px; display:flex; align-items:center; justify-content:space-between;"><span>${el.text}</span><div style="display:flex; gap: 4px;"><div style="width:14px;height:14px;background:#E58A00;border-radius:2px;display:flex;align-items:center;justify-content:center;color:#000;font-size:10px">-</div><div style="width:14px;height:14px;background:#AA0000;border-radius:2px;display:flex;align-items:center;justify-content:center;color:#FFF;font-size:10px">x</div></div></div>`;
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
        if (dragTarget.type === 'window') {
            elements.forEach(el => { if (el.id !== dragTarget.id) { el.x = el.initialStartX + dx; el.y = el.initialStartY + dy; } });
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
    renderTree, updateUI, renderCanvas,
    isNonVisual, getIconFor,
    startDrag, startResize, onGlobalMove, onGlobalUp, showContextMenu
});
