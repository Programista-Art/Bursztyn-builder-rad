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
    'TTrackBar', 'TDateTimePicker', 'TTreeView', 'TListView'
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

Object.assign(window, { OS_COLORS, EVENTOWALNE_TYPY, COMPONENT_DB, ACTION_TYPES });
