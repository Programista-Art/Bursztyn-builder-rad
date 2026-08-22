/* =========================================================================
 * Bursztyn Builder RAD v3.0 - generator kodu C++ i eksport
 * ========================================================================= */

/* Zamienia akcje wizualne komponentu na kod C++ przy pomocy emit() z
 * ACTION_TYPES. Wczesniej obsluga byla zaszyta na sztywno dla 5 akcji;
 * teraz kazda nowa akcja API BWS dziala automatycznie. */
function syncVisualToCode(el) {
    let code = '';
    (el.visualEvents || []).forEach(ev => {
        const def = ACTION_TYPES[ev.type];
        if (!def || typeof def.emit !== 'function') return;
        const p = {};
        (def.params || []).forEach(par => {
            p[par.name] = ev.params && ev.params[par.name] !== undefined ? ev.params[par.name] : par.default;
        });
        let out = '';
        try { out = def.emit(p) || ''; }
        catch (err) { out = `// Blad generowania akcji ${ev.type}: ${err.message}`; }
        if (out.trim() !== '') code += out.replace(/\s*$/, '') + '\n';
    });
    el.onClick = code;
}

function openMonacoModal() {
    document.getElementById('code-modal').classList.add('active');
    let code = generateCPPCode();
    if (!monacoInst) {
        require(['vs/editor/editor.main'], function () {
            monacoInst = monaco.editor.create(document.getElementById('monaco-container'), {
                value: code, language: 'cpp', theme: 'vs-dark', automaticLayout: true, minimap: { enabled: false }, fontSize: 13
            });
        });
    } else { monacoInst.setValue(code); }
}
function closeMonacoModal() { document.getElementById('code-modal').classList.remove('active'); }

