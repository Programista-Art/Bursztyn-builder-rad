/* =========================================================================
 * Bursztyn Builder RAD v3.0 - baza wywolan systemowych BWS (Bursztynowe
 * Wywolania Systemowe).
 *
 * Zrodlo prawdy:
 *   - syscalls.cpp      -> dispatcher obsluga_wywolan_systemowych() 1..56
 *   - bursztyn_gui.h    -> wrappery Ring 3 dla aplikacji
 *   - bws_zdarzenia.h   -> typy zdarzen i struktura bws_zdarzenie (40 B)
 *   - bws_pliki.h       -> ABI metadanych, schowka i drag&drop
 *
 * Kazdy wpis: nr, grupa, nazwa, wrapper, opis, prawa, sygnatura, przyklad.
 * ========================================================================= */

/* Typy zdarzen (bws_zdarzenia.h) - wartosci dla pola bws_zdarzenie.typ. */
const BWS_ZDARZENIA = {
    0:  'BRAK',
    1:  'MYSZ_RUCH',
    2:  'MYSZ_DOWN',
    3:  'MYSZ_UP',
    4:  'KLAWISZ',
    5:  'TIMER',
    6:  'FOCUS',
    7:  'BLUR',
    8:  'ZAMKNIJ',
    9:  'OKNO_UTWORZONE',
    10: 'OKNO_POKAZANE',
    11: 'OKNO_ZMINIMALIZOWANE',
    12: 'OKNO_PRZYWROCONE',
    13: 'OKNO_FOCUS',
    14: 'OKNO_ZAMKNIETE',
    15: 'OKNO_TYTUL',
    16: 'OTWORZ_PLIK',
    17: 'DRAG_HOVER',
    18: 'DRAG_LEAVE',
    19: 'DRAG_DROP',
    20: 'MYSZ_PRAWY_DOWN',
    21: 'MYSZ_PRAWY_UP',
    22: 'PLIKI_ZMIENIONE'
};

/* Struktury ABI (bws_zdarzenia.h / bws_pliki.h) - do przegladarki API. */
const BWS_STRUKTURY = [
    {
        nazwa: 'bws_zdarzenie', rozmiar: 40,
        opis: 'Zdarzenie systemowe (ABI stabilne, sizeof == 40).',
        pola: 'typ:u32, x:i32, y:i32, dx:i32, dy:i32, przyciski:u32, kod:u32, timestamp:u64'
    },
    {
        nazwa: 'BwsMetadanePliku', rozmiar: 24,
        opis: 'Metadane tworu PSF (BWS 47). Flagi: 1=ROZMIAR, 2=CZAS, 4=PZB.',
        pola: 'wersja:u16, flagi:u16, typ:u8, poziom_pzb:u8, zarezerwowane:u16, rozmiar:u64, czas_utworzenia_rtc:u64'
    },
    {
        nazwa: 'BwsCelDrop', rozmiar: 528,
        opis: 'Obszar-docelowy drag&drop (BWS 49), maks. 32 cele na proces.',
        pola: 'x:i32, y:i32, szer:i32, wys:i32, folder:char[512]'
    },
    {
        nazwa: 'BwsSchowekPlikow', rozmiar: 528,
        opis: 'Bezplikowy schowek plikow (BWS 52..55). Operacja: 0=pusty, 1=kopiuj, 2=wytnij.',
        pola: 'wersja:u16, operacja:u8, typ:u8, zarezerwowane:u32, generacja:u64, sciezka:char[512]'
    },
    {
        nazwa: 'GuiOknoInfo', rozmiar: null,
        opis: 'Snapshot okna ze skladacza (BWS 42, skladacz_obrazu.h).',
        pola: '(zdefiniowany w skladacz_obrazu.h)'
    }
];

