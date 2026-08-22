/* =========================================================================
 * Bursztyn Builder RAD v3.0 - baza komponentow (VCL) i akcji API.
 *
 * ACTION_TYPES rozszerzono o pelne pokrycie wywolan BWS 1..56 z
 * syscalls.cpp oraz wrapperow z bursztyn_gui.h. Kazda akcja ma funkcje
 * emit(params) zwracajaca gotowy kod C++ wstawiany do zdarzenia klikniecia.
 * ========================================================================= */

const OS_COLORS = {
    AmberDark: '0xFF1A0B00', AmberMid: '0xFF8A5A00', AmberLight: '0xFFFFBF00',
    CarbonBg: '0xFF1C1C1C', CarbonPanel: '0xFF2D2D2D', CarbonBorder: '0xFF404040',
    AccentBlue: '0xFF0078D7', AccentRed: '0xFFAA0000', White: '0xFFFFFFFF', Black: '0xFF000000',
    Transparent: '0x00000000'
};

/* Lista typow, ktore w wygenerowanej aplikacji reaguja na klikniecie
 * (moga miec przypiety wlasny kod / akcje w Edytorze Wizualnym). */
const EVENTOWALNE_TYPY = [
    'TButton', 'TBitBtn', 'TSpeedButton', 'TCheckBox', 'TRadioButton',
    'TComboBox', 'TListBox', 'TCheckListBox', 'TRadioGroup',
    'TEdit', 'TMemo', 'TLabeledEdit', 'TMaskEdit',
    'TTrackBar', 'TDateTimePicker', 'TTreeView', 'TListView',
    'TChildWindow', 'TModalWindow', 'TPopupWindow'
];

/* Kontenery: elementy polozone srodkiem wewnatrz ich prostokata przesuwaja
 * sie razem z kontenerem (panel/okno/grupa). */
const CONTAINER_TYPES = [
    'TPanel', 'TGroupBox', 'TRadioGroup', 'TScrollBox',
    'window', 'TChildWindow', 'TModalWindow', 'TPopupWindow'
];

/* Potężna baza danych komponentów Delphi/VCL w Bursztyn Builderze */
const COMPONENT_DB = {
    "Podstawowe (Standard)": [
        { type: 'window', icon: '🔲', name: 'Okno (Form)', w:600, h:450 },
        { type: 'TMainMenu', icon: '📑', name: 'TMainMenu', w:400, h:24 },
        { type: 'TPopupMenu', icon: '🖱️', name: 'TPopupMenu', w:32, h:32, n:true },
        { type: 'TLabel', icon: 'A', name: 'TLabel', w:60, h:20 },
        { type: 'TEdit', icon: '✏️', name: 'TEdit', w:120, h:24 },
        { type: 'TMemo', icon: '📝', name: 'TMemo', w:150, h:100 },
        { type: 'TButton', icon: '🔘', name: 'TButton', w:100, h:30 },
        { type: 'TCheckBox', icon: '☑️', name: 'TCheckBox', w:100, h:20 },
        { type: 'TRadioButton', icon: '🔵', name: 'TRadioButton', w:100, h:20 },
        { type: 'TListBox', icon: '📜', name: 'TListBox', w:120, h:100 },
        { type: 'TComboBox', icon: '🔽', name: 'TComboBox', w:120, h:24 },
        { type: 'TScrollBar', icon: '↕️', name: 'TScrollBar', w:20, h:100 },
        { type: 'TGroupBox', icon: '🗃️', name: 'TGroupBox', w:200, h:100 },
        { type: 'TRadioGroup', icon: '🔘', name: 'TRadioGroup', w:150, h:100 },
        { type: 'TPanel', icon: '🗂️', name: 'TPanel', w:200, h:150 },
        { type: 'TActionList', icon: '⚡', name: 'TActionList', w:32, h:32, n:true }
    ],
    "Rozszerzone (Additional)": [
        { type: 'TBitBtn', icon: '🖼️', name: 'TBitBtn', w:100, h:30 },
        { type: 'TSpeedButton', icon: '🚀', name: 'TSpeedButton', w:30, h:30 },
        { type: 'TMaskEdit', icon: '🎭', name: 'TMaskEdit', w:120, h:24 },
        { type: 'TStringGrid', icon: '▦', name: 'TStringGrid', w:200, h:150 },
        { type: 'TDrawGrid', icon: '🎨', name: 'TDrawGrid', w:200, h:150 },
        { type: 'TImage', icon: '🌄', name: 'TImage', w:100, h:100 },
        { type: 'TShape', icon: '🟦', name: 'TShape', w:50, h:50 },
        { type: 'TBevel', icon: '🧊', name: 'TBevel', w:100, h:5 },
        { type: 'TScrollBox', icon: '📦', name: 'TScrollBox', w:200, h:150 },
        { type: 'TCheckListBox', icon: '✅', name: 'TCheckListBox', w:150, h:100 },
        { type: 'TSplitter', icon: '↔️', name: 'TSplitter', w:5, h:100 },
        { type: 'TStaticText', icon: 'T', name: 'TStaticText', w:100, h:20 },
        { type: 'TControlBar', icon: '🛠️', name: 'TControlBar', w:300, h:30 },
        { type: 'TApplicationEvents', icon: '⚙️', name: 'TAppEvents', w:32, h:32, n:true },
        { type: 'TValueListEditor', icon: '📋', name: 'TValListEd', w:200, h:150 },
        { type: 'TLabeledEdit', icon: '🏷️', name: 'TLabeledEdit', w:120, h:40 },
        { type: 'TColorBox', icon: '🎨', name: 'TColorBox', w:120, h:24 },
        { type: 'TCategoryButtons', icon: '🗂️', name: 'TCatButtons', w:150, h:200 },
        { type: 'TTabSet', icon: '📑', name: 'TTabSet', w:300, h:25 }
    ],
    "Złożone (Zaawansowane)": [
        { type: 'TTabControl', icon: '🗂️', name: 'TTabControl', w:300, h:200 },
        { type: 'TPageControl', icon: '📑', name: 'TPageControl', w:300, h:200 },
        { type: 'TImageList', icon: '🖼️', name: 'TImageList', w:32, h:32, n:true },
        { type: 'TRichEdit', icon: '📝', name: 'TRichEdit', w:200, h:150 },
        { type: 'TTrackBar', icon: '🎚️', name: 'TTrackBar', w:150, h:30 },
        { type: 'TProgressBar', icon: '⏳', name: 'TProgressBar', w:150, h:20 },
        { type: 'TUpDown', icon: '↕️', name: 'TUpDown', w:20, h:24 },
        { type: 'THotKey', icon: '⌨️', name: 'THotKey', w:100, h:24 },
        { type: 'TAnimate', icon: '🎬', name: 'TAnimate', w:100, h:100 },
        { type: 'TDateTimePicker', icon: '📅', name: 'TDateTimePick', w:120, h:24 },
        { type: 'TMonthCalendar', icon: '📆', name: 'TMonthCal', w:200, h:160 },
        { type: 'TTreeView', icon: '🌳', name: 'TTreeView', w:150, h:200 },
        { type: 'TListView', icon: '📄', name: 'TListView', w:200, h:150 },
        { type: 'THeaderControl', icon: '🔝', name: 'THeaderCtrl', w:300, h:20 },
        { type: 'TStatusBar', icon: '🚥', name: 'TStatusBar', w:400, h:20 },
        { type: 'TToolBar', icon: '🛠️', name: 'TToolBar', w:400, h:30 },
        { type: 'TCoolBar', icon: '🧊', name: 'TCoolBar', w:400, h:30 },
        { type: 'TXPManifest', icon: '⚙️', name: 'TXPManifest', w:32, h:32, n:true }
    ],
    "Systemowe i Multimedia": [
        { type: 'TTimer', icon: '⏱️', name: 'TTimer', w:32, h:32, n:true },
        { type: 'TPaintBox', icon: '🖌️', name: 'TPaintBox', w:100, h:100 },
        { type: 'TMediaPlayer', icon: '⏯️', name: 'TMediaPlayer', w:250, h:30 },
        { type: 'TOleContainer', icon: '📦', name: 'TOleContainer', w:100, h:100 }
    ],
    "Dialogi (Dialogs)": [
        { type: 'TOpenDialog', icon: '📂', name: 'TOpenDialog', w:32, h:32, n:true },
        { type: 'TSaveDialog', icon: '💾', name: 'TSaveDialog', w:32, h:32, n:true },
        { type: 'TFontDialog', icon: '🔤', name: 'TFontDialog', w:32, h:32, n:true },
        { type: 'TColorDialog', icon: '🎨', name: 'TColorDialog', w:32, h:32, n:true },
        { type: 'TPrintDialog', icon: '🖨️', name: 'TPrintDialog', w:32, h:32, n:true },
        { type: 'TFindDialog', icon: '🔍', name: 'TFindDialog', w:32, h:32, n:true }
    ],
            "Bazy Danych (Data Controls)": [
        { type: 'TDBGrid', icon: '▦', name: 'TDBGrid', w:300, h:150 },
        { type: 'TDBNavigator', icon: '⏮️', name: 'TDBNav', w:240, h:25 },
        { type: 'TDBText', icon: 'A', name: 'TDBText', w:60, h:20 },
        { type: 'TDBEdit', icon: '✏️', name: 'TDBEdit', w:120, h:24 },
        { type: 'TDBImage', icon: '🖼️', name: 'TDBImage', w:100, h:100 },
        { type: 'TDBComboBox', icon: '🔽', name: 'TDBCombo', w:120, h:24 },
        { type: 'TDBCheckBox', icon: '☑️', name: 'TDBCheck', w:100, h:20 }
    ],
    "Okna dodatkowe (Bursztyn)": [
        { type: 'TChildWindow', icon: '🪟', name: 'Okno podrzędne', w:280, h:180 },
        { type: 'TModalWindow', icon: '🪧', name: 'Okno modalne', w:300, h:160 },
        { type: 'TPopupWindow', icon: '💭', name: 'Okno pop-up (PPM)', w:180, h:120 }
    ]
};

