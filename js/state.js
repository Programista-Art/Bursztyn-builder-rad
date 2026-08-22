/* =========================================================================
 * Bursztyn Builder RAD v3.0 - stan projektu i operacje CRUD
 * ========================================================================= */

let elements = [];          // wszystkie elementy na plotnie
let deletedElements = [];   // stos usunietych (Ctrl+Z / przywroc)
let elementIdCounter = 1;
let selectedId = null;

function addElement(type, x = 100, y = 100, w = 120, h = 30, text = "") {
    const id = elementIdCounter++;
    let zIndex = elements.length;
    let el = { id, type, x, y, w, h, z: zIndex, name: `${type}_${id}`, onClick: '', visualEvents: [], eventMode: 'visual' };

    if (type === 'window') { el.text = text || "Aplikacja Bursztyn"; el.bg = OS_COLORS.CarbonBg; }
    else if (type === 'TPanel' || type.includes('Grid') || type === 'TGroupBox' || type === 'TRadioGroup') { el.bg = OS_COLORS.CarbonPanel; el.color = OS_COLORS.CarbonBorder; el.text = text; }
    else if (type === 'TButton' || type === 'TBitBtn') { el.bg = OS_COLORS.CarbonPanel; el.color = OS_COLORS.White; el.text = text; }
    else if (type === 'TLabel' || type === 'TCheckBox' || type === 'TRadioButton') { el.bg = OS_COLORS.Transparent; el.color = OS_COLORS.White; el.scale = 1; el.text = text; }
    else if (type === 'TListBox' || type === 'TMemo' || type === 'TEdit' || type === 'TComboBox' || type === 'TCheckListBox') { el.bg = OS_COLORS.White; el.color = OS_COLORS.Black; el.text = text; }
    else if (type === 'TProgressBar') { el.bg = OS_COLORS.CarbonPanel; el.color = OS_COLORS.AccentBlue; el.value = 50; }
    else if (type === 'TShape') { el.bg = OS_COLORS.AccentBlue; }
    else if (type === 'TStatusBar') { el.bg = OS_COLORS.CarbonPanel; el.color = OS_COLORS.White; el.text = 'Gotowy.'; }
    else { el.bg = OS_COLORS.CarbonPanel; el.color = OS_COLORS.White; el.text = text; }

    elements.push(el);
    selectElement(id);
    updateUI();
    return id;
}

/* Klonuje zaznaczony komponent z przesunieciem o 20 px i nowym id. */
function duplicateSelected() {
    if (!selectedId) return;
    const src = elements.find(e => e.id === selectedId);
    if (!src) return;
    const id = elementIdCounter++;
    const copy = JSON.parse(JSON.stringify(src));
    copy.id = id;
    copy.name = `${src.type}_${id}`;
    copy.x += 20; copy.y += 20;
    copy.z = elements.length;
    elements.push(copy);
    selectElement(id);
    updateUI();
}

/* Przywraca ostatnio usuniety element (tez Ctrl+Z). */
function restoreDeleted() {
    if (!deletedElements.length) return;
    const el = deletedElements.pop();
    if (el.id >= elementIdCounter) elementIdCounter = el.id + 1;
    elements.push(el);
    selectElement(el.id);
    updateUI();
}

function deleteSelected() {
    if (!selectedId) return;
    const el = elements.find(e => e.id === selectedId);
    if (el) {
        deletedElements.push(JSON.parse(JSON.stringify(el)));
        elements = elements.filter(e => e.id !== selectedId);
        selectedId = null;
        updateUI();
    }
}

function clearCanvas() { elements = []; deletedElements = []; selectedId = null; updateUI(); }
function selectElement(id) { selectedId = id; updateUI(); }

window.updateElementProp = function (id, prop, value) {
    const el = elements.find(e => e.id === id);
    if (el) {
        if (['x', 'y', 'w', 'h', 'z', 'scale', 'value'].includes(prop)) el[prop] = parseInt(value) || 0;
        else el[prop] = value;
        if (prop === 'z') { elements.sort((a, b) => a.z - b.z); elements.forEach((e, idx) => e.z = idx); }
        updateUI();
    }
};

window.updateColor = function (prop, hex, alpha) {
    if (selectedId) updateElementProp(selectedId, prop, buildBursztynColor(alpha, hex));
};

/* =========================================================================
 * Zapis / odczyt projektu (JSON)
 * ========================================================================= */

function saveJSON() {
    const data = JSON.stringify(elements, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'projekt_bursztyn.json';
    a.click(); URL.revokeObjectURL(url);
}

function loadJSON(e) {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = function (evt) {
        try {
            const parsed = JSON.parse(evt.target.result);
            if (Array.isArray(parsed)) {
                elements = parsed;
                let maxId = 0;
                elements.forEach(el => {
                    if (el.id > maxId) maxId = el.id;
                    if (!el.visualEvents) el.visualEvents = [];
                    if (!el.eventMode) el.eventMode = 'visual';
                    if (el.onClick === undefined) el.onClick = '';
                });
                elementIdCounter = maxId + 1;
                deletedElements = [];
                selectedId = null;
                updateUI();
            }
        } catch (err) { alert("Błąd wczytywania pliku JSON! Upewnij się, że to poprawny plik projektu Bursztyn."); }
    };
    reader.readAsText(file); e.target.value = '';
}

Object.assign(window, {
    addElement, deleteSelected, duplicateSelected, restoreDeleted,
    clearCanvas, selectElement, saveJSON, loadJSON
});