const BWS_SYSCALLS = [
    /* ------------------------- Terminal -------------------------------- */
    {
        nr: 1, grupa: 'Terminal', nazwa: 'bws_wypisz',
        wrapper: 'void wypisz(const char* tekst)',
        prawa: '—',
        opis: 'Wypisuje tekst na ekranie tekstowym (konsola systemowa).',
        sygnatura: 'uint64_t bws_wywolaj(1, (uint64_t)tekst)',
        przyklad: `wypisz("Witaj w Bursztyn OS!\\n");`
    },
    {
        nr: 4, grupa: 'Terminal', nazwa: 'pobierz_znak',
        wrapper: 'char pobierz_znak()',
        prawa: '—',
        opis: 'Blokuje proces do nacisniecia klawisza i zwraca znak.',
        sygnatura: 'uint64_t kod = bws_wywolaj(4)',
        przyklad: `char c = pobierz_znak();\nwypisz("Nacisnales: ");\nwypisz((const char[]){c, '\\0'});`
    },

    /* ---------------------------- Pliki -------------------------------- */
    {
        nr: 2, grupa: 'Pliki', nazwa: 'utworz_plik',
        wrapper: 'bool utworz(const char* sciezka)',
        prawa: 'PRAWO_PLIKI_ZAPISZ',
        opis: 'Tworzy pusty plik PSF. Kontrola PZB i sciezek chronionych (/system, /jadro).',
        sygnatura: 'uint64_t ok = bws_wywolaj(2, (uint64_t)sciezka)',
        przyklad: `if (!utworz("/dane/wyniki.txt")) wypisz("Blad tworzenia\\n");`
    },
    {
        nr: 3, grupa: 'Pliki', nazwa: 'zapisz_plik',
        wrapper: 'bool zapisz_plik(const char* s, const char* dane, uint32_t dlugosc)',
        prawa: 'PRAWO_PLIKI_ZAPISZ',
        opis: 'Nadpisuje cala zawartosc pliku danymi z bufora Ring 3.',
        sygnatura: 'uint64_t ok = bws_wywolaj(3, sciezka, dane, dlugosc)',
        przyklad: `{ static const char tresc[] = "Hello\\n"; zapisz_plik("/dane/log.txt", tresc, (uint32_t)(sizeof(tresc)-1)); }`
    },
    {
        nr: 5, grupa: 'Pliki', nazwa: 'czytaj_plik',
        wrapper: 'bool czytaj_plik(const char* s, char* bufor, uint32_t max)',
        prawa: 'PRAWO_PLIKI_CZYTAJ',
        opis: 'Czyta zawartosc pliku do bufora uzytkownika (do min(rozm, max)).',
        sygnatura: 'uint64_t ok = bws_wywolaj(5, sciezka, bufor, max)',
        przyklad: `{ char bufor[256] = {0}; if (czytaj_plik("/dane/config.txt", bufor, sizeof(bufor))) { /* bufor = tresc */ } }`
    },
    {
        nr: 6, grupa: 'Pliki', nazwa: 'wylistuj_katalog',
        wrapper: 'bool wylistuj_katalog_uzytkownika(const char* s, char* bufor, uint32_t max)',
        prawa: 'PRAWO_PLIKI_CZYTAJ',
        opis: 'Lista wpisow w formacie "[KAT] nazwa" / "[PLIK] nazwa" po jednej linii.',
        sygnatura: 'uint64_t ok = bws_wywolaj(6, sciezka, bufor, max)',
        przyklad: `{ char lista[2048] = {0}; if (wylistuj_katalog_uzytkownika("/dane", lista, sizeof(lista))) { /* parsuj linie */ } }`
    },
    {
        nr: 7, grupa: 'Pliki', nazwa: 'usun_twor',
        wrapper: 'bool usun_twor_uzytkownika(const char* sciezka)',
        prawa: 'PRAWO_PLIKI_ZAPISZ',
        opis: 'Usuwa plik albo katalog (rekurencyjnie wg PSF).',
        sygnatura: 'uint64_t ok = bws_wywolaj(7, (uint64_t)sciezka)',
        przyklad: `usun_twor_uzytkownika("/dane/stary.txt");`
    },
    {
        nr: 8, grupa: 'Pliki', nazwa: 'zmien_nazwe',
        wrapper: 'bool zmien_nazwe_uzytkownika(const char* s, const char* nowa_nazwa)',
        prawa: 'PRAWO_PLIKI_ZAPISZ',
        opis: 'Zmienia nazwe tworu (nowa_nazwa to sama nazwa, bez sciezki).',
        sygnatura: 'uint64_t ok = bws_wywolaj(8, sciezka, nowa_nazwa)',
        przyklad: `zmien_nazwe_uzytkownika("/dane/dane.txt", "archiwum.txt");`
    },
    {
        nr: 44, grupa: 'Pliki', nazwa: 'rozmiar_pliku',
        wrapper: 'bool pobierz_rozmiar_pliku(const char* s, uint32_t* rozmiar)',
        prawa: 'PRAWO_PLIKI_CZYTAJ',
        opis: 'Zwraca rozmiar pliku bez kopiowania danych. Syscall zwraca rozmiar+1; 0 oznacza blad.',
        sygnatura: 'uint64_t wynik = bws_wywolaj(44, (uint64_t)sciezka)',
        przyklad: `{ uint32_t rozm = 0; if (pobierz_rozmiar_pliku("/dane/big.bin", &rozm)) { /* rozm bajtow */ } }`
    },
    {
        nr: 46, grupa: 'Pliki', nazwa: 'utworz_katalog',
        wrapper: 'bool utworz_katalog_uzytkownika(const char* sciezka)',
        prawa: 'PRAWO_PLIKI_ZAPISZ',
        opis: 'Tworzy katalog z etykieta PZB dziedziczona z poziomu procesu.',
        sygnatura: 'uint64_t ok = bws_wywolaj(46, (uint64_t)sciezka)',
        przyklad: `utworz_katalog_uzytkownika("/dane/kopie");`
    },
    {
        nr: 47, grupa: 'Pliki', nazwa: 'metadane',
        wrapper: 'bool pobierz_metadane_pliku(const char* s, BwsMetadanePliku* meta)',
        prawa: 'PRAWO_PLIKI_CZYTAJ',
        opis: 'Pobiera metadane PSF: typ, rozmiar, czas UTC (YYYYMMDDhhmmss), poziom PZB.',
        sygnatura: 'uint64_t ok = bws_wywolaj(47, sciezka, (uint64_t)&meta)',
        przyklad: `{ BwsMetadanePliku m = {}; if (pobierz_metadane_pliku("/dane/plik.txt", &m)) { /* m.rozmiar, m.typ */ } }`
    },
    {
        nr: 48, grupa: 'Pliki', nazwa: 'przenies_twor',
        wrapper: 'bool przenies_twor_uzytkownika(const char* s, const char* folder_docel)',
        prawa: 'PRAWO_PLIKI_ZAPISZ',
        opis: 'Przenosi twor do innego folderu (bez zmiany nazwy).',
        sygnatura: 'uint64_t ok = bws_wywolaj(48, sciezka, folder)',
        przyklad: `przenies_twor_uzytkownika("/dane/a.txt", "/kopie");`
    },
    {
        nr: 55, grupa: 'Pliki', nazwa: 'kopiuj_twor',
        wrapper: 'bool kopiuj_twor_uzytkownika(const char* s, const char* folder_docel)',
        prawa: 'PRAWO_PLIKI_CZYTAJ+ZAPISZ',
        opis: 'Kopiuje twor do folderu docelowego z kontrola PZB.',
        sygnatura: 'uint64_t ok = bws_wywolaj(55, sciezka, folder)',
        przyklad: `kopiuj_twor_uzytkownika("/dane/a.txt", "/kopie");`
    },
    {
        nr: 10, grupa: 'Pliki', nazwa: 'uruchom_program',
        wrapper: 'bool uruchom_program_uzytkownika(const char* sciezka)',
        prawa: 'PRAWO_URUCHOM_PROGRAM',
        opis: 'Uruchamia program .bur przez loader. Dziecko nigdy nie dostaje szerszych praw niz rodzic.',
        sygnatura: 'uint64_t ok = bws_wywolaj(10, sciezka, argument_lub_0)',
        przyklad: `uruchom_program_z_argumentem_uzytkownika("/programy/notatnik.cebula/notatnik.bur", "/dane/notatka.txt");`
    },
    {
        nr: 45, grupa: 'Pliki', nazwa: 'argument_startowy',
        wrapper: 'bool pobierz_argument_startowy(char* bufor, uint32_t pojemnosc)',
        prawa: '—',
        opis: 'Argument przekazany przy starcie (tez przy zdarzeniu OTWORZ_PLIK - pobierz ponownie).',
        sygnatura: 'uint64_t ok = bws_wywolaj(45, (uint64_t)bufor, pojemnosc)',
        przyklad: `{ char arg[256] = {0}; if (pobierz_argument_startowy(arg, sizeof(arg))) { /* arg */ } }`
    },

    /* ------------------------------ RTC -------------------------------- */
    {
        nr: 9, grupa: 'System', nazwa: 'rtc_czas',
        wrapper: '(brak - tylko bws_wywolaj)',
        prawa: '—',
        opis: 'Zapisuje do bufora (min. 32 B) czas RTC jako tekst.',
        sygnatura: 'uint64_t ok = bws_wywolaj(9, (uint64_t)bufor)',
        przyklad: `{ char czas[32] = {0}; if (bws_wywolaj(9, (uint64_t)czas)) wypisz(czas); }`
    },

    /* ------------------------------- GUI ------------------------------- */
    {
        nr: 14, grupa: 'GUI', nazwa: 'rysuj_okno',
        wrapper: 'void gui_rysuj_okno(int x, int y, int w, int h, const char* tytul)',
        prawa: 'PRAWO_GUI',
        opis: 'Rysuje ramke okna na warstwie procesu (tytul <= 63 znaki).',
        sygnatura: 'arg1=(x<<32)|y, arg2=(w<<32)|h, arg3=tytul',
        przyklad: `gui_rysuj_okno(WIN_X, WIN_Y, WIN_W, WIN_H, "Moje okno");`
    },
    {
        nr: 15, grupa: 'GUI', nazwa: 'wypisz_tekst',
        wrapper: 'void gui_wypisz_tekst(int x, int y, const char* tekst)',
        prawa: 'PRAWO_GUI',
        opis: 'Wypisuje tekst na warstwie GUI (skala 1, kolor domyslny).',
        sygnatura: 'bws_wywolaj(15, x, y, (uint64_t)tekst)',
        przyklad: `gui_wypisz_tekst(20, 40, "Tekst");`
    },
    {
        nr: 20, grupa: 'GUI', nazwa: 'wypisz_tekst_kolor',
        wrapper: 'void gui_wypisz_tekst_kolor_skala(int x, int y, uint32_t kolor, int skala, const char* t)',
        prawa: 'PRAWO_GUI',
        opis: 'Tekst z kolorem 0xAARRGGBB i skala (int). Wysokosc glifu to 16 px (BWS 51).',
        sygnatura: 'bws_wywolaj(20, x, y, kolor_skala, (uint64_t)tekst)',
        przyklad: `gui_wypisz_tekst_kolor_skala(20, 60, 0xFFFFBF00, 2, "Duzy bursztynowy tekst");`
    },
    {
        nr: 21, grupa: 'GUI', nazwa: 'rysuj_prostokat',
        wrapper: 'void gui_rysuj_prostokat(int x, int y, int szer, int wys, uint32_t kolor)',
        prawa: 'PRAWO_GUI',
        opis: 'Wypelniony prostokat kolorem 0xAARRGGBB.',
        sygnatura: 'arg1=(x<<32)|y, arg2=(w<<32)|h, arg3=kolor',
        przyklad: `gui_rysuj_prostokat(10, 10, 200, 100, 0xFF0078D7);`
    },
    {
        nr: 16, grupa: 'GUI', nazwa: 'wyczysc_obszar',
        wrapper: 'void gui_wyczyscz_obszar(int x, int y, int w, int h)',
        prawa: 'PRAWO_GUI',
        opis: 'Czyści obszar warstwy (wypelnia przezroczystym).',
        sygnatura: 'bws_wywolaj(16, x, y, w, h)',
        przyklad: `gui_wyczyscz_obszar(0, 0, WIN_W, WIN_H);`
    },
    {
        nr: 17, grupa: 'GUI', nazwa: 'odswiez',
        wrapper: 'void gui_odswiez()',
        prawa: 'PRAWO_GUI',
        opis: 'Odswieza warstwy procesu na ekranie.',
        sygnatura: 'bws_wywolaj(17)',
        przyklad: `RysujInterfejs(false); // konczy sie gui_odswiez()`
    },
    {
        nr: 19, grupa: 'GUI', nazwa: 'odswiez_pulpit',
        wrapper: 'void gui_odswiez_pulpit()',
        prawa: 'PRAWO_GUI',
        opis: 'Pelne przemalowanie pulpitu pod warstwa aplikacji (po przesunieciu/zmianie rozmiaru).',
        sygnatura: 'bws_wywolaj(19)',
        przyklad: `gui_odswiez_pulpit();`
    },
    {
        nr: 23, grupa: 'GUI', nazwa: 'rozdzielczosc',
        wrapper: 'void gui_pobierz_rozdzielczosc(int* w, int* h)',
        prawa: 'PRAWO_GUI',
        opis: 'Aktualna rozdzielczosc ekranu.',
        sygnatura: 'bws_wywolaj(23, (uint64_t)&w, (uint64_t)&h)',
        przyklad: `{ int sw = 0, sh = 0; gui_pobierz_rozdzielczosc(&sw, &sh); }`
    },
    {
        nr: 24, grupa: 'GUI', nazwa: 'szerokosc_znaku',
        wrapper: 'int gui_pobierz_szerokosc_znaku(uint32_t znak)',
        prawa: 'PRAWO_GUI',
        opis: 'Szerokosc glifu Unicode w px (do centrowania tekstu).',
        sygnatura: 'uint64_t szer = bws_wywolaj(24, unicode)',
        przyklad: `int szer = gui_pobierz_szerokosc_znaku('A');`
    },
    {
        nr: 51, grupa: 'GUI', nazwa: 'wysokosc_fontu',
        wrapper: 'int gui_pobierz_wysokosc_fontu()',
        prawa: 'PRAWO_GUI',
        opis: 'Zawsze 16 - font extronic16B ma glify 16 wierszy.',
        sygnatura: 'bws_wywolaj(51) -> 16',
        przyklad: `int h_fontu = gui_pobierz_wysokosc_fontu(); // 16`
    },
    {
        nr: 33, grupa: 'GUI', nazwa: 'utworz_warstwe',
        wrapper: 'int bws_utworz_warstwe(int x, int y, int szer, int wys, int z_order)',
        prawa: 'PRAWO_GUI',
        opis: 'Tworzy warstwe procesu; syscall zwraca id+1 (0 = blad), wrapper id lub -1. Wysyla OKNO_UTWORZONE.',
        sygnatura: 'arg1=(x<<32)|y, arg2=(w<<32)|h, arg3=z_order',
        przyklad: `if (bws_utworz_warstwe(WIN_X, WIN_Y, WIN_W, WIN_H, 10) < 0) gui_zakoncz_aplikacje();`
    },
    {
        nr: 34, grupa: 'GUI', nazwa: 'przesun_warstwe',
        wrapper: 'void bws_przesun_warstwe(int nowy_x, int nowy_y)',
        prawa: 'PRAWO_GUI',
        opis: 'Przesuwa warstwe biezacego procesu (drag okna).',
        sygnatura: 'bws_wywolaj(34, x, y)',
        przyklad: `bws_przesun_warstwe(WIN_X, WIN_Y);`
    },
    {
        nr: 56, grupa: 'GUI', nazwa: 'popup_aplikacji',
        wrapper: 'bool gui_ustaw_popup_aplikacji(bool otwarty, int x, int y, int szer, int wys)',
        prawa: 'PRAWO_GUI',
        opis: 'Popup skladany nad zwyklymi oknami, ale pod menu systemowym. Tylko gdy okno aktywne.',
        sygnatura: 'arg1=bool, arg2=(x<<32)|y, arg3=(w<<32)|h',
        przyklad: `gui_ustaw_popup_aplikacji(true, mx, my, 160, 80);`
    },

    /* -------------------------- Warstwy/okna --------------------------- */
    {
        nr: 41, grupa: 'Warstwy i okna', nazwa: 'minimalizuj_okno',
        wrapper: 'bool gui_minimalizuj_okno()',
        prawa: 'PRAWO_GUI',
        opis: 'Minimalizuje warstwe aplikacji; true = zminimalizowano.',
        sygnatura: 'bws_wywolaj(41)',
        przyklad: `aplikacja_zminimalizowana = gui_minimalizuj_okno();`
    },
    {
        nr: 42, grupa: 'Warstwy i okna', nazwa: 'lista_okien',
        wrapper: 'uint32_t gui_pobierz_okna(GuiOknoInfo* okna, uint32_t max)',
        prawa: 'PZB_ZAUFANE+CONFIG',
        opis: 'Snapshot metadanych okien ze skladacza (maks. SKLADACZ_MAKS_WARSTW).',
        sygnatura: 'bws_wywolaj(42, (uint64_t)bufor, max)',
        przyklad: `{ GuiOknoInfo okna[16] = {}; uint32_t ile = gui_pobierz_okna(okna, 16); }`
    },
    {
        nr: 43, grupa: 'Warstwy i okna', nazwa: 'aktywuj_okno',
        wrapper: 'bool gui_aktywuj_okno(uint64_t window_id)',
        prawa: 'PZB_ZAUFANE+CONFIG',
        opis: 'Aktywuje (podnosi i focusuje) okno o podanym id.',
        sygnatura: 'bws_wywolaj(43, window_id)',
        przyklad: `gui_aktywuj_okno(id_okna);`
    },
    {
        nr: 40, grupa: 'Warstwy i okna', nazwa: 'overlay_systemowy',
        wrapper: 'void gui_ustaw_system_overlay(bool otwarty, int x, int y, int w, int h)',
        prawa: 'PZB_ZAUFANE+CONFIG+GUI',
        opis: 'Rezerwuje obszar nad wszystkimi oknami (menu Start itp.).',
        sygnatura: 'arg1=bool, arg2=(x<<32)|y, arg3=(w<<32)|h',
        przyklad: `gui_ustaw_system_overlay(true, 0, 0, screen_w, 32);`
    },
    {
        nr: 36, grupa: 'Warstwy i okna', nazwa: 'powloka_zamknieta',
        wrapper: '(brak - tylko bws_wywolaj)',
        prawa: '—',
        opis: 'Zwraca 1, gdy uzytkownik zamknal powloke systemowa.',
        sygnatura: 'uint64_t stan = bws_wywolaj(36)',
        przyklad: `bool zamknieta = (bws_wywolaj(36) != 0);`
    },

    /* ------------------------------- Mysz ------------------------------ */
    {
        nr: 18, grupa: 'Wejście', nazwa: 'pobierz_mysz',
        wrapper: 'void gui_pobierz_mysz(int* x, int* y, uint8_t* przyciski)',
        prawa: 'PRAWO_GUI',
        opis: 'Pozycja kursora i maska przyciskow (bit0=LPM, bit1=PPM).',
        sygnatura: 'bws_wywolaj(18, (uint64_t)&x, (uint64_t)&y, (uint64_t)&przyciski)',
        przyklad: `{ int mx=0,my=0; uint8_t mb=0; gui_pobierz_mysz(&mx,&my,&mb); }`
    },
    {
        nr: 22, grupa: 'Wejście', nazwa: 'przejecie_myszy',
        wrapper: 'void gui_ustaw_przejecie_myszy(bool stan)',
        prawa: 'PRAWO_GUI',
        opis: 'Przejmuje mysz przez warstwy procesu (interakcja z pulpitem).',
        sygnatura: 'bws_wywolaj(22, stan ? 1 : 0)',
        przyklad: `gui_ustaw_przejecie_myszy(true);`
    },
    {
        nr: 39, grupa: 'Wejście', nazwa: 'capture_myszy',
        wrapper: 'void gui_ustaw_capture_myszy(bool stan)',
        prawa: 'PRAWO_GUI',
        opis: 'Capture myszy dla procesu (np. podczas przciagania belki).',
        sygnatura: 'bws_wywolaj(39, stan ? 1 : 0)',
        przyklad: `gui_ustaw_capture_myszy(true);`
    },

    /* ----------------------------- Zdarzenia ---------------------------- */
    {
        nr: 37, grupa: 'Wejście', nazwa: 'pobierz_zdarzenie',
        wrapper: 'bool gui_pobierz_zdarzenie(bws_zdarzenie* z)',
        prawa: 'PRAWO_GUI',
        opis: 'Nieblokujace pobranie zdarzenia z kolejki procesu (40 B).',
        sygnatura: 'bws_wywolaj(37, (uint64_t)&zdarzenie)',
        przyklad: `{ bws_zdarzenie z{}; while (gui_pobierz_zdarzenie(&z)) { /* obsluz */ } }`
    },
    {
        nr: 38, grupa: 'Wejście', nazwa: 'czekaj_na_zdarzenie',
        wrapper: 'bool gui_czekaj_na_zdarzenie(bws_zdarzenie* z)',
        prawa: 'PRAWO_GUI',
        opis: 'Blokuje proces do nastepnego zdarzenia (oszczedza CPU).',
        sygnatura: 'bws_wywolaj(38, (uint64_t)&zdarzenie)',
        przyklad: `{ bws_zdarzenie z{}; if (!gui_czekaj_na_zdarzenie(&z)) continue; }`
    },

    /* ------------------------------ Dźwięk ------------------------------ */
    {
        nr: 27, grupa: 'Dźwięk', nazwa: 'dzwiek_hda',
        wrapper: 'void bws_dzwiek_test(uint32_t czestotliwosc, uint32_t czas_ms)',
        prawa: 'PRAWO_GUI',
        opis: 'Ton testowy HDA. Hz 20..20000, czas 1..10000 ms.',
        sygnatura: 'uint64_t ok = bws_wywolaj(27, hz, ms)',
        przyklad: `bws_dzwiek_test(880, 500);`
    },

    /* ------------------------------- Sieć ------------------------------- */
    {
        nr: 11, grupa: 'Sieć', nazwa: 'ping_icmp',
        wrapper: '(brak - tylko bws_wywolaj)',
        prawa: 'PRAWO_SIEC',
        opis: 'Ping ICMP; zwraca czas odpowiedzi w ms (0 = brak odpowiedzi/blad).',
        sygnatura: 'bws_wywolaj(11, ip1, ip2, ip3, ip4)',
        przyklad: `uint64_t ping_ms = bws_wywolaj(11, 8, 8, 8, 8);`
    },
    {
        nr: 28, grupa: 'Sieć', nazwa: 'dns',
        wrapper: 'bool bws_siec_dns(const char* domena, uint8_t* wyjsciowe_ip)',
        prawa: 'PRAWO_SIEC',
        opis: 'Rozwiazuje domene do 4 bajtow IPv4. (BWS 12 to legacy alias.)',
        sygnatura: 'bws_wywolaj(28, domena, (uint64_t)ip)',
        przyklad: `{ uint8_t ip[4] = {0}; if (bws_siec_dns("example.com", ip)) { /* ip[0..3] */ } }`
    },
    {
        nr: 29, grupa: 'Sieć', nazwa: 'http_get',
        wrapper: 'bool bws_siec_pobierz_http(uint8_t* ip, const char* domena, const char* sciezka, char* bufor, uint32_t max)',
        prawa: 'PRAWO_SIEC',
        opis: 'Pobieranie HTTP do bufora (maks. 256 KiB, dolne 4 GiB VA).',
        sygnatura: 'arg4=(adres32<<32)|rozmiar',
        przyklad: `{ uint8_t ip[4] = {93,184,216,34}; char odp[4096] = {0}; if (bws_siec_pobierz_http(ip, "example.com", "/", odp, sizeof(odp)-1)) { /* odp */ } }`
    },
    {
        nr: 30, grupa: 'Sieć', nazwa: 'https_get',
        wrapper: 'bool bws_siec_pobierz_https(uint8_t* ip, const char* domena, const char* sciezka, char* bufor, uint32_t max)',
        prawa: 'PRAWO_SIEC',
        opis: 'Pobieranie HTTPS (TLS) - te same ograniczenia bufora co HTTP.',
        sygnatura: 'arg4=(adres32<<32)|rozmiar',
        przyklad: `{ uint8_t ip[4] = {93,184,216,34}; char odp[4096] = {0}; if (bws_siec_pobierz_https(ip, "example.com", "/", odp, sizeof(odp)-1)) { /* odp */ } }`
    },
    {
        nr: 31, grupa: 'Sieć', nazwa: 'tls_zaufany',
        wrapper: 'bool bws_tls_certyfikat_zaufany()',
        prawa: 'PRAWO_SIEC',
        opis: 'Czy certyfikat serwera TLS zostal zweryfikowany jako zaufany.',
        sygnatura: 'bws_wywolaj(31)',
        przyklad: `bool zaufany = bws_tls_certyfikat_zaufany();`
    },
    {
        nr: 12, grupa: 'Sieć', nazwa: 'dns_legacy',
        wrapper: 'bool bws_siec_dns(const char* domena, uint8_t* wyjsciowe_ip)',
        prawa: 'PRAWO_SIEC',
        opis: 'Legacy alias DNS - zachowany dla starych .bur. Preferuj BWS 28.',
        sygnatura: 'bws_wywolaj(12, domena, (uint64_t)ip)',
        przyklad: `{ uint8_t ip[4] = {0}; if (bws_siec_dns("example.com", ip)) { /* ip[0..3] */ } }`
    },
    {
        nr: 13, grupa: 'Sieć', nazwa: 'http_do_pliku',
        wrapper: '(legacy - preferuj BWS 29 + zapisz_plik)',
        prawa: 'SIEC+PLIKI_ZAPISZ',
        opis: 'Legacy: pobiera HTTP i od razu zapisuje do pliku (bufor 64 KiB).',
        sygnatura: 'bws_wywolaj(13, ip, domena, sciezka_http, sciezka_dysku)',
        przyklad: `// Legacy BWS 13 - zachowane dla starych .bur\n// Nowy kod: bws_siec_pobierz_http(...) + zapisz_plik(...)`
    },

    /* ------------------------------ Zasilanie --------------------------- */
    {
        nr: 25, grupa: 'System', nazwa: 'restart_systemu',
        wrapper: '(brak - tylko bws_wywolaj)',
        prawa: 'PZB_ZAUFANE+CONFIG',
        opis: 'Restart: najpierw ACPI, potem fallback kontrolera 8042.',
        sygnatura: 'bws_wywolaj(25)',
        przyklad: `bws_wywolaj(25); // nie wraca`
    },
    {
        nr: 26, grupa: 'System', nazwa: 'wylacz_system',
        wrapper: '(brak - tylko bws_wywolaj)',
        prawa: 'PZB_ZAUFANE+CONFIG',
        opis: 'Wyłączenie przez ACPI (fallback QEMU tylko w buildach dev).',
        sygnatura: 'bws_wywolaj(26)',
        przyklad: `bws_wywolaj(26); // nie wraca`
    },

    /* ------------------------------- Proces ----------------------------- */
    {
        nr: 32, grupa: 'Proces', nazwa: 'zakoncz_proces',
        wrapper: '__attribute__((noreturn)) void gui_zakoncz_aplikacje()',
        prawa: '—',
        opis: 'Usuwa warstwy, zamyka okno, sprzata stan GUI i konczy proces.',
        sygnatura: 'bws_wywolaj(32); // noreturn',
        przyklad: `gui_zakoncz_aplikacje();`
    },
    {
        nr: 35, grupa: 'Proces', nazwa: 'alokuj_sterte',
        wrapper: 'void* gui_malloc(unsigned long rozmiar) / void gui_free(void*)',
        prawa: '—',
        opis: 'Prywatna sterta Ring 3: baza 0x800000000, limit 256 MiB, maks. 16 MiB na jedno wywolanie. Rozmiar zaokraglany do strony 4 KiB.',
        sygnatura: 'uint64_t adres = bws_wywolaj(35, rozmiar)',
        przyklad: `{ void* pamiec = gui_malloc(65536); if (pamiec) { /* uzywaj */ gui_free(pamiec); } }`
    },

    /* --------------------- Schowek i Drag&Drop -------------------------- */
    {
        nr: 52, grupa: 'Schowek i Drag&Drop', nazwa: 'schowek_ustaw',
        wrapper: 'bool ustaw_schowek_plikow(const char* sciezka, BwsOperacjaSchowka op)',
        prawa: 'PLIKI_CZYTAJ(+ZAPISZ)',
        opis: 'Ustawia schowek plikow: BWS_SCHOWEK_COPY=1 albo BWS_SCHOWEK_CUT=2. Zwieksza generacje.',
        sygnatura: 'bws_wywolaj(52, sciezka, operacja)',
        przyklad: `ustaw_schowek_plikow("/dane/a.txt", BWS_SCHOWEK_COPY);`
    },
    {
        nr: 53, grupa: 'Schowek i Drag&Drop', nazwa: 'schowek_pobierz',
        wrapper: 'bool pobierz_schowek_plikow(BwsSchowekPlikow* schowek)',
        prawa: 'PRAWO_PLIKI_CZYTAJ',
        opis: 'Odczyt schowka (528 B): operacja, typ, generacja, sciezka.',
        sygnatura: 'bws_wywolaj(53, (uint64_t)&schowek)',
        przyklad: `{ BwsSchowekPlikow s = {}; if (pobierz_schowek_plikow(&s) && s.operacja != BWS_SCHOWEK_PUSTY) { /* s.sciezka */ } }`
    },
    {
        nr: 54, grupa: 'Schowek i Drag&Drop', nazwa: 'schowek_wyczysc',
        wrapper: 'bool wyczysc_schowek_plikow(uint64_t oczekiwana_generacja)',
        prawa: 'PRAWO_PLIKI_CZYTAJ',
        opis: 'Kasuje schowek tylko gdy generacja pasuje (ochrona przed wyścigiem).',
        sygnatura: 'bws_wywolaj(54, generacja)',
        przyklad: `wyczysc_schowek_plikow(s.generacja);`
    },
    {
        nr: 49, grupa: 'Schowek i Drag&Drop', nazwa: 'rejestruj_cele_drop',
        wrapper: 'bool gui_rejestruj_cele_drop(const BwsCelDrop* cele, uint32_t liczba)',
        prawa: 'GUI+PLIKI_CZYTAJ',
        opis: 'Rejestruje do 32 obszarow drop (folder docelowy musi istniec). Rejestracja wygasa po 1000 tickach.',
        sygnatura: 'bws_wywolaj(49, (uint64_t)cele, liczba)',
        przyklad: `{ BwsCelDrop cel = {}; cel.x = 20; cel.y = 40; cel.szer = 120; cel.wys = 90;\n  __builtin_memcpy(cel.folder, "/dane", sizeof("/dane"));\n  gui_rejestruj_cele_drop(&cel, 1); }`
    },
    {
        nr: 50, grupa: 'Schowek i Drag&Drop', nazwa: 'aktualizuj_drag',
        wrapper: 'BwsWynikDrop gui_aktualizuj_drag(const char* sciezka, int x, int y, bool wykonaj_drop)',
        prawa: 'PRAWO_GUI',
        opis: 'Sterowanie przeciąganiem: wynik 0=BRAK_CELU, 1=CEL_POPRAWNY, 2=PRZENIESIONO, 3=BLAD.',
        sygnatura: 'arg1=sciezka, arg2=(x<<32)|y, arg3=drop',
        przyklad: `{ BwsWynikDrop w = gui_aktualizuj_drag("/dane/a.txt", mx, my, true); }`
    }
];