/* =========================================================================
 * AKCJE EDYTORA WIZUALNEGO - pelne API BWS 1..56 + wrappery bursztyn_gui.h
 * Typy parametrow: text | number | textarea | select(options) | color | ip
 * emit(p) zwraca kod C++; deklaracje zmiennych zawsze w bloku { ... }.
 * ========================================================================= */

/* Referencja do szerokosci okna w domyslnych parametrach clear_area. */
const WIN_W_REF = 200;

const ACTION_TYPES = {
    /* ------------------------- Standardowe ------------------------------ */
    'print': {
        icon: '📝', grupa: 'Standardowe',
        name: 'Wypisz do konsoli (BWS 1)',
        params: [{ name: 'text', label: 'Tekst', type: 'text', default: 'Witaj w Bursztyn OS!' }],
        emit: p => `wypisz("${escapeCppString(p.text)}\\n");`
    },
    'exec': {
        icon: '🚀', grupa: 'Standardowe',
        name: 'Uruchom program (BWS 10)',
        params: [
            { name: 'path', label: 'Program (.bur)', type: 'text', default: '/programy/notatnik.cebula/notatnik.bur' },
            { name: 'argument', label: 'Argument (opcjonalny)', type: 'text', default: '' }
        ],
        emit: p => {
            const prog = escapeCppString(p.path);
            const arg = String(p.argument || '').trim();
            if (arg) return `uruchom_program_z_argumentem_uzytkownika("${prog}", "${escapeCppString(arg)}");`;
            return `uruchom_program_uzytkownika("${prog}");`;
        }
    },
    'sound': {
        icon: '🔊', grupa: 'Standardowe',
        name: 'Zagraj dźwięk HDA (BWS 27)',
        params: [
            { name: 'hz', label: 'Częstotliwość Hz (20-20000)', type: 'number', default: 880 },
            { name: 'ms', label: 'Czas ms (1-10000)', type: 'number', default: 500 }
        ],
        emit: p => {
            let hz = intParam(p.hz, 440); if (hz < 20) hz = 20; if (hz > 20000) hz = 20000;
            let ms = intParam(p.ms, 500); if (ms < 1) ms = 1; if (ms > 10000) ms = 10000;
            return `bws_dzwiek_test(${hz}, ${ms});`;
        }
    },
    'exit': {
        icon: '❌', grupa: 'Standardowe',
        name: 'Zamknij aplikację (BWS 32)',
        params: [],
        emit: () => `gui_zakoncz_aplikacje(); // BWS 32 - nie wraca`
    },
    'raw': {
        icon: '💻', grupa: 'Standardowe',
        name: 'Surowy kod C++',
        params: [{ name: 'code', label: 'Kod', type: 'textarea', default: '// np. bws_wywolaj(17);\ngui_odswiez();' }],
        emit: p => `${p.code || ''}`
    },

    /* ----------------------------- Pliki -------------------------------- */
    'file_create': {
        icon: '📄', grupa: 'Pliki',
        name: 'Utwórz plik (BWS 2)',
        params: [{ name: 'path', label: 'Ścieżka', type: 'text', default: '/dane/nowy.txt' }],
        emit: p => `if (!utworz("${escapeCppString(p.path)}")) {\n    wypisz("[PZB] utworz_plik=ODMOWA\\n");\n}`
    },
    'file_write': {
        icon: '💾', grupa: 'Pliki',
        name: 'Zapisz do pliku (BWS 3)',
        params: [
            { name: 'path', label: 'Ścieżka', type: 'text', default: '/dane/log.txt' },
            { name: 'data', label: 'Treść', type: 'textarea', default: 'Hello Bursztyn!' }
        ],
        emit: p => `{ static const char tresc_zapisu[] = "${escapeCppString(p.data)}";\n  zapisz_plik("${escapeCppString(p.path)}", tresc_zapisu, (uint32_t)(sizeof(tresc_zapisu) - 1ULL)); }`
    },
    'file_read': {
        icon: '📖', grupa: 'Pliki',
        name: 'Czytaj plik (BWS 5)',
        params: [
            { name: 'path', label: 'Ścieżka', type: 'text', default: '/dane/log.txt' },
            { name: 'max', label: 'Maks. bajtów (do 65536)', type: 'number', default: 256 }
        ],
        emit: p => {
            const max = Math.min(65536, Math.max(2, intParam(p.max, 256)));
            return `{ char bufor_odczytu[${max}] = {0};\n  if (czytaj_plik("${escapeCppString(p.path)}", bufor_odczytu, ${max})) {\n      wypisz(bufor_odczytu);\n  } }`;
        }
    },
    'dir_list': {
        icon: '📂', grupa: 'Pliki',
        name: 'Wylistuj katalog (BWS 6)',
        params: [{ name: 'path', label: 'Katalog', type: 'text', default: '/dane' }],
        emit: p => `{ char lista_katalogu[2048] = {0};\n  if (wylistuj_katalog_uzytkownika("${escapeCppString(p.path)}", lista_katalogu, sizeof(lista_katalogu))) {\n      /* wpisy w formacie "[KAT] nazwa" / "[PLIK] nazwa" */\n      wypisz(lista_katalogu);\n      wypisz("\\n");\n  } }`
    },
    'file_delete': {
        icon: '🗑️', grupa: 'Pliki',
        name: 'Usuń plik/katalog (BWS 7)',
        params: [{ name: 'path', label: 'Ścieżka', type: 'text', default: '/dane/stary.txt' }],
        emit: p => `if (!usun_twor_uzytkownika("${escapeCppString(p.path)}")) wypisz("[PSF] usun=BLAD\\n");`
    },
    'file_rename': {
        icon: '✒️', grupa: 'Pliki',
        name: 'Zmień nazwę (BWS 8)',
        params: [
            { name: 'path', label: 'Ścieżka', type: 'text', default: '/dane/stary.txt' },
            { name: 'newname', label: 'Nowa nazwa', type: 'text', default: 'nowy.txt' }
        ],
        emit: p => `zmien_nazwe_uzytkownika("${escapeCppString(p.path)}", "${escapeCppString(p.newname)}");`
    },
    'file_size': {
        icon: '📏', grupa: 'Pliki',
        name: 'Rozmiar pliku (BWS 44)',
        params: [{ name: 'path', label: 'Ścieżka', type: 'text', default: '/dane/log.txt' }],
        emit: p => `{ uint32_t rozmiar_pliku_bws = 0;\n  if (pobierz_rozmiar_pliku("${escapeCppString(p.path)}", &rozmiar_pliku_bws)) {\n      /* plik istnieje; rozmiar w rozmiar_pliku_bws */\n  } else { wypisz("Brak pliku\\n"); } }`
    },
    'file_meta': {
        icon: '🏷️', grupa: 'Pliki',
        name: 'Metadane pliku (BWS 47)',
        params: [{ name: 'path', label: 'Ścieżka', type: 'text', default: '/dane/log.txt' }],
        emit: p => `{ BwsMetadanePliku meta_psf = {};\n  if (pobierz_metadane_pliku("${escapeCppString(p.path)}", &meta_psf)) {\n      /* meta_psf.rozmiar, meta_psf.typ, meta_psf.czas_utworzenia_rtc */\n  } }`
    },
    'dir_create': {
        icon: '📁', grupa: 'Pliki',
        name: 'Utwórz katalog (BWS 46)',
        params: [{ name: 'path', label: 'Ścieżka', type: 'text', default: '/dane/kopie' }],
        emit: p => `if (!utworz_katalog_uzytkownika("${escapeCppString(p.path)}")) wypisz("[PZB] mkdir=ODMOWA\\n");`
    },
    'file_move': {
        icon: '📦', grupa: 'Pliki',
        name: 'Przenieś (BWS 48)',
        params: [
            { name: 'path', label: 'Ścieżka', type: 'text', default: '/dane/a.txt' },
            { name: 'folder', label: 'Folder docelowy', type: 'text', default: '/kopie' }
        ],
        emit: p => `przenies_twor_uzytkownika("${escapeCppString(p.path)}", "${escapeCppString(p.folder)}");`
    },
    'file_copy': {
        icon: '📑', grupa: 'Pliki',
        name: 'Kopiuj (BWS 55)',
        params: [
            { name: 'path', label: 'Ścieżka', type: 'text', default: '/dane/a.txt' },
            { name: 'folder', label: 'Folder docelowy', type: 'text', default: '/kopie' }
        ],
        emit: p => `kopiuj_twor_uzytkownika("${escapeCppString(p.path)}", "${escapeCppString(p.folder)}");`
    },

    /* --------------------------- RTC / System --------------------------- */
    'rtc_time': {
        icon: '🕰️', grupa: 'System',
        name: 'Odczytaj zegar RTC (BWS 9)',
        params: [],
        emit: () => `{ char czas_rtc[32] = {0};\n  if (bws_wywolaj(9, (uint64_t)czas_rtc)) wypisz(czas_rtc); }`
    },
    'sys_reboot': {
        icon: '🔄', grupa: 'System',
        name: 'Restart systemu (BWS 25)',
        params: [],
        emit: () => `// Wymaga PZB_ZAUFANE + PRAWO_SYSTEM_CONFIG\nbws_wywolaj(25); // nie wraca`
    },
    'sys_shutdown': {
        icon: '⏻', grupa: 'System',
        name: 'Wyłącz system (BWS 26)',
        params: [],
        emit: () => `// Wymaga PZB_ZAUFANE + PRAWO_SYSTEM_CONFIG\nbws_wywolaj(26); // nie wraca`
    },

    /* ---------------------------- Proces -------------------------------- */
    'heap_alloc': {
        icon: '🧠', grupa: 'Proces',
        name: 'Alokuj pamięć sterty (BWS 35)',
        params: [{ name: 'size', label: 'Rozmiar bajtów (max 16 MiB)', type: 'number', default: 4096 }],
        emit: p => `{ void* pamiec_sterty = gui_malloc(${Math.min(16777216, Math.max(1, intParam(p.size, 4096)))});\n  if (pamiec_sterty) {\n      /* pamiec prywatna procesu; zwalniaj przez gui_free() */\n  } }`
    },
    'start_arg': {
        icon: '📥', grupa: 'Proces',
        name: 'Argument startowy (BWS 45)',
        params: [],
        emit: () => `{ char argument_startowy[256] = {0};\n  if (pobierz_argument_startowy(argument_startowy, sizeof(argument_startowy))) {\n      wypisz(argument_startowy); wypisz("\\n");\n  } }`
    },
    'shell_closed': {
        icon: '🐚', grupa: 'Proces',
        name: 'Czy powłoka zamknięta (BWS 36)',
        params: [],
        emit: () => `{ bool powloka_zamknieta = (bws_wywolaj(36) != 0);\n  (void)powloka_zamknieta; }`
    },

    /* ------------------------- Rysowanie GUI ---------------------------- */
    'draw_window': {
        icon: '🪟', grupa: 'GUI',
        name: 'Rysuj okno (BWS 14)',
        params: [
            { name: 'x', label: 'X', type: 'number', default: 10 }, { name: 'y', label: 'Y', type: 'number', default: 10 },
            { name: 'w', label: 'Szerokość', type: 'number', default: 200 }, { name: 'h', label: 'Wysokość', type: 'number', default: 120 },
            { name: 'title', label: 'Tytuł (max 63 znaki)', type: 'text', default: 'Okno' }
        ],
        emit: p => `gui_rysuj_okno(${intParam(p.x)}, ${intParam(p.y)}, ${intParam(p.w)}, ${intParam(p.h)}, "${escapeCppString(String(p.title).slice(0, 63))}");`
    },
    'draw_text': {
        icon: '🔤', grupa: 'GUI',
        name: 'Wypisz tekst (BWS 15)',
        params: [
            { name: 'x', label: 'X', type: 'number', default: 20 }, { name: 'y', label: 'Y', type: 'number', default: 20 },
            { name: 'text', label: 'Tekst', type: 'text', default: 'Tekst' }
        ],
        emit: p => `gui_wypisz_tekst(${intParam(p.x)}, ${intParam(p.y)}, "${escapeCppString(String(p.text).slice(0, 1023))}");`
    },
    'draw_text_color': {
        icon: '🖍️', grupa: 'GUI',
        name: 'Tekst z kolorem i skalą (BWS 20)',
        params: [
            { name: 'x', label: 'X', type: 'number', default: 20 }, { name: 'y', label: 'Y', type: 'number', default: 20 },
            { name: 'color', label: 'Kolor 0xAARRGGBB', type: 'color', default: '0xFFFFBF00' },
            { name: 'scale', label: 'Skala (wysokość glifu = 16 px)', type: 'number', default: 1 },
            { name: 'text', label: 'Tekst', type: 'text', default: 'Bursztyn' }
        ],
        emit: p => `gui_wypisz_tekst_kolor_skala(${intParam(p.x)}, ${intParam(p.y)}, ${p.color || '0xFFFFFFFF'}, ${Math.max(1, intParam(p.scale, 1))}, "${escapeCppString(String(p.text).slice(0, 1023))}");`
    },
    'draw_rect': {
        icon: '🟧', grupa: 'GUI',
        name: 'Rysuj prostokąt (BWS 21)',
        params: [
            { name: 'x', label: 'X', type: 'number', default: 10 }, { name: 'y', label: 'Y', type: 'number', default: 10 },
            { name: 'w', label: 'Szerokość', type: 'number', default: 100 }, { name: 'h', label: 'Wysokość', type: 'number', default: 50 },
            { name: 'color', label: 'Kolor', type: 'color', default: '0xFF0078D7' }
        ],
        emit: p => `gui_rysuj_prostokat(${intParam(p.x)}, ${intParam(p.y)}, ${intParam(p.w)}, ${intParam(p.h)}, ${p.color || '0xFF404040'});`
    },
    'clear_area': {
        icon: '🧽', grupa: 'GUI',
        name: 'Wyczyść obszar (BWS 16)',
        params: [
            { name: 'x', label: 'X', type: 'number', default: 0 }, { name: 'y', label: 'Y', type: 'number', default: 0 },
            { name: 'w', label: 'Szerokość', type: 'number', default: WIN_W_REF }, { name: 'h', label: 'Wysokość', type: 'number', default: 100 }
        ],
        emit: p => `gui_wyczyscz_obszar(${intParam(p.x)}, ${intParam(p.y)}, ${intParam(p.w, 100)}, ${intParam(p.h, 100)});`
    },
    'refresh': {
        icon: '🔃', grupa: 'GUI',
        name: 'Odśwież ekran (BWS 17)',
        params: [],
        emit: () => `gui_odswiez();`
    },
    'refresh_desktop': {
        icon: '🖥️', grupa: 'GUI',
        name: 'Odśwież pulpit (BWS 19)',
        params: [],
        emit: () => `gui_odswiez_pulpit();`
    },
    'get_resolution': {
        icon: '📐', grupa: 'GUI',
        name: 'Pobierz rozdzielczość (BWS 23)',
        params: [],
        emit: () => `{ int ekran_szer = 0, ekran_wys = 0;\n  gui_pobierz_rozdzielczosc(&ekran_szer, &ekran_wys);\n  (void)ekran_szer; (void)ekran_wys; }`
    },
    'char_width': {
        icon: '↔️', grupa: 'GUI',
        name: 'Szerokość znaku (BWS 24)',
        params: [{ name: 'unicode', label: 'Kod Unicode', type: 'number', default: 65 }],
        emit: p => `{ int szerokosc_glifu = gui_pobierz_szerokosc_znaku(${Math.max(0, intParam(p.unicode, 65))});\n  (void)szerokosc_glifu; }`
    },
    'font_height': {
        icon: '🔠', grupa: 'GUI',
        name: 'Wysokość fontu (BWS 51)',
        params: [],
        emit: () => `{ int wysokosc_fontu = gui_pobierz_wysokosc_fontu(); // 16 px\n  (void)wysokosc_fontu; }`
    },

    /* --------------------- Warstwy / okna / mysz ------------------------ */
    'layer_create': {
        icon: '🧱', grupa: 'Warstwy i okna',
        name: 'Utwórz warstwę (BWS 33)',
        params: [
            { name: 'x', label: 'X', type: 'number', default: 0 }, { name: 'y', label: 'Y', type: 'number', default: 0 },
            { name: 'w', label: 'Szerokość', type: 'number', default: 300 }, { name: 'h', label: 'Wysokość', type: 'number', default: 200 },
            { name: 'z', label: 'Z-order', type: 'number', default: 10 }
        ],
        emit: p => `{ int id_warstwy_app = bws_utworz_warstwe(${intParam(p.x)}, ${intParam(p.y)}, ${intParam(p.w)}, ${intParam(p.h)}, ${intParam(p.z)});\n  if (id_warstwy_app < 0) gui_zakoncz_aplikacje(); }`
    },
    'layer_move': {
        icon: '📍', grupa: 'Warstwy i okna',
        name: 'Przesuń warstwę (BWS 34)',
        params: [
            { name: 'x', label: 'Nowe X', type: 'number', default: 0 }, { name: 'y', label: 'Nowe Y', type: 'number', default: 0 }
        ],
        emit: p => `bws_przesun_warstwe(${intParam(p.x)}, ${intParam(p.y)});`
    },
    'window_minimize': {
        icon: '➖', grupa: 'Warstwy i okna',
        name: 'Minimalizuj okno (BWS 41)',
        params: [],
        emit: () => `aplikacja_zminimalizowana = gui_minimalizuj_okno();`
    },
    'window_maximize': {
        icon: '⬜', grupa: 'Warstwy i okna',
        name: 'Maksymalizuj / przywróć okno',
        params: [],
        emit: () => `// Maksymalizacja jest logiką aplikacji: pełny ekran = nowa warstwa BWS 33\nif (!zmaksymalizowane) {\n    restore_x = WIN_X; restore_y = WIN_Y; restore_w = WIN_W; restore_h = WIN_H;\n    WIN_X = 0; WIN_Y = 0; WIN_W = screen_w; WIN_H = screen_h - 40;\n    zmaksymalizowane = true;\n} else {\n    WIN_X = restore_x; WIN_Y = restore_y; WIN_W = restore_w; WIN_H = restore_h;\n    zmaksymalizowane = false;\n}\nif (bws_utworz_warstwe(WIN_X, WIN_Y, WIN_W, WIN_H, 10) < 0) gui_zakoncz_aplikacje();\nredraw = true; pelne_czyszczenie = true;`
    },
    'window_list': {
        icon: '🗂️', grupa: 'Warstwy i okna',
        name: 'Lista okien systemu (BWS 42)',
        params: [{ name: 'max', label: 'Maks. okien', type: 'number', default: 16 }],
        emit: p => `{ GuiOknoInfo snapshot_okien[${Math.max(1, intParam(p.max, 16))}] = {};\n  uint32_t liczba_okien = gui_pobierz_okna(snapshot_okien, ${Math.max(1, intParam(p.max, 16))});\n  (void)liczba_okien; }`
    },
    'window_activate': {
        icon: '👆', grupa: 'Warstwy i okna',
        name: 'Aktywuj okno (BWS 43)',
        params: [{ name: 'id', label: 'Identyfikator okna', type: 'number', default: 1 }],
        emit: p => `gui_aktywuj_okno((uint64_t)${intParam(p.id, 1)});`
    },
    'mouse_grab': {
        icon: '🖐️', grupa: 'Wejście',
        name: 'Przejęcie myszy (BWS 22)',
        params: [{ name: 'stan', label: 'Stan', type: 'select', options: ['true', 'false'], default: 'true' }],
        emit: p => `gui_ustaw_przejecie_myszy(${p.stan === 'false' ? 'false' : 'true'});`
    },
    'mouse_capture': {
        icon: '🎯', grupa: 'Wejście',
        name: 'Capture myszy (BWS 39)',
        params: [{ name: 'stan', label: 'Stan', type: 'select', options: ['true', 'false'], default: 'true' }],
        emit: p => `gui_ustaw_capture_myszy(${p.stan === 'false' ? 'false' : 'true'});`
    },
    'mouse_get': {
        icon: '🖱️', grupa: 'Wejście',
        name: 'Pobierz pozycję myszy (BWS 18)',
        params: [],
        emit: () => `{ int mysz_x = 0, mysz_y = 0; uint8_t mysz_przyciski = 0;\n  gui_pobierz_mysz(&mysz_x, &mysz_y, &mysz_przyciski); }`
    },
    'event_poll': {
        icon: '📬', grupa: 'Wejście',
        name: 'Sprawdź zdarzenie (nieblokująco, BWS 37)',
        params: [],
        emit: () => `{ bws_zdarzenie zdarzenie_poll{};\n  while (gui_pobierz_zdarzenie(&zdarzenie_poll)) {\n      /* zdarzenie_poll.typ wg BWS_ZDARZENIE_* */\n  } }`
    },
    'event_wait': {
        icon: '⏳', grupa: 'Wejście',
        name: 'Czekaj na zdarzenie (BWS 38)',
        params: [],
        emit: () => `{ bws_zdarzenie zdarzenie_wait{};\n  if (!gui_czekaj_na_zdarzenie(&zdarzenie_wait)) { /* timeout/brak */ } }`
    },

    /* ------------------------------- Sieć ------------------------------- */
    'net_ping': {
        icon: '📡', grupa: 'Sieć',
        name: 'Ping ICMP (BWS 11)',
        params: [
            { name: 'ip1', label: 'IP oktet 1', type: 'number', default: 8 },
            { name: 'ip2', label: 'IP oktet 2', type: 'number', default: 8 },
            { name: 'ip3', label: 'IP oktet 3', type: 'number', default: 8 },
            { name: 'ip4', label: 'IP oktet 4', type: 'number', default: 8 }
        ],
        emit: p => `{ uint64_t ping_ms = bws_wywolaj(11, ${intParam(p.ip1, 8)}, ${intParam(p.ip2, 8)}, ${intParam(p.ip3, 8)}, ${intParam(p.ip4, 8)});\n  if (ping_ms == 0) wypisz("Ping: brak odpowiedzi\\n"); }`
    },
    'net_dns': {
        icon: '🌐', grupa: 'Sieć',
        name: 'DNS (BWS 12/28)',
        params: [{ name: 'domain', label: 'Domena', type: 'text', default: 'example.com' }],
        emit: p => `{ uint8_t ip_dns[4] = {0};\n  if (bws_siec_dns("${escapeCppString(p.domain)}", ip_dns)) {\n      /* wynik w ip_dns[0..3] */\n  } else { wypisz("DNS: blad rozwiazania\\n"); } }`
    },
    'net_http': {
        icon: '⬇️', grupa: 'Sieć',
        name: 'Pobieranie HTTP (BWS 29)',
        params: [
            { name: 'ip', label: 'Adres IPv4 serwera', type: 'ip', default: '93.184.216.34' },
            { name: 'domain', label: 'Domena (Host:)', type: 'text', default: 'example.com' },
            { name: 'path', label: 'Ścieżka', type: 'text', default: '/' },
            { name: 'buf', label: 'Bufor bajtów (maks. 262144)', type: 'number', default: 4096 }
        ],
        emit: p => {
            const o = String(p.ip || '0.0.0.0').split('.').map(v => intParam(v)); while (o.length < 4) o.push(0);
            const buf = Math.min(262144, Math.max(2, intParam(p.buf, 4096)));
            return `{ uint8_t ip_http[] = {${o.join(', ')}};\n  char odpowiedz_http[${buf}] = {0};\n  if (bws_siec_pobierz_http(ip_http, "${escapeCppString(p.domain)}", "${escapeCppString(p.path)}", odpowiedz_http, ${buf} - 1U)) {\n      wypisz(odpowiedz_http);\n  } else { wypisz("HTTP: blad pobierania\\n"); } }`;
        }
    },
    'net_https': {
        icon: '🔒', grupa: 'Sieć',
        name: 'Pobieranie HTTPS (BWS 30)',
        params: [
            { name: 'ip', label: 'Adres IPv4 serwera', type: 'ip', default: '93.184.216.34' },
            { name: 'domain', label: 'Domena (SNI)', type: 'text', default: 'example.com' },
            { name: 'path', label: 'Ścieżka', type: 'text', default: '/' },
            { name: 'buf', label: 'Bufor bajtów (maks. 262144)', type: 'number', default: 4096 }
        ],
        emit: p => {
            const o = String(p.ip || '0.0.0.0').split('.').map(v => intParam(v)); while (o.length < 4) o.push(0);
            const buf = Math.min(262144, Math.max(2, intParam(p.buf, 4096)));
            return `{ uint8_t ip_https[] = {${o.join(', ')}};\n  char odpowiedz_https[${buf}] = {0};\n  if (!bws_tls_certyfikat_zaufany()) wypisz("TLS: certyfikat NIEZAUFANY\\n");\n  if (bws_siec_pobierz_https(ip_https, "${escapeCppString(p.domain)}", "${escapeCppString(p.path)}", odpowiedz_https, ${buf} - 1U)) {\n      wypisz(odpowiedz_https);\n  } else { wypisz("HTTPS: blad pobierania\\n"); } }`;
        }
    },
    'net_tls': {
        icon: '🛡️', grupa: 'Sieć',
        name: 'Status certyfikatu TLS (BWS 31)',
        params: [],
        emit: () => `{ bool tls_zaufany = bws_tls_certyfikat_zaufany();\n  wypisz(tls_zaufany ? "TLS: zaufany\\n" : "TLS: brak sesji\\n"); }`
    },

    /* ---------------------- Schowek i Drag&Drop ------------------------- */
    'clip_set': {
        icon: '📋', grupa: 'Schowek i Drag&Drop',
        name: 'Ustaw schowek plików (BWS 52)',
        params: [
            { name: 'path', label: 'Ścieżka', type: 'text', default: '/dane/a.txt' },
            { name: 'operacja', label: 'Operacja', type: 'select', options: ['COPY', 'CUT'], default: 'COPY' }
        ],
        emit: p => `ustaw_schowek_plikow("${escapeCppString(p.path)}", ${p.operacja === 'CUT' ? 'BWS_SCHOWEK_CUT' : 'BWS_SCHOWEK_COPY'});`
    },
    'clip_get': {
        icon: '📤', grupa: 'Schowek i Drag&Drop',
        name: 'Pobierz schowek plików (BWS 53)',
        params: [],
        emit: () => `{ BwsSchowekPlikow schowek_bws = {};\n  if (pobierz_schowek_plikow(&schowek_bws) && schowek_bws.operacja != BWS_SCHOWEK_PUSTY) {\n      /* schowek_bws.sciezka, operacja (1=kopiuj, 2=wytnij), generacja */\n  } }`
    },
    'clip_clear': {
        icon: '🚮', grupa: 'Schowek i Drag&Drop',
        name: 'Wyczyść schowek (BWS 54)',
        params: [{ name: 'gen', label: 'Generacja (0 = pobierz sam)', type: 'number', default: 0 }],
        emit: p => {
            if (intParam(p.gen) > 0) return `wyczysc_schowek_plikow((uint64_t)${intParam(p.gen)});`;
            return `{ BwsSchowekPlikow stan_schodzka = {};\n  if (pobierz_schowek_plikow(&stan_schodzka)) wyczysc_schowek_plikow(stan_schodzka.generacja); }`;
        }
    },
    'drop_register': {
        icon: '🎯', grupa: 'Schowek i Drag&Drop',
        name: 'Rejestruj cel Drag&Drop (BWS 49)',
        params: [
            { name: 'x', label: 'X', type: 'number', default: 10 }, { name: 'y', label: 'Y', type: 'number', default: 10 },
            { name: 'w', label: 'Szerokość', type: 'number', default: 120 }, { name: 'h', label: 'Wysokość', type: 'number', default: 90 },
            { name: 'folder', label: 'Folder docelowy (musi istnieć)', type: 'text', default: '/dane' }
        ],
        emit: p => `{ BwsCelDrop cel_drop = {};\n  cel_drop.x = ${intParam(p.x)}; cel_drop.y = ${intParam(p.y)};\n  cel_drop.szer = ${intParam(p.w)}; cel_drop.wys = ${intParam(p.h)};\n  __builtin_memcpy(cel_drop.folder, "${escapeCppString(p.folder)}", sizeof("${escapeCppString(p.folder)}"));\n  gui_rejestruj_cele_drop(&cel_drop, 1U); }`
    },
    'drag_update': {
        icon: '🫳', grupa: 'Schowek i Drag&Drop',
        name: 'Aktualizuj przeciąganie (BWS 50)',
        params: [
            { name: 'path', label: 'Przeciągany obiekt', type: 'text', default: '/dane/a.txt' },
            { name: 'x', label: 'X kursora', type: 'number', default: 0 }, { name: 'y', label: 'Y kursora', type: 'number', default: 0 },
            { name: 'drop', label: 'Wykonaj drop', type: 'select', options: ['true', 'false'], default: 'true' }
        ],
        emit: p => `{ BwsWynikDrop wynik_drag = gui_aktualizuj_drag("${escapeCppString(p.path)}", ${intParam(p.x)}, ${intParam(p.y)}, ${p.drop === 'false' ? 'false' : 'true'});\n  if (wynik_drag == BWS_DROP_PRZENIESIONO) wypisz("Przeniesiono\\n"); }`
    }
};