function downloadCPP() {
    const cppCode = generateCPPCode();
    const blob = new Blob([cppCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'aplikacja_vcl.cpp';
    a.click(); URL.revokeObjectURL(url);
}

let monacoInst = null;

function generateCPPCode() {
    let windowEl = elements.find(e => e.type === 'window');
    let cppCode = `/*
 * Aplikacja Bursztyn OS (Zgodna z C++17, bursztyn_gui.h i ABI Linkera)
 * Wygenerowana przez: Bursztyn Builder RAD v3.0 Ultimate
 *
 * Dostepne wywolania BWS 1..56 opisane sa w bws_api.js / przegladarce API.
 */
#include "bursztyn_gui.h"
#include <stddef.h>
#include <stdint.h>

// -----------------------------------------------------------------------------
// Format .bur (Naglowek wymagany przez Loadera)
// -----------------------------------------------------------------------------

struct NaglowekBur {
    uint8_t  magia[4];
    uint64_t punkt_wejscia;
    uint64_t tekst_przesuniecie;
    uint64_t tekst_rozmiar;
    uint64_t tekst_wirtualny;
    uint64_t dane_przesuniecie;
    uint64_t dane_rozmiar;
    uint64_t dane_wirtualny;
} __attribute__((packed));

extern "C" __attribute__((noreturn)) void _start();

#ifndef BUR_TEKST_ROZMIAR
#define BUR_TEKST_ROZMIAR 32768ULL
#endif

static constexpr uint64_t BUR_TEKST_PRZESUNIECIE = 4096ULL;
static constexpr uint64_t BUR_TEKST_WIRTUALNY      = 0x601000ULL;
static constexpr uint64_t BUR_DANE_PRZESUNIECIE   = BUR_TEKST_PRZESUNIECIE + BUR_TEKST_ROZMIAR;
static constexpr uint64_t BUR_DANE_WIRTUALNY       = BUR_TEKST_WIRTUALNY + BUR_TEKST_ROZMIAR;
static constexpr uint64_t BUR_DANE_ROZMIAR         = 131072ULL;

extern "C" {
    __attribute__((section(".naglowek"), used))
    struct NaglowekBur naglowek = {
        {'B', 'U', 'R', '\\0'},
        (uint64_t)&_start,
        BUR_TEKST_PRZESUNIECIE, BUR_TEKST_ROZMIAR, BUR_TEKST_WIRTUALNY,
        BUR_DANE_PRZESUNIECIE, BUR_DANE_ROZMIAR, BUR_DANE_WIRTUALNY
    };
}

// -----------------------------------------------------------------------------
// Zmienne preprocesora dla pętli GUI
// -----------------------------------------------------------------------------
static int WIN_X = ${windowEl ? windowEl.x : 100};
static int WIN_Y = ${windowEl ? windowEl.y : 100};
static int WIN_W = ${windowEl ? windowEl.w : 600};
static int WIN_H = ${windowEl ? windowEl.h : 450};
static bool zmaksymalizowane = false;
static bool aplikacja_zminimalizowana = false;
static bool dragging = false;
static int drag_off_x = 0;
static int drag_off_y = 0;
static int screen_w = 1024, screen_h = 768;
static int restore_x = 0, restore_y = 0, restore_w = 0, restore_h = 0;

`;

    // ---------------------------------------------------------------
    // Stan per-instancja dla kontrolek interaktywnych (combo/checkbox/
    // radio/listbox).
    // ---------------------------------------------------------------
    const sortedElements0 = [...elements].sort((a,b)=>a.z - b.z);
    sortedElements0.forEach(el => {
        if (el.type === 'window' || isNonVisual(el.type)) return;
        const id = cIdent(el);
        if (el.type === 'TComboBox') {
            cppCode += `static bool combo_otwarty_${id} = false;\n`;
            cppCode += `static int  combo_wybor_${id} = 0;\n`;
        } else if (el.type === 'TCheckBox' || el.type === 'TCheckListBox') {
            cppCode += `static bool zaznaczone_${id} = false;\n`;
        } else if (el.type === 'TRadioButton') {
            cppCode += `static bool wybrane_${id} = false;\n`;
        } else if (el.type === 'TListBox') {
            cppCode += `static int  wybor_${id} = 0;\n`;
        }
    });
    cppCode += `\n`;

    cppCode += `static bool punkt_w_prostokacie(int px, int py, int x, int y, int w, int h) {
    if (w <= 0 || h <= 0) return false;
    return px >= x && px < x + w && py >= y && py < y + h;
}

static void ogranicz_pozycje_okna(int* x, int* y) {
    if (!x || !y) return;
    int max_x = screen_w - WIN_W;
    int max_y = screen_h - 40 - WIN_H;
    if (max_x < 0) max_x = 0;
    if (max_y < 0) max_y = 0;
    if (*x < 0) *x = 0;
    if (*y < 0) *y = 0;
    if (*x > max_x) *x = max_x;
    if (*y > max_y) *y = max_y;
}

static void RysujInterfejs(bool wyczysc_warstwe) {
    if (wyczysc_warstwe) gui_odswiez_pulpit();
    if (aplikacja_zminimalizowana) return;

`;
    if (windowEl) {
        cppCode += `    // Tlo Okna i Belka Systemowa\n`;
        cppCode += `    gui_rysuj_okno(WIN_X, WIN_Y, WIN_W, WIN_H, "${escapeCppString(windowEl.text)}");\n`;
        cppCode += `    gui_rysuj_standardowa_belke(WIN_X, WIN_Y, WIN_W, "${escapeCppString(windowEl.text)}", zmaksymalizowane);\n\n`;
    }

    const sortedElements = [...elements].sort((a,b)=>a.z - b.z);
    sortedElements.forEach(el => {
        if(el.type === 'window' || isNonVisual(el.type)) return;
        let relX = windowEl ? el.x - windowEl.x : el.x;
        let relY = windowEl ? el.y - windowEl.y : el.y;
        const id = cIdent(el);
        const txt = escapeCppString(el.text);
        const firstLine = escapeCppString((el.text||"").split('\n')[0] || "");
        const items = (el.text||"").split('\n').filter(i => i.trim() !== '');

        cppCode += `    // ${el.name} (${el.type})\n`;

        if (el.type === 'TButton' || el.type === 'TBitBtn') {
            cppCode += `    gui_rysuj_prostokat(WIN_X + ${relX}, WIN_Y + ${relY}, ${el.w}, ${el.h}, ${el.bg});\n`;
            cppCode += `    gui_rysuj_prostokat(WIN_X + ${relX}, WIN_Y + ${relY}, ${el.w}, 1, 0x00404040);\n`;
            cppCode += `    gui_rysuj_prostokat(WIN_X + ${relX}, WIN_Y + ${relY} + ${el.h} - 1, ${el.w}, 1, 0x00101010);\n`;
            cppCode += `    gui_rysuj_prostokat(WIN_X + ${relX}, WIN_Y + ${relY}, 1, ${el.h}, 0x00404040);\n`;
            cppCode += `    gui_rysuj_prostokat(WIN_X + ${relX} + ${el.w} - 1, WIN_Y + ${relY}, 1, ${el.h}, 0x00101010);\n`;
            cppCode += `    rysuj_tekst_wysrodkowany(WIN_X + ${relX}, WIN_Y + ${relY}, ${el.w}, ${el.h}, 1, ${el.color}, "${txt}");\n`;
        }
        else if (el.type === 'TLabel') {
            cppCode += `    gui_wypisz_tekst_kolor_skala(WIN_X + ${relX}, WIN_Y + ${relY}, ${el.color}, ${el.scale||1}, "${txt}");\n`;
        }
        else if (el.type === 'TPanel' || (el.type.includes('Grid') && el.type !== 'TCheckListBox')) {
            cppCode += `    gui_rysuj_prostokat(WIN_X + ${relX}, WIN_Y + ${relY}, ${el.w}, ${el.h}, ${el.bg});\n`;
            cppCode += `    gui_rysuj_prostokat(WIN_X + ${relX}, WIN_Y + ${relY}, ${el.w}, 1, 0x00404040);\n`;
            cppCode += `    gui_rysuj_prostokat(WIN_X + ${relX}, WIN_Y + ${relY}, 1, ${el.h}, 0x00404040);\n`;
        }
        else if (el.type === 'TGroupBox' || el.type === 'TRadioGroup') {
            cppCode += `    gui_rysuj_prostokat(WIN_X + ${relX}, WIN_Y + ${relY}, ${el.w}, ${el.h}, ${el.bg});\n`;
            cppCode += `    gui_rysuj_prostokat(WIN_X + ${relX}, WIN_Y + ${relY}, ${el.w}, 1, 0x00404040);\n`;
            cppCode += `    gui_rysuj_prostokat(WIN_X + ${relX}, WIN_Y + ${relY}, 1, ${el.h}, 0x00404040);\n`;
            if (firstLine) cppCode += `    gui_wypisz_tekst_kolor_skala(WIN_X + ${relX} + 6, WIN_Y + ${relY} - 6, 0x00A0A0A0, 1, "${firstLine}");\n`;
            if (el.type === 'TRadioGroup') {
                let opts = items.slice(1);
                opts.forEach((opt, i) => {
                    let oy = relY + 20 + i * 18;
                    cppCode += `    gui_rysuj_prostokat(WIN_X + ${relX + 10}, WIN_Y + ${oy}, 10, 10, 0x00FFFFFF);\n`;
                    cppCode += `    gui_wypisz_tekst_kolor_skala(WIN_X + ${relX + 26}, WIN_Y + ${oy - 2}, ${el.color}, 1, "${escapeCppString(opt)}");\n`;
                });
            }
        }
        else if (el.type === 'TEdit' || el.type === 'TLabeledEdit' || el.type === 'TMaskEdit') {
            cppCode += `    gui_rysuj_prostokat(WIN_X + ${relX}, WIN_Y + ${relY}, ${el.w}, ${el.h}, ${el.bg});\n`;
            cppCode += `    gui_wypisz_tekst_kolor_skala(WIN_X + ${relX} + 4, WIN_Y + ${relY} + 4, ${el.color}, 1, "${firstLine}");\n`;
        }
        else if (el.type === 'TMemo' || el.type === 'TRichEdit') {
            // Kazda linia tekstu rysowana osobno z ograniczeniem do wysokosci.
            cppCode += `    gui_rysuj_prostokat(WIN_X + ${relX}, WIN_Y + ${relY}, ${el.w}, ${el.h}, ${el.bg});\n`;
            const lines = (el.text||"").split('\n');
            lines.forEach((ln, i) => {
                const ly = relY + 4 + i * 14;
                cppCode += `    if (${ly} < ${relY + el.h - 12}) gui_wypisz_tekst_kolor_skala(WIN_X + ${relX} + 4, WIN_Y + ${ly}, ${el.color}, 1, "${escapeCppString(ln)}");\n`;
            });
        }
        else if (el.type === 'TListBox' || el.type === 'TCheckListBox') {
            cppCode += `    gui_rysuj_prostokat(WIN_X + ${relX}, WIN_Y + ${relY}, ${el.w}, ${el.h}, ${el.bg});\n`;
            items.forEach((it, i) => {
                const iy = relY + i * 16;
                cppCode += `    if (${iy} < ${relY + el.h - 14}) {\n`;
                if (el.type === 'TListBox') {
                    cppCode += `        if (wybor_${id} == ${i}) gui_rysuj_prostokat(WIN_X + ${relX}, WIN_Y + ${iy}, ${el.w}, 16, 0x000078D7);\n`;
                    cppCode += `        gui_wypisz_tekst_kolor_skala(WIN_X + ${relX} + 4, WIN_Y + ${iy} + 2, wybor_${id} == ${i} ? 0x00FFFFFF : ${el.color}, 1, "${escapeCppString(it)}");\n`;
                } else {
                    cppCode += `        gui_rysuj_prostokat(WIN_X + ${relX} + 4, WIN_Y + ${iy} + 3, 10, 10, zaznaczone_${id} ? 0x0000AA00 : 0x00FFFFFF);\n`;
                    cppCode += `        gui_wypisz_tekst_kolor_skala(WIN_X + ${relX} + 20, WIN_Y + ${iy} + 2, ${el.color}, 1, "${escapeCppString(it)}");\n`;
                }
                cppCode += `    }\n`;
            });
        }
        else if (el.type === 'TComboBox' || el.type === 'TDBComboBox') {
            // Stan otwarcia rysuje faktyczna liste ponizej kontrolki.
            cppCode += `    gui_rysuj_prostokat(WIN_X + ${relX}, WIN_Y + ${relY}, ${el.w}, ${el.h}, ${el.bg});\n`;
            cppCode += `    gui_rysuj_prostokat(WIN_X + ${relX}, WIN_Y + ${relY}, ${el.w}, 1, 0x00404040);\n`;
            cppCode += `    { const char* combo_items_${id}[] = { `;
            cppCode += items.map(it => `"${escapeCppString(it)}"`).join(', ') || `""`;
            cppCode += ` };\n`;
            cppCode += `      const int combo_n_${id} = ${Math.max(items.length,1)};\n`;
            cppCode += `      const char* combo_aktualny_${id} = (combo_wybor_${id} >= 0 && combo_wybor_${id} < combo_n_${id}) ? combo_items_${id}[combo_wybor_${id}] : "";\n`;
            cppCode += `      gui_wypisz_tekst_kolor_skala(WIN_X + ${relX} + 4, WIN_Y + ${relY} + 4, ${el.color}, 1, combo_aktualny_${id});\n`;
            cppCode += `      gui_rysuj_prostokat(WIN_X + ${relX + el.w - 18}, WIN_Y + ${relY}, 18, ${el.h}, 0x00E0E0E0);\n`;
            cppCode += `      gui_wypisz_tekst_kolor_skala(WIN_X + ${relX + el.w - 14}, WIN_Y + ${relY + 4}, 0x00303030, 1, combo_otwarty_${id} ? "^" : "v");\n`;
            cppCode += `      if (combo_otwarty_${id}) {\n`;
            cppCode += `          const int lista_h_${id} = combo_n_${id} * 16;\n`;
            cppCode += `          gui_rysuj_prostokat(WIN_X + ${relX}, WIN_Y + ${relY} + ${el.h}, ${el.w}, lista_h_${id}, 0x00FFFFFF);\n`;
            cppCode += `          gui_rysuj_prostokat(WIN_X + ${relX}, WIN_Y + ${relY} + ${el.h}, ${el.w}, 1, 0x00404040);\n`;
            cppCode += `          for (int i_${id} = 0; i_${id} < combo_n_${id}; ++i_${id}) {\n`;
            cppCode += `              int iy_${id} = WIN_Y + ${relY} + ${el.h} + i_${id} * 16;\n`;
            cppCode += `              if (i_${id} == combo_wybor_${id}) gui_rysuj_prostokat(WIN_X + ${relX}, iy_${id}, ${el.w}, 16, 0x000078D7);\n`;
            cppCode += `              gui_wypisz_tekst_kolor_skala(WIN_X + ${relX} + 4, iy_${id} + 2, i_${id} == combo_wybor_${id} ? 0x00FFFFFF : 0x00000000, 1, combo_items_${id}[i_${id}]);\n`;
            cppCode += `          }\n`;
            cppCode += `      }\n`;
            cppCode += `    }\n`;
        }
        else if (el.type === 'TCheckBox' || el.type === 'TDBCheckBox') {
            cppCode += `    gui_rysuj_prostokat(WIN_X + ${relX}, WIN_Y + ${relY}, 13, 13, 0x00FFFFFF);\n`;
            cppCode += `    gui_rysuj_prostokat(WIN_X + ${relX}, WIN_Y + ${relY}, 13, 1, 0x00404040);\n`;
            cppCode += `    if (zaznaczone_${id}) gui_wypisz_tekst_kolor_skala(WIN_X + ${relX} + 1, WIN_Y + ${relY}, 0x00008A00, 1, "X");\n`;
            cppCode += `    gui_wypisz_tekst_kolor_skala(WIN_X + ${relX} + 18, WIN_Y + ${relY} + 1, ${el.color}, 1, "${txt}");\n`;
        }
        else if (el.type === 'TRadioButton') {
            cppCode += `    gui_rysuj_prostokat(WIN_X + ${relX}, WIN_Y + ${relY}, 13, 13, 0x00FFFFFF);\n`;
            cppCode += `    if (wybrane_${id}) gui_rysuj_prostokat(WIN_X + ${relX + 4}, WIN_Y + ${relY + 4}, 5, 5, 0x00000000);\n`;
            cppCode += `    gui_wypisz_tekst_kolor_skala(WIN_X + ${relX} + 18, WIN_Y + ${relY} + 1, ${el.color}, 1, "${txt}");\n`;
        }
        else if (el.type === 'TProgressBar') {
            cppCode += `    gui_rysuj_prostokat(WIN_X + ${relX}, WIN_Y + ${relY}, ${el.w}, ${el.h}, ${el.bg});\n`;
            cppCode += `    gui_rysuj_prostokat(WIN_X + ${relX}, WIN_Y + ${relY}, (${el.w} * ${el.value||50}) / 100, ${el.h}, ${el.color});\n`;
        }
        else if (el.type === 'TStatusBar') {
            cppCode += `    gui_rysuj_prostokat(WIN_X + ${relX}, WIN_Y + ${relY}, ${el.w}, ${el.h}, ${el.bg});\n`;
            cppCode += `    gui_wypisz_tekst_kolor_skala(WIN_X + ${relX} + 4, WIN_Y + ${relY} + 2, ${el.color}, 1, "${txt}");\n`;
        }
        else if (el.type === 'TMainMenu') {
            cppCode += `    gui_rysuj_prostokat(WIN_X + ${relX}, WIN_Y + ${relY}, ${el.w}, ${el.h}, ${el.bg});\n`;
            cppCode += `    gui_rysuj_prostokat(WIN_X + ${relX}, WIN_Y + ${relY} + ${el.h} - 1, ${el.w}, 1, 0x00404040);\n`;
            let currentX = 10;
            items.forEach(item => {
                cppCode += `    gui_wypisz_tekst_kolor_skala(WIN_X + ${relX} + ${currentX}, WIN_Y + ${relY} + 4, ${el.color}, 1, "${escapeCppString(item)}");\n`;
                currentX += item.length * 8 + 15;
            });
        }
        else {
            cppCode += `    gui_rysuj_prostokat(WIN_X + ${relX}, WIN_Y + ${relY}, ${el.w}, ${el.h}, 0x00444444);\n`;
            cppCode += `    rysuj_tekst_wysrodkowany(WIN_X + ${relX}, WIN_Y + ${relY}, ${el.w}, ${el.h}, 1, 0x00FFFFFF, "${el.type}");\n`;
        }
    });

    cppCode += `\n    gui_odswiez();\n}\n\n`;

    cppCode += `extern "C" __attribute__((noreturn)) void _start() {\n`;
    cppCode += `    gui_pobierz_rozdzielczosc(&screen_w, &screen_h);\n`;
    cppCode += `    if (screen_w <= 0 || screen_h <= 0) gui_zakoncz_aplikacje();\n`;
    cppCode += `    ogranicz_pozycje_okna(&WIN_X, &WIN_Y);\n`;
    cppCode += `    if (bws_utworz_warstwe(WIN_X, WIN_Y, WIN_W, WIN_H, 10) < 0) gui_zakoncz_aplikacje();\n`;
    cppCode += `    gui_ustaw_przejecie_myszy(true);\n`;
    cppCode += `    bool wyjdz = false;\n`;
    cppCode += `    RysujInterfejs(true);\n\n`;
    cppCode += `    while (!wyjdz) {\n`;
    cppCode += `        bws_zdarzenie zdarzenie{};\n`;
    cppCode += `        if (!gui_czekaj_na_zdarzenie(&zdarzenie)) continue;\n`;
    cppCode += `        if (zdarzenie.typ == BWS_ZDARZENIE_FOCUS && aplikacja_zminimalizowana) aplikacja_zminimalizowana = false;\n`;
    cppCode += `        const int mx = zdarzenie.x; const int my = zdarzenie.y;\n`;
    cppCode += `        const bool lewy = (zdarzenie.przyciski & 0x01U) != 0;\n`;
    cppCode += `        const bool klik_lewy = zdarzenie.typ == BWS_ZDARZENIE_MYSZ_DOWN;\n`;
    cppCode += `        const bool puszczenie_lewego = zdarzenie.typ == BWS_ZDARZENIE_MYSZ_UP;\n`;
    cppCode += `        bool redraw = false; bool pelne_czyszczenie = false;\n\n`;
    cppCode += `        if (aplikacja_zminimalizowana) continue;\n\n`;

    // Klikniecia w rozwiniete listy ComboBox obslugiwane PRZED reszta trafien,
    // bo lista rysuje sie NAD innymi kontrolkami.
    const combos = sortedElements.filter(e => e.type === 'TComboBox' || e.type === 'TDBComboBox');
    if (combos.length > 0) {
        cppCode += `        // Klikniecie w pozycje rozwinietej listy ComboBox (obsluga PRZED reszta trafien,\n`;
        cppCode += `        // bo lista rysuje sie NAD innymi kontrolkami).\n`;
        cppCode += `        bool combo_klik_obsluzony = false;\n`;
        cppCode += `        if (klik_lewy) {\n`;
        combos.forEach(el => {
            const id = cIdent(el);
            const items = (el.text||"").split('\n').filter(i => i.trim() !== '');
            let relX = windowEl ? el.x - windowEl.x : el.x;
            let relY = windowEl ? el.y - windowEl.y : el.y;
            cppCode += `            if (combo_otwarty_${id}) {\n`;
            cppCode += `                const int n_${id} = ${Math.max(items.length,1)};\n`;
            cppCode += `                if (punkt_w_prostokacie(mx, my, WIN_X + ${relX}, WIN_Y + ${relY} + ${el.h}, ${el.w}, n_${id} * 16)) {\n`;
            cppCode += `                    int wybrany_${id} = (my - (WIN_Y + ${relY} + ${el.h})) / 16;\n`;
            cppCode += `                    if (wybrany_${id} >= 0 && wybrany_${id} < n_${id}) combo_wybor_${id} = wybrany_${id};\n`;
            cppCode += `                    combo_otwarty_${id} = false; redraw = true; pelne_czyszczenie = true; combo_klik_obsluzony = true;\n`;
            if (el.onClick && el.onClick.trim() !== '') {
                cppCode += `                    // zdarzenie uzytkownika po zmianie wyboru\n`;
                el.onClick.split('\n').forEach(l => { if (l.trim() !== '') cppCode += `                    ${l}\n`; });
            }
            cppCode += `                } else if (punkt_w_prostokacie(mx, my, WIN_X + ${relX}, WIN_Y + ${relY}, ${el.w}, ${el.h})) {\n`;
            cppCode += `                    combo_otwarty_${id} = false; redraw = true; pelne_czyszczenie = true; combo_klik_obsluzony = true;\n`;
            cppCode += `                } else {\n`;
            cppCode += `                    combo_otwarty_${id} = false; redraw = true; pelne_czyszczenie = true;\n`;
            cppCode += `                }\n`;
            cppCode += `            }\n`;
        });
        cppCode += `        }\n\n`;
    } else {
        cppCode += `        bool combo_klik_obsluzony = false;\n\n`;
    }

    cppCode += `        if (!combo_klik_obsluzony && klik_lewy && punkt_w_prostokacie(mx, my, WIN_X, WIN_Y, WIN_W, WIN_H)) {\n`;

    if (windowEl) {
        cppCode += `            const gui_akcja_belki akcja = gui_hit_test_belki(mx, my, WIN_X, WIN_Y, WIN_W);\n`;
        cppCode += `            if (akcja == GUI_BELKA_MINIMALIZUJ) {\n`;
        cppCode += `                aplikacja_zminimalizowana = gui_minimalizuj_okno();\n`;
        cppCode += `                dragging = false; gui_ustaw_capture_myszy(false);\n`;
        cppCode += `            } else if (akcja == GUI_BELKA_ZAMKNIJ) {\n`;
        cppCode += `                wyjdz = true; dragging = false;\n`;
        cppCode += `            } else if (akcja == GUI_BELKA_MAKSYMALIZUJ) {\n`;
        cppCode += `                if (!zmaksymalizowane) {\n`;
        cppCode += `                    restore_x = WIN_X; restore_y = WIN_Y; restore_w = WIN_W; restore_h = WIN_H;\n`;
        cppCode += `                    WIN_X = 0; WIN_Y = 0; WIN_W = screen_w; WIN_H = screen_h - 40;\n`;
        cppCode += `                    zmaksymalizowane = true;\n`;
        cppCode += `                } else {\n`;
        cppCode += `                    WIN_X = restore_x; WIN_Y = restore_y; WIN_W = restore_w; WIN_H = restore_h;\n`;
        cppCode += `                    zmaksymalizowane = false;\n`;
        cppCode += `                }\n`;
        cppCode += `                if (bws_utworz_warstwe(WIN_X, WIN_Y, WIN_W, WIN_H, 10) < 0) gui_zakoncz_aplikacje();\n`;
        cppCode += `                redraw = true; pelne_czyszczenie = true;\n`;
        cppCode += `            } else if (akcja == GUI_BELKA_DRAG && !zmaksymalizowane) {\n`;
        cppCode += `                dragging = true; gui_ustaw_capture_myszy(true);\n`;
        cppCode += `                drag_off_x = mx - WIN_X; drag_off_y = my - WIN_Y;\n`;
        cppCode += `            } else {\n`;
    }

    // Hit-test od najwyzszego elementu do najnizszego, przerwanie po pierwszym
    // trafieniu (klik nie uruchamia kilku nakladajacych sie kontrolek).
    const hitOrder = [...sortedElements].filter(el => !isNonVisual(el.type)).reverse();
    let firstHit = true;
    hitOrder.forEach(el => {
        const id = cIdent(el);
        let relX = windowEl ? el.x - windowEl.x : el.x;
        let relY = windowEl ? el.y - windowEl.y : el.y;
        const hasCustom = el.onClick && el.onClick.trim() !== '';
        const isEventable = EVENTOWALNE_TYPY.includes(el.type);
        if (!hasCustom && !isEventable) return;

        cppCode += `                ${firstHit ? '' : 'else '}if (punkt_w_prostokacie(mx, my, WIN_X + ${relX}, WIN_Y + ${relY}, ${el.w}, ${el.h})) {\n`;
        firstHit = false;

        if (el.type === 'TCheckBox' || el.type === 'TDBCheckBox') {
            cppCode += `                    zaznaczone_${id} = !zaznaczone_${id};\n`;
        } else if (el.type === 'TRadioButton') {
            cppCode += `                    wybrane_${id} = !wybrane_${id};\n`;
        } else if (el.type === 'TListBox') {
            const items = (el.text||"").split('\n').filter(i => i.trim() !== '');
            cppCode += `                    { int rel_y_${id} = my - (WIN_Y + ${relY}); int nowy_wybor_${id} = rel_y_${id} / 16; if (nowy_wybor_${id} >= 0 && nowy_wybor_${id} < ${Math.max(items.length,1)}) wybor_${id} = nowy_wybor_${id}; }\n`;
        } else if (el.type === 'TCheckListBox') {
            cppCode += `                    zaznaczone_${id} = !zaznaczone_${id};\n`;
        } else if (el.type === 'TComboBox' || el.type === 'TDBComboBox') {
            cppCode += `                    combo_otwarty_${id} = !combo_otwarty_${id};\n`;
        }

        if (hasCustom) {
            el.onClick.split('\n').forEach(l => { if (l.trim() !== '') cppCode += `                    ${l}\n`; });
        }
        cppCode += `                    redraw = true; pelne_czyszczenie = true;\n                }\n`;
    });

    if(windowEl) cppCode += `            }\n`;
    cppCode += `        }\n\n`;
    cppCode += `        if (dragging && lewy) {\n`;
    cppCode += `            int nowy_x = mx - drag_off_x; int nowy_y = my - drag_off_y;\n`;
    cppCode += `            ogranicz_pozycje_okna(&nowy_x, &nowy_y);\n`;
    cppCode += `            if (nowy_x != WIN_X || nowy_y != WIN_Y) { WIN_X = nowy_x; WIN_Y = nowy_y; bws_przesun_warstwe(WIN_X, WIN_Y); gui_odswiez(); }\n`;
    cppCode += `        }\n`;
    cppCode += `        if (puszczenie_lewego && dragging) { dragging = false; gui_ustaw_capture_myszy(false); }\n`;
    cppCode += `        if (redraw && !wyjdz) RysujInterfejs(pelne_czyszczenie);\n`;
    cppCode += `    }\n`;
    cppCode += `    gui_zakoncz_aplikacje();\n}\n`;

    return cppCode;
}

Object.assign(window, {
    syncVisualToCode, generateCPPCode,
    openMonacoModal, closeMonacoModal, downloadCPP
});
