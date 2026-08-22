/* =========================================================================
 * Bursztyn Builder RAD v3.0 - przegladarka API BWS (syscalls 1..56,
 * zdarzenia i struktury ABI). Zrodlo danych: js/bws_api.js.
 * ========================================================================= */

let apiFilter = '';
let apiTab = 'syscalls';

function openApiBrowser() {
    document.getElementById('api-modal').classList.add('active');
    const inp = document.getElementById('api-search');
    if (inp) { inp.value = apiFilter; }
    renderApiList();
}
function closeApiBrowser() { document.getElementById('api-modal').classList.remove('active'); }

window.setApiTab = function (tab) {
    apiTab = tab;
    renderApiList();
};

window.setApiFilter = function (value) {
    apiFilter = value.toLowerCase();
    renderApiList();
};

/* Kopiuje przyklad do schowka i/lub wstawia jako akcje zaznaczonego elementu. */
window.copyApiSnippet = function (syscallNr) {
    const entry = BWS_SYSCALLS.find(s => s.nr === syscallNr);
    if (!entry) return;
    const text = entry.przyklad;
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(() => {});
    }
    insertApiSnippetAsAction(syscallNr);
};

function renderApiList() {
    const container = document.getElementById('api-list');

    // Zakladki
    let html = `<div class="flex gap-1 mb-2">
        <button onclick="setApiTab('syscalls')" class="px-2 py-1 rounded text-[10px] font-bold ${apiTab === 'syscalls' ? 'bg-bursztyn-600 text-white' : 'bg-carbon-800 text-gray-400'}">Wywołania (${BWS_SYSCALLS.length})</button>
        <button onclick="setApiTab('events')" class="px-2 py-1 rounded text-[10px] font-bold ${apiTab === 'events' ? 'bg-bursztyn-600 text-white' : 'bg-carbon-800 text-gray-400'}">Zdarzenia</button>
        <button onclick="setApiTab('structs')" class="px-2 py-1 rounded text-[10px] font-bold ${apiTab === 'structs' ? 'bg-bursztyn-600 text-white' : 'bg-carbon-800 text-gray-400'}">Struktury ABI</button>
    </div>`;

    if (apiTab === 'syscalls') {
        const rows = BWS_SYSCALLS.filter(s => {
            if (!apiFilter) return true;
            return [s.nr, s.nazwa, s.opis, s.grupa, s.wrapper].join(' ').toLowerCase().includes(apiFilter);
        });
        html += rows.map(s => `
            <div class="api-row">
                <span class="api-nr">${s.nr}</span>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 flex-wrap"><span class="api-name">${s.nazwa}</span><span class="api-group-tag">${s.grupa}</span></div>
                    <div class="api-desc">${s.opis}</div>
                    <div class="text-[9px] text-gray-500 font-mono truncate" title="${s.wrapper}">${s.wrapper}</div>
                    <pre class="text-[9px] text-green-300/80 font-mono whitespace-pre-wrap bg-black/40 rounded p-1 mt-1 border border-carbon-700">${escapeHtml(s.przyklad)}</pre>
                    <div class="flex gap-1 mt-1">
                        <button onclick="copyApiSnippet(${s.nr})" class="bg-bursztyn-600 hover:bg-bursztyn-500 text-white px-2 py-0.5 rounded text-[9px] font-bold">⬇ Wstaw do zaznaczonego</button>
                        <span class="text-[9px] text-gray-600 self-center ml-1">Prawa: ${escapeHtml(s.prawa)} · ${escapeHtml(s.sygnatura)}</span>
                    </div>
                </div>
            </div>`).join('');
        if (!rows.length) html += '<div class="text-gray-500 text-xs p-4 text-center">Brak wyników.</div>';
    }

    if (apiTab === 'events') {
        const rows = Object.entries(BWS_ZDARZENIA).filter(([nr, name]) =>
            !apiFilter || (name + ' ' + nr).toLowerCase().includes(apiFilter));
        html += rows.map(([nr, name]) => `
            <div class="api-row">
                <span class="api-nr">${nr}</span>
                <div><span class="api-name">BWS_ZDARZENIE_${name}</span>
                <div class="api-desc">Pole bws_zdarzenie.typ; odbierane przez gui_pobierz_zdarzenie() / gui_czekaj_na_zdarzenie().</div></div>
            </div>`).join('');
    }

    if (apiTab === 'structs') {
        html += BWS_STRUKTURY.filter(st => !apiFilter || (st.nazwa + ' ' + st.opis).toLowerCase().includes(apiFilter)).map(st => `
            <div class="p-2 border-b border-carbon-700">
                <div class="flex items-center gap-2"><span class="api-name">${st.nazwa}</span>${st.rozmiar ? `<span class="text-[9px] text-gray-500">sizeof == ${st.rozmiar} B</span>` : ''}</div>
                <div class="api-desc">${st.opis}</div>
                <div class="text-[9px] text-gray-400 font-mono mt-1">${escapeHtml(st.pola)}</div>
            </div>`).join('');
    }

    container.innerHTML = html;
}

function escapeHtml(str) {
    return String(str ?? '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

Object.assign(window, { openApiBrowser, closeApiBrowser });