/* =========================================================================
 * KATEGORIE BLOKOW (interfejs typu Scratch)
 * ========================================================================= */
const BLOCK_CATS = [
    { id: 'ruch',      name: 'Ruch',       color: '#4C97FF' },
    { id: 'wyglad',    name: 'Wygląd',     color: '#9966FF' },
    { id: 'dzwiek',    name: 'Dźwięk',     color: '#CF63CF' },
    { id: 'zdarzenia', name: 'Zdarzenia',  color: '#FFBF00' },
    { id: 'kontrola',  name: 'Kontrola',   color: '#FFAB19' },
    { id: 'czujniki',  name: 'Czujniki',   color: '#5CB1D6' },
    { id: 'wyrazenia', name: 'Wyrażenia',  color: '#59C059' },
    { id: 'zmienne',   name: 'Zmienne',    color: '#D9782D' },
    { id: 'moje',      name: 'Moje bloki', color: '#FF6680' },
    { id: 'api',       name: 'API BWS',    color: '#E58A00' }
];

/* Przypisanie istniejacych akcji do kategorii Scratch. */
const KEY2KAT = {
    print: 'wyglad', exec: 'api', sound: 'dzwiek', exit: 'kontrola', raw: 'moje',
    file_create: 'api', file_write: 'api', file_read: 'api', dir_list: 'api',
    file_delete: 'api', file_rename: 'api', file_size: 'api', file_meta: 'api',
    dir_create: 'api', file_move: 'api', file_copy: 'api',
    rtc_time: 'czujniki', start_arg: 'czujniki', shell_closed: 'czujniki',
    sys_reboot: 'api', sys_shutdown: 'api',
    heap_alloc: 'zmienne',
    draw_window: 'wyglad', draw_text: 'wyglad', draw_text_color: 'wyglad',
    draw_rect: 'wyglad', clear_area: 'wyglad', refresh: 'wyglad',
    refresh_desktop: 'wyglad', char_width: 'wyglad', font_height: 'wyglad',
    get_resolution: 'czujniki',
    layer_create: 'ruch', layer_move: 'ruch',
    window_minimize: 'wyglad', window_maximize: 'wyglad',
    window_list: 'wyglad', window_activate: 'wyglad',
    sys_overlay: 'wyglad', app_popup: 'wyglad',
    mouse_grab: 'czujniki', mouse_capture: 'czujniki',
    mouse_get: 'czujniki', event_poll: 'czujniki', event_wait: 'kontrola',
    key_read: 'czujniki',
    net_ping: 'api', net_dns: 'api', net_http: 'api', net_https: 'api', net_tls: 'api',
    clip_set: 'api', clip_get: 'api', clip_clear: 'api',
    drop_register: 'api', drag_update: 'api'
};