/* Sortuje wpisy po numerze - wygodne dla przegladarki API. */
BWS_SYSCALLS.sort((a, b) => a.nr - b.nr);

/* =========================================================================
 * MAPA KOMPONENT -> WYWOLANIA BWS
 * Kazdy komponent z palety jest implementowany w generowanym C++ wylacznie
 * przez API BWS (bursztyn_gui.h / syscalls.cpp). Pole api opisuje, ktore
 * numery BWS i wrappery sa uzywane - widoczne w palecie i inspektorze.
 * ========================================================================= */
const TYPE_BWS_MAP = {
    'window':               'BWS 14 rysuj_okno · 19 odswiez_pulpit · 33 utworz_warstwe · 34 przesun · 17 odswiez · 37/38 zdarzenia',
    'TChildWindow':         'BWS 21 prostokat · 20 tekst · 2/3 MYSZ_DOWN/UP · przeciąganie wewnątrz rodzica',
    'TModalWindow':         'BWS 21 prostokat · 20 tekst · blokada zdarzeń pod spodem (MYSZ_DOWN)',
    'TPopupWindow':         'BWS 56 popup_aplikacji · MYSZ_PRAWY_DOWN (20) pokazuje/ukrywa · 21+20 rysowanie',
    'TMainMenu':            'BWS 21 prostokat · 20 tekst pozycji menu',
    'TPopupMenu':           'BWS 56 gui_ustaw_popup_aplikacji + 49 cele drop',
    'TLabel':               'BWS 20 gui_wypisz_tekst_kolor_skala',
    'TEdit':                'BWS 21 prostokat · 20 tekst · BWS 4 pobierz_znak (edycja)',
    'TMemo':                'BWS 21 prostokat · 20 tekst linia po linii',
    'TButton':              'BWS 21 prostokat (ramka) · 20 tekst wysrodkowany · zdarzenie BWS_ZDARZENIE_MYSZ_DOWN',
    'TCheckBox':            'BWS 21 prostokat · 20 tekst · stan kliknięcia (MYSZ_DOWN)',
    'TRadioButton':         'BWS 21 prostokat · 20 tekst · stan kliknięcia',
    'TListBox':             'BWS 21 prostokat · 20 tekst · wybór pozycji klikiem',
    'TComboBox':            'BWS 21 prostokat · 20 tekst · rozwijana lista (hit-test)',
    'TScrollBar':           'BWS 21 prostokąty (tor + suwak)',
    'TGroupBox':            'BWS 21 prostokat · 20 tekst tytułu (kontener)',
    'TRadioGroup':          'BWS 21 prostokat · 20 tekst opcji',
    'TPanel':               'BWS 21 prostokat (kontener; dzieci przesuwane razem)',
    'TActionList':          'logika aplikacji — brak rysowania',
    'TBitBtn':              'BWS 21 prostokat · 20 tekst',
    'TSpeedButton':         'BWS 21 prostokat płaski · 20 tekst',
    'TMaskEdit':            'BWS 21 prostokat · 20 tekst · BWS 4 klawiatura',
    'TStringGrid':          'BWS 21 siatka (linie) · 20 tekst nagłówków/komórek',
    'TDrawGrid':            'BWS 21 siatka (linie)',
    'TImage':               'BWS 21 ramka/wypełnienie · 20 podpis (miejsce na grafikę)',
    'TShape':               'BWS 21 wypełniony kształt kolorem tła',
    'TBevel':               'BWS 21 linie 3D (jasna/ciemna krawędź)',
    'TScrollBox':           'BWS 21 panel + pasek przewijania',
    'TCheckListBox':        'BWS 21 prostokat · 20 tekst · pola wyboru',
    'TSplitter':            'BWS 21 rozdzielacz (przesuwny pasek)',
    'TStaticText':          'BWS 20 tekst',
    'TControlBar':          'BWS 21 pasek narzędziowy · 20 tekst',
    'TApplicationEvents':   'BWS 37/38 zdarzenia systemowe procesu',
    'TValueListEditor':     'BWS 21 siatka klucz|wartość · 20 tekst',
    'TLabeledEdit':         'BWS 20 etykieta · 21 pole edycji',
    'TColorBox':            'BWS 21 próbki kolorów · 20 tekst',
    'TCategoryButtons':     'BWS 21 przyciski kategorii · 20 tekst',
    'TTabSet':              'BWS 21 zakładki · 20 tekst',
    'TTabControl':          'BWS 21 zakładki + panel zawartości · 20 tekst',
    'TPageControl':         'BWS 21 zakładki + panel zawartości · 20 tekst',
    'TImageList':           'zasoby obrazów — brak rysowania',
    'TRichEdit':            'BWS 21 prostokat · 20 tekst (wieloliniowy)',
    'TTrackBar':            'BWS 21 tor + suwak · wartość klikiem (MYSZ_DOWN)',
    'TProgressBar':         'BWS 21 prostokat postępu',
    'TUpDown':              'BWS 21 strzałki góra/dół · 20 tekst',
    'THotKey':              'BWS 21 pole skrótu · 20 tekst',
    'TAnimate':             'BWS 21 ramka animacji (placeholder)',
    'TDateTimePicker':      'BWS 21 pole daty · 20 tekst · BWS 9 RTC',
    'TMonthCalendar':       'BWS 21 siatka kalendarza · 20 tekst',
    'TTreeView':            'BWS 21 drzewo (wcięcia) · 20 tekst węzłów',
    'TListView':            'BWS 21 lista + nagłówki kolumn · 20 tekst',
    'THeaderControl':       'BWS 21 sekcje nagłówka · 20 tekst',
    'TStatusBar':           'BWS 21 prostokat · 20 tekst statusu',
    'TToolBar':             'BWS 21 przyciski paska · 20 tekst',
    'TCoolBar':             'BWS 21 pasy narzędzi · 20 tekst',
    'TXPManifest':          'brak odpowiednika BWS — znacznik stylu',
    'TTimer':               'BWS_ZDARZENIE_TIMER (5) przez gui_czekaj_na_zdarzenie (38)',
    'TPaintBox':            'BWS 21 powierzchnia rysowania (prostokat)',
    'TMediaPlayer':         'BWS 27 dźwięk HDA · 21 przyciski transportu',
    'TOleContainer':        'BWS 21 kontener obiektu (ramka)',
    'TOpenDialog':          'BWS 6 wylistuj_katalog · 5 czytaj_plik',
    'TSaveDialog':          'BWS 3 zapisz_plik · 2 utworz_plik',
    'TFontDialog':          'BWS 24 szerokość znaku · 51 wysokość fontu',
    'TColorDialog':         'BWS 21 próbki · 20 tekst (wybór koloru)',
    'TPrintDialog':         'brak drukarki w ABI BWS — stub',
    'TFindDialog':          'BWS 6 wylistuj_katalog (wyszukiwanie plików)',
    'TDBGrid':              'BWS 21 siatka danych · 20 tekst',
    'TDBNavigator':         'BWS 21 przyciski nawigacji',
    'TDBText':              'BWS 20 tekst',
    'TDBEdit':              'BWS 21 pole edycji · 20 tekst',
    'TDBImage':             'BWS 21 ramka obrazu · 20 podpis',
    'TDBComboBox':          'BWS 21 lista rozwijana · 20 tekst',
    'TDBCheckBox':          'BWS 21 pole wyboru · 20 tekst'
};

function bwsApiForType(type) {
    return TYPE_BWS_MAP[type] || 'komponent ogólny: BWS 21 prostokat · 20 tekst';
}

Object.assign(window, { BWS_ZDARZENIA, BWS_STRUKTURY, BWS_SYSCALLS, TYPE_BWS_MAP, bwsApiForType });