/* Bezpieczny identyfikator C++ ze zmiennej podanej przez uzytkownika. */
function cppVar(name, fallback) {
    let s = String(name || fallback || 'zmienna').trim();
    const map = { 'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n', 'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z' };
    s = s.replace(/[ąćęłńóśźż]/g, ch => map[ch] || ch).replace(/[^a-zA-Z0-9_]/g, '_');
    if (!/^[a-zA-Z_]/.test(s)) s = 'v_' + s;
    return s;
}

/* Unikalny sufiks instancji bloku (do nazw zmiennych pomocniczych). */
function blkUid(ev) {
    return (ev && ev.uid) ? ev.uid : Math.random().toString(36).slice(2, 7);
}

/* =========================================================================
 * NOWE KLOCKI: Zdarzenia / Kontrola / Czujniki / Wyrazenia / Zmienne /
 * Moje bloki / Ruch / Wyglad
 * wrap:'open' otwiera blok { ... }, 'close' zamyka, hat:true = blok startowy.
 * emit(p, ev) - drugi argument to instancja zdarzenia (uid do unikalnosci).
 * ========================================================================= */
Object.assign(ACTION_TYPES, {
    /* ------------------------- ZDARZENIA (haty) ------------------------ */
    'event_click': {
        icon: '🟨', kat: 'zdarzenia', hat: true,
        name: 'kiedy kliknięto ten komponent',
        params: [], emit: () => ``
    },
    'event_key': {
        icon: '🟨', kat: 'zdarzenia', hat: true, wrap: 'open',
        name: 'kiedy naciśnięto klawisz [kod]',
        params: [{ name: 'kod', label: 'Kod klawisza (puste = dowolny)', type: 'number', default: '' }],
        emit: p => {
            const c = intParam(p.kod);
            return c > 0
                ? `if (zdarzenie.typ == BWS_ZDARZENIE_KLAWISZ && zdarzenie.kod == static_cast<uint32_t>(${c})) {\n`
                : `if (zdarzenie.typ == BWS_ZDARZENIE_KLAWISZ) {\n`;
        }
    },
    'event_mousemove': {
        icon: '🟨', kat: 'zdarzenia', hat: true, wrap: 'open',
        name: 'kiedy ruszono myszą',
        params: [],
        emit: () => `if (zdarzenie.typ == BWS_ZDARZENIE_MYSZ_RUCH) {\n`
    },
    'event_ppm': {
        icon: '🟨', kat: 'zdarzenia', hat: true, wrap: 'open',
        name: 'kiedy prawy przycisk myszy',
        params: [],
        emit: () => `if (zdarzenie.typ == BWS_ZDARZENIE_MYSZ_PRAWY_DOWN) {\n`
    },
    'event_otworz_plik': {
        icon: '🟨', kat: 'zdarzenia', hat: true, wrap: 'open',
        name: 'kiedy otrzymano plik (OTWÓRZ_PLIK)',
        params: [],
        emit: () => `if (zdarzenie.typ == BWS_ZDARZENIE_OTWORZ_PLIK) {\n`
    },
    'event_timer': {
        icon: '🟨', kat: 'zdarzenia', hat: true, wrap: 'open',
        name: 'kiedy tyknie zegar systemowy (TIMER)',
        params: [],
        emit: () => `if (zdarzenie.typ == BWS_ZDARZENIE_TIMER) {\n`
    },

    /* ---------------------------- KONTROLA ----------------------------- */
    'repeat': {
        icon: '🔁', kat: 'kontrola', wrap: 'open',
        name: 'powtórz [ile] razy',
        params: [{ name: 'ile', label: 'Ile razy', type: 'number', default: 10 }],
        emit: (p, ev) => {
            const U = blkUid(ev);
            const n = Math.max(1, intParam(p.ile, 10));
            return `for (int rep_${U} = 0; rep_${U} < ${n}; ++rep_${U}) {\n`;
        }
    },
    'repeat_until': {
        icon: '🔄', kat: 'kontrola', wrap: 'open',
        name: 'powtarzaj aż [warunek] ⚠',
        params: [{ name: 'warunek', label: 'Warunek końca (C++)', type: 'text', default: '(punkty > 10)' }],
        emit: p => `while (!(${String(p.warunek || 'false').replace(/\n/g, ' ')})) {\n    // UWAGA: bez "czekaj" w środku petla zamrozi aplikacje\n`
    },
    'forever': {
        icon: '♾️', kat: 'kontrola', wrap: 'open',
        name: 'zawsze ⚠ blokuje aplikację',
        params: [],
        emit: () => `while (true) {\n    // UWAGA: petla nieskonczonowana w obsludze zdarzen zamrozi aplikacje\n`
    },
    'if_block': {
        icon: '❓', kat: 'kontrola', wrap: 'open',
        name: 'jeżeli [warunek] to',
        params: [{ name: 'warunek', label: 'Warunek (C++)', type: 'textarea', default: '(mx > WIN_X + 100)' }],
        emit: p => `if (${String(p.warunek || 'true').replace(/\n/g, ' ')}) {\n`
    },
    'else_block': {
        icon: '🔀', kat: 'kontrola', wrap: 'else',
        name: 'w przeciwnym razie',
        params: [],
        emit: () => `` // obslugiwane specjalnie przez generator (} else {)
    },
    'koniec': {
        icon: '🔚', kat: 'kontrola', wrap: 'close',
        name: 'koniec',
        params: [],
        emit: () => `` // obslugiwane specjalnie przez generator
    },
    'break_loop': {
        icon: '🛑', kat: 'kontrola',
        name: 'przerwij pętlę',
        params: [],
        emit: () => `break; // wyjście z bieżącej pętli\n`
    },
    'continue_iter': {
        icon: '⏭️', kat: 'kontrola',
        name: 'następna iteracja',
        params: [],
        emit: () => `continue; // skok do następnego obrotu pętli\n`
    },
    'czekaj': {
        icon: '⏳', kat: 'kontrola',
        name: 'czekaj [ile] tyknięć zegara',
        params: [{ name: 'ile', label: 'Tyknięć (TIMER)', type: 'number', default: 1 }],
        emit: (p, ev) => {
            const U = blkUid(ev);
            const n = Math.max(1, intParam(p.ile, 1));
            return `{ for (int cz_${U} = 0; cz_${U} < ${n}; ++cz_${U}) { bws_zdarzenie cz_ev_${U}{}; gui_czekaj_na_zdarzenie(&cz_ev_${U}); } } // opóźnienie ≈ tyknięcia systemowe\n`;
        }
    },
    'klonuj': {
        icon: '👥', kat: 'kontrola',
        name: 'klonuj — uruchom kopię programu',
        params: [{ name: 'program', label: 'Program (.bur)', type: 'text', default: '/shell.bur' }],
        emit: p => `// Klonowanie w BWS = nowy proces przez loader (BWS 10)\nuruchom_program_uzytkownika("${escapeCppString(p.program)}");\n`
    },

    /* --------------------- LOGIKA (porównania) ------------------------- */
    'cmp_porownaj': {
        icon: '⚖️', kat: 'wyrazenia',
        name: 'porównaj [a] [op] [b]',
        params: [
            { name: 'a', label: 'Lewa strona', type: 'text', default: 'punkty' },
            { name: 'op', label: 'Operator', type: 'select', options: ['==', '!=', '>', '<', '>=', '<='], default: '>' },
            { name: 'b', label: 'Prawa strona', type: 'text', default: '10' }
        ],
        emit: (p, ev) => {
            const U = blkUid(ev);
            const op = ['==', '!=', '>', '<', '>=', '<='].includes(p.op) ? p.op : '==';
            return `const bool cmp_${U} = ((${String(p.a || '0').replace(/\n/g, ' ')}) ${op} (${String(p.b || '0').replace(/\n/g, ' ')}));\n(void)cmp_${U}; // użyj w "jeżeli": cmp_${U}\n`;
        }
    },
    'logic_oraz': {
        icon: '🔗', kat: 'wyrazenia',
        name: '[a] ORAZ [b]',
        params: [
            { name: 'a', label: 'Warunek A', type: 'text', default: '(nad_x)' },
            { name: 'b', label: 'Warunek B', type: 'text', default: '(mx > 0)' }
        ],
        emit: (p, ev) => {
            const U = blkUid(ev);
            return `const bool oraz_${U} = (${String(p.a || 'true').replace(/\n/g, ' ')}) && (${String(p.b || 'true').replace(/\n/g, ' ')});\n(void)oraz_${U};\n`;
        }
    },
    'logic_lub': {
        icon: '🔀', kat: 'wyrazenia',
        name: '[a] LUB [b]',
        params: [
            { name: 'a', label: 'Warunek A', type: 'text', default: '(nad_x)' },
            { name: 'b', label: 'Warunek B', type: 'text', default: '(my > 0)' }
        ],
        emit: (p, ev) => {
            const U = blkUid(ev);
            return `const bool lub_${U} = (${String(p.a || 'false').replace(/\n/g, ' ')}) || (${String(p.b || 'false').replace(/\n/g, ' ')});\n(void)lub_${U};\n`;
        }
    },
    'logic_nie': {
        icon: '🔄', kat: 'wyrazenia',
        name: 'NIE [a]',
        params: [{ name: 'a', label: 'Warunek', type: 'text', default: '(nad_x)' }],
        emit: (p, ev) => {
            const U = blkUid(ev);
            return `const bool nie_${U} = !(${String(p.a || 'false').replace(/\n/g, ' ')});\n(void)nie_${U};\n`;
        }
    },

    /* ---------------------------- CZUJNIKI ----------------------------- */
    'nad_prostokatem': {
        icon: '🎯', kat: 'czujniki',
        name: 'czy kursor nad prostokątem x y w h',
        params: [
            { name: 'x', label: 'X', type: 'number', default: 10 }, { name: 'y', label: 'Y', type: 'number', default: 10 },
            { name: 'w', label: 'Szerokość', type: 'number', default: 100 }, { name: 'h', label: 'Wysokość', type: 'number', default: 50 }
        ],
        emit: (p, ev) => {
            const U = blkUid(ev);
            return `const bool nad_${U} = punkt_w_prostokacie(mx, my, WIN_X + (${intParam(p.x)}), WIN_Y + (${intParam(p.y)}), ${intParam(p.w)}, ${intParam(p.h)});\n(void)nad_${U}; // użyj w warunku "jeżeli": nad_${U}\n`;
        }
    },

    /* --------------------------- WYRAŻENIA ----------------------------- */
    'ustaw_liczbe': {
        icon: '🟢', kat: 'wyrazenia',
        name: 'ustaw [nazwa] na wyrażenie',
        params: [
            { name: 'nazwa', label: 'Nazwa zmiennej', type: 'text', default: 'licznik' },
            { name: 'wyrazenie', label: 'Wyrażenie (C++)', type: 'text', default: '0' }
        ],
        emit: p => `int ${cppVar(p.nazwa)} = (${String(p.wyrazenie || '0').replace(/\n/g, ' ')});\n`
    },
    'dodaj_do': {
        icon: '➕', kat: 'wyrazenia',
        name: 'dodaj do [nazwa] wartość',
        params: [
            { name: 'nazwa', label: 'Nazwa zmiennej', type: 'text', default: 'licznik' },
            { name: 'wyrazenie', label: 'Wyrażenie', type: 'text', default: '1' }
        ],
        emit: p => `${cppVar(p.nazwa)} += (${String(p.wyrazenie || '1').replace(/\n/g, ' ')});\n`
    },
    'losowa': {
        icon: '🎲', kat: 'wyrazenia',
        name: 'losowa liczba od 0 do [zakres]',
        params: [{ name: 'zakres', label: 'Zakres (mod)', type: 'number', default: 100 }],
        emit: (p, ev) => {
            const U = blkUid(ev);
            const m = Math.max(2, intParam(p.zakres, 100));
            return `int los_${U} = static_cast<int>(zdarzenie.timestamp % ${m}); // pseudolosowa z czasu zdarzenia\n`;
        }
    },
    'polacz_teksty': {
        icon: '🔗', kat: 'wyrazenia',
        name: 'połącz teksty [a] i [b]',
        params: [
            { name: 'a', label: 'Tekst A', type: 'text', default: 'Witaj, ' },
            { name: 'b', label: 'Tekst B', type: 'text', default: 'Bursztynie!' }
        ],
        emit: (p, ev) => {
            const U = blkUid(ev);
            return `{ char bufor_${U}[256] = {0}; unsigned i_${U} = 0;\n  const char* pa_${U} = "${escapeCppString(p.a)}";\n  while (pa_${U}[i_${U}] && i_${U} < 126) { bufor_${U}[i_${U}] = pa_${U}[i_${U}]; ++i_${U}; }\n  const char* pb_${U} = "${escapeCppString(p.b)}";\n  unsigned j_${U} = 0;\n  while (pb_${U}[j_${U}] && i_${U} < 254) { bufor_${U}[i_${U}++] = pb_${U}[j_${U}++]; }\n  bufor_${U}[i_${U}] = '\\0';\n  wypisz(bufor_${U}); wypisz("\\n"); }`;
        }
    },

    /* ---------------------------- ZMIENNE ------------------------------ */
    'zmienna_liczba': {
        icon: '🔢', kat: 'zmienne',
        name: 'utwórz zmienną liczbową',
        params: [
            { name: 'nazwa', label: 'Nazwa', type: 'text', default: 'punkty' },
            { name: 'wartosc', label: 'Wartość początkowa', type: 'number', default: 0 }
        ],
        emit: p => `int ${cppVar(p.nazwa)} = ${intParam(p.wartosc)};\n`
    },
    'zmienna_tekst': {
        icon: '🔤', kat: 'zmienne',
        name: 'utwórz zmienną tekstową',
        params: [
            { name: 'nazwa', label: 'Nazwa', type: 'text', default: 'imie' },
            { name: 'tekst', label: 'Tekst', type: 'text', default: 'Bursztyn' }
        ],
        emit: p => `char ${cppVar(p.nazwa)}[256] = "${escapeCppString(p.tekst)}";\n`
    },
    'lista_liczb': {
        icon: '📜', kat: 'zmienne',
        name: 'utwórz listę liczb',
        params: [
            { name: 'nazwa', label: 'Nazwa listy', type: 'text', default: 'wyniki' },
            { name: 'rozmiar', label: 'Rozmiar (max)', type: 'number', default: 32 }
        ],
        emit: (p, ev) => {
            const safe = cppVar(p.nazwa);
            const n = Math.min(4096, Math.max(1, intParam(p.rozmiar, 32)));
            return `int ${safe}[${n}] = {0};\nint ${safe}_licznik = 0; // ile elementów dodano\n`;
        }
    },

    /* -------------------------- MOJE BLOKI ----------------------------- */
    'funkcja': {
        icon: '🟥', kat: 'moje', wrap: 'open',
        name: 'zdefiniuj własną funkcję [nazwa]',
        params: [{ name: 'nazwa', label: 'Nazwa funkcji', type: 'text', default: 'mojaFunkcja' }],
        emit: p => `auto fn_${cppVar(p.nazwa)} = [&]() -> void {\n`
    },
    'wywolaj_funkcje': {
        icon: '📣', kat: 'moje',
        name: 'wywołaj funkcję [nazwa]',
        params: [{ name: 'nazwa', label: 'Nazwa funkcji', type: 'text', default: 'mojaFunkcja' }],
        emit: p => `fn_${cppVar(p.nazwa)}();\n`
    },

    /* ----------------------------- RUCH --------------------------------- */
    'przesun_okno_o': {
        icon: '↗️', kat: 'ruch',
        name: 'przesuń okno o dx dy',
        params: [
            { name: 'dx', label: 'dx', type: 'number', default: 10 },
            { name: 'dy', label: 'dy', type: 'number', default: 0 }
        ],
        emit: p => `{ int r_dx = ${intParam(p.dx)}; int r_dy = ${intParam(p.dy)};\n  WIN_X += r_dx; WIN_Y += r_dy;\n  ogranicz_pozycje_okna(&WIN_X, &WIN_Y);\n  bws_przesun_warstwe(WIN_X, WIN_Y); gui_odswiez(); }`
    },
    'ustal_pozycje_okna': {
        icon: '📍', kat: 'ruch',
        name: 'ustaw pozycję okna x y',
        params: [
            { name: 'x', label: 'Nowe X', type: 'number', default: 100 }, { name: 'y', label: 'Nowe Y', type: 'number', default: 100 }
        ],
        emit: p => `{ WIN_X = ${intParam(p.x)}; WIN_Y = ${intParam(p.y)};\n  ogranicz_pozycje_okna(&WIN_X, &WIN_Y);\n  bws_przesun_warstwe(WIN_X, WIN_Y); gui_odswiez(); }`
    },
    'zmien_rozmiar_okna': {
        icon: '⤢️', kat: 'ruch',
        name: 'zmień rozmiar okna o dw dh',
        params: [
            { name: 'dw', label: 'Δ szerokości', type: 'number', default: 40 }, { name: 'dh', label: 'Δ wysokości', type: 'number', default: 20 }
        ],
        emit: p => `{ WIN_W += ${intParam(p.dw)}; WIN_H += ${intParam(p.dh)};\n  if (WIN_W < 120) WIN_W = 120;\n  if (WIN_H < 80) WIN_H = 80;\n  if (bws_utworz_warstwe(WIN_X, WIN_Y, WIN_W, WIN_H, 10) < 0) gui_zakoncz_aplikacje();\n  redraw = true; pelne_czyszczenie = true; }`
    },

    /* ---------------------------- WYGLĄD -------------------------------- */
    'pokaz_okno': {
        icon: '👁️', kat: 'wyglad',
        name: 'pokaż okno podrzędne/pop-up',
        params: [{ name: 'cel', label: 'Okno', type: 'win', default: '' }],
        emit: p => {
            const t = elements.find(e => String(e.id) === String(p.cel));
            if (!t) return '// cel nie istnieje (usunięto okno?)\n';
            return `widoczne_${cIdent(t)} = true;\nredraw = true; pelne_czyszczenie = true;\n`;
        }
    },
    'ukryj_okno': {
        icon: '🙈', kat: 'wyglad',
        name: 'ukryj okno podrzędne/pop-up',
        params: [{ name: 'cel', label: 'Okno', type: 'win', default: '' }],
        emit: p => {
            const t = elements.find(e => String(e.id) === String(p.cel));
            if (!t) return '// cel nie istnieje\n';
            return `widoczne_${cIdent(t)} = false;\nredraw = true; pelne_czyszczenie = true;\n`;
        }
    }
});

/* Normalizacja: kazda akcja dostaje kategorie (kat) wg mapy lub domyslnie API. */
for (const k in ACTION_TYPES) {
    const a = ACTION_TYPES[k];
    if (!a.kat) a.kat = KEY2KAT[k] || 'api';
    a.key = k;
}

/* =========================================================================
 * OPISY BLOKOW - pokazywane po klikniecu ikony "?" na klocku.
 * Klucz -> tekst wyjasniajacy przeznaczenie i sposob uzycia.
 * ========================================================================= */
const BLOCK_OPIS = {
    /* Ruch */
    przesun_okno_o: 'Przesuwa okno aplikacji o dx pikseli w prawo i dy w dół (wartości ujemne = lewo/góra). Wywołuje BWS 34 i odświeża ekran.',
    ustal_pozycje_okna: 'Umieszcza okno na konkretnej pozycji ekranu. x i y liczone są od lewego górnego rogu pulpitu.',
    zmien_rozmiar_okna: 'Zmienia wymiary okna o podane różnice (dw = szerokość, dh = wysokość). Warstwa tworzona jest na nowo (BWS 33).',
    layer_move: 'Przesuwa warstwę GUI procesu na pozycję x, y (BWS 34).',
    layer_create: 'Tworzy nową warstwę rysowania o podanych wymiarach i z-order (BWS 33).',
    /* Wygląd */
    pokaz_okno: 'Pokazuje ukryte wcześniej okno podrzędne lub pop-up wybrane z listy.',
    ukryj_okno: 'Chowa wskazane okno podrzędne / pop-up. Można je później przywrócić blokiem "pokaż".',
    draw_text: 'Rysuje tekst na warstwie w punkcie (x, y) — wysokość glifu to 16 px (BWS 15).',
    draw_rect: 'Rysuje wypełniony prostokąt: x,y = lewy górny róg, w = szerokość, h = wysokość (BWS 21).',
    clear_area: 'Czyści obszar o podanych współrzędnych (x, y, szerokość, wysokość) — BWS 16.',
    refresh: 'Odświeża warstwy aplikacji na ekranie — wywołaj po rysowaniu (BWS 17).',
    window_minimize: 'Minimalizuje okno aplikacji na pasek (BWS 41).',
    window_maximize: 'Przełącza okno między pełnym ekranem a rozmiarem przywróconym.',
    /* Zdarzenia */
    event_click: 'Skrypt uruchomi się po kliknięciu tego komponentu myszą.',
    event_key: 'Wykonuje zawartość po naciśnięciu klawisza. Wpisz kod ASCII (65=A, 13=Enter), aby reagować tylko na konkretny klawisz; puste = dowolny.',
    event_mousemove: 'Wykonuje się przy KAŻDYM ruchu myszy — idealne do śledzenia kursora, ale częste!',
    event_ppm: 'Reaguje na kliknięcie PRAWYM przyciskiem myszy.',
    event_otworz_plik: 'System przekazuje tu plik otwierany przez skojarzenie (np. dwuklik w menedżerze plików).',
    event_timer: 'Cykliczne tyknięcie zegara systemowego — dobre dla animacji i upływu czasu.',
    /* Kontrola */
    repeat: 'Wykonuje bloki umieszczone wewnątrz DOKŁADNIE N razy (pętla "for"). Bloki wstawiaj między "powtórz" a "koniec".',
    repeat_until: 'Powtarza bloki wewnętrzne dopóki warunek jest FAŁSZYWY. Uwaga: bez bloku "czekaj" w środku zamrozi aplikację!',
    forever: 'Pętla nieskończona — powtarza zawartość bez końca. Ostrożnie: blokuje obsługę pozostałych zdarzeń.',
    if_block: 'Wykonuje zawarte bloki TYLKO wtedy, gdy warunek (wyrażenie C++) jest prawdziwy. Przykład warunku: (punkty > 10)',
    else_block: 'Wstaw zaraz przed "koniec" bloku "jeżeli" — te bloki wykonają się, gdy warunek był fałszywy.',
    koniec: 'Zamyka ostatnio otwarty zakres: pętlę, warunek "jeżeli" albo ciało funkcji.',
    break_loop: 'Natychmiast przerywa bieżącą pętlę i przechodzi za nią.',
    continue_iter: 'Pomija resztę bieżącego obrotu i zaczyna następny obieg pętli.',
    czekaj: 'Wstrzymuje skrypt na około N tyknięć zegara systemowego (odbiera zdarzenia TIMER) — najbliższy odpowiednik "opóźnienia".',
    klonuj: 'Uruchamia NOWY proces z pliku .bur przez loader (BWS 10) — w Bursztynie klonowanie = drugi egzemplarz programu.',
    /* Czujniki */
    nad_prostokatem: 'Sprawdza, czy kursor myszy (mx, my) jest nad prostokątem x/y/w/h. Wynik trafia do zmiennej nad_UID — wpisz ją w warunku "jeżeli".',
    mouse_get: 'Odczytuje aktualną pozycję kursora i stan przycisków do zmiennych lokalnych.',
    key_read: 'Czeka na naciśnięcie klawisza i zwraca znak (blokuje skrypt do wczytania!).',
    get_resolution: 'Zapisuje rozdzielczość ekranu do zmiennych lokalnych (szerokość, wysokość).',
    rtc_time: 'Odczytuje zegar sprzętowy RTC i wypisuje datę z godziną.',
    /* Wyrażenia */
    ustaw_liczbe: 'Nadaje zmiennej całkowitej nową wartość: nazwa = wyrażenie (np. punkty*2+1).',
    dodaj_do: 'Powiększa istniejącą zmienną: nazwa += wyrażenie.',
    losowa: 'Losowa liczba od 0 do zakres-1, wyliczona ze znacznika czasu zdarzenia (pseudolosowa).',
    polacz_teksty: 'Skleja dwa teksty w jeden bufor i wypisuje wynik w konsoli systemowej.',
    cmp_porownaj: 'Porównuje dwie wartości wybranym operatorem (== równe, != różne, > większe, < mniejsze...). Wynik: cmp_UID w warunku "jeżeli".',
    logic_oraz: 'Prawda tylko gdy OBA warunki są spełnione jednocześnie (&&).',
    logic_lub: 'Prawda gdy PRZYNAJMNIEJ JEDEN z warunków jest spełniony (||).',
    logic_nie: 'Odwraca warunek: prawda staje się fałszem i odwrotnie (!).',
    /* Zmienne */
    zmienna_liczba: 'Tworzy zmienną całkowitą widoczną we wszystkich dalszych blokach skryptu.',
    zmienna_tekst: 'Tworzy zmienną tekstową (tablica do 255 znaków + zero kończące).',
    lista_liczb: 'Tworzy listę liczb całkowitych o podanym rozmiarze oraz licznik elementów nazwa_licznik.',
    /* Moje bloki */
    funkcja: 'Definiuje własną funkcję o podanej nazwie — bloki aż do "koniec" stają się jej ciałem. Wywołujesz ją blokiem "wywołaj funkcję".',
    wywolaj_funkcje: 'Wykonuje funkcję zdefiniowaną wcześniej blokiem "zdefiniuj własną funkcję".',
    raw: 'Wkleja dowolny kod C++ bezpośrednio do skryptu — dla zaawansowanych.'
};

for (const k in BLOCK_OPIS) {
    if (ACTION_TYPES[k]) ACTION_TYPES[k].opis = BLOCK_OPIS[k];
}

/* =========================================================================
 * ROZSZERZENIA (przycisk "+ Dodaj rozszerzenie" w lewym dolnym rogu)
 * Wczytywanie dodatkowych zestawow blokow w trakcie pracy.
 * ========================================================================= */
const EXTENSIONS = {
    multimedia: {
        icon: '🎬', name: 'Multimedia (HDA)',
        blocks: {
            media_ton: {
                icon: '🎵', kat: 'dzwiek',
                name: '[ext] odtwórz ton Hz czas',
                params: [{ name: 'hz', label: 'Hz', type: 'number', default: 523 }, { name: 'ms', label: 'ms', type: 'number', default: 250 }],
                emit: p => `bws_dzwiek_test(${Math.min(20000, Math.max(20, intParam(p.hz, 523)))}, ${Math.min(10000, Math.max(1, intParam(p.ms, 250)))});\n`
            },
            media_melodia: {
                icon: '🎼', kat: 'dzwiek',
                name: '[ext] zagraj melodię (Hz:ms,...)',
                params: [{ name: 'nuty', label: 'Nuty np. 880:150,660:150,990:300', type: 'text', default: '880:150,660:150,990:300' }],
                emit: p => {
                    const nuty = String(p.nuty || '').split(',').map(s => s.trim()).filter(Boolean)
                        .map(s => { const [hz, ms] = s.split(':'); return { hz: intParam(hz, 440), ms: intParam(ms, 150) }; })
                        .slice(0, 16);
                    let out = '';
                    nuty.forEach((nt, i) => out += `bws_dzwiek_test(${Math.min(20000, Math.max(20, nt.hz))}, ${Math.min(10000, Math.max(1, nt.ms))});\n`);
                    return out || '// brak poprawnych nut\n';
                }
            }
        }
    },
    rysowanie: {
        icon: '🖌️', name: 'Rysowanie',
        blocks: {
            draw_line_poziom: {
                icon: '➖', kat: 'wyglad',
                name: '[ext] linia pozioma x y długość',
                params: [
                    { name: 'x', label: 'X', type: 'number', default: 10 }, { name: 'y', label: 'Y', type: 'number', default: 50 },
                    { name: 'len', label: 'Długość', type: 'number', default: 120 }, { name: 'color', label: 'Kolor', type: 'color', default: '0xFFFFBF00' }
                ],
                emit: p => `gui_rysuj_prostokat(${intParam(p.x)}, ${intParam(p.y)}, ${Math.max(1, intParam(p.len, 1))}, 1, ${p.color});\ngui_odswiez();\n`
            },
            draw_ramka: {
                icon: '🔲', kat: 'wyglad',
                name: '[ext] ramka x y w h kolor',
                params: [
                    { name: 'x', label: 'X', type: 'number', default: 10 }, { name: 'y', label: 'Y', type: 'number', default: 10 },
                    { name: 'w', label: 'Szerokość', type: 'number', default: 150 }, { name: 'h', label: 'Wysokość', type: 'number', default: 80 },
                    { name: 'color', label: 'Kolor', type: 'color', default: '0xFF0078D7' }
                ],
                emit: p => `{ const int rx = ${intParam(p.x)}, ry = ${intParam(p.y)}, rw = ${intParam(p.w)}, rh = ${intParam(p.h)};\n  gui_rysuj_prostokat(rx, ry, rw, 1, ${p.color});\n  gui_rysuj_prostokat(rx, ry + rh - 1, rw, 1, ${p.color});\n  gui_rysuj_prostokat(rx, ry, 1, rh, ${p.color});\n  gui_rysuj_prostokat(rx + rw - 1, ry, 1, rh, ${p.color});\n  gui_odswiez(); }`
            }
        }
    },
    czas_rozszerzenie: {
        icon: '⏱️', name: 'Czas i RTC',
        blocks: {
            ext_data_godzina: {
                icon: '🕰️', kat: 'czujniki',
                name: '[ext] wypisz aktualną datę i godzinę',
                params: [],
                emit: () => `{ char rtc_ext[32] = {0};\n  if (bws_wywolaj(9, (uint64_t)rtc_ext)) { wypisz(rtc_ext); wypisz("\\n"); } }\n`
            }
        }
    }
};

window.addExtension = function (id) {
    const ext = EXTENSIONS[id];
    if (!ext || ext._loaded) { if (ext) alert('To rozszerzenie jest już wczytane.'); return; }
    Object.assign(ACTION_TYPES, ext.blocks);
    for (const k in ext.blocks) ACTION_TYPES[k].key = k;
    ext._loaded = true;
    if (typeof buildBlocksPalette === 'function') buildBlocksPalette();
    if (typeof renderVisualWorkspace === 'function') renderVisualWorkspace();
};

window.listExtensions = function () {
    return Object.entries(EXTENSIONS).map(([id, e]) => ({ id, icon: e.icon, name: e.name, loaded: !!e._loaded }));
};

/* Domyślny sufix uid dla starych projektow (bez uid) */
function ensureEventUid(ev) {
    if (!ev.uid) ev.uid = Math.random().toString(36).slice(2, 8);
    return ev;
}

Object.assign(window, {
    OS_COLORS, EVENTOWALNE_TYPY, COMPONENT_DB, ACTION_TYPES,
    BLOCK_CATS, KEY2KAT, EXTENSIONS,
    cppVar, blkUid, ensureEventUid
});
