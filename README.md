<div align="center">
  <img src="image/1.png" alt="Bursztyn Builder RAD - Banner" width="700"/>

  # 💎 Bursztyn Builder RAD
  **Wizualny konstruktor aplikacji dla Bursztyn OS**

  [![Bursztyn OS](https://img.shields.io/badge/Platforma-Bursztyn_OS-orange.svg)](#)
  [![C++](https://img.shields.io/badge/Język-C++-blue.svg)](#)
  [![Status](https://img.shields.io/badge/Status-Aktywny-green.svg)](#)
</div>

## 📖 O projekcie
**Bursztyn Builder RAD** to potężne, wizualne środowisko programistyczne (Rapid Application Development) stworzone specjalnie z myślą o systemie **Bursztyn OS**. Narzędzie to pozwala na błyskawiczne projektowanie interfejsów graficznych (GUI), układanie logiki za pomocą bloków i automatyczne generowanie gotowego, zoptymalizowanego kodu C++.

---

## 🚀 Co nowego w najnowszej wersji? (Sierpień 2026)

Środowisko przeszło ogromną aktualizację, wprowadzając profesjonalne narzędzia znane z największych silników:
*   **Edytor wizualny à la Scratch:** Zupełnie nowy, blokowy system budowania logiki z 10 kategoriami, wsparciem dla zagnieżdżeń (w tym `else`, pętle, warunki) oraz wbudowaną pomocą.
*   **Zakładki formularzy:** Każde okno (główne, podrzędne) otwiera się w nowej karcie nad płótnem, co całkowicie porządkuje pracę nad złożonymi aplikacjami.
*   **Zaawansowany próbnik kolorów:** Płynny wybór barw z obsługą HEX (`#RRGGBB`), HSV (odcień, nasycenie, jasność) oraz kanału Alpha (przezroczystość).
*   **Pełna zgodność z API BWS:** Każdy komponent wyświetla teraz informacje o wykorzystywanych wywołaniach systemowych BWS.
*   **Nowe typy okien:** Obsługa okien modalnych (blokujących tło), podrzędnych oraz pop-upów (menu pod prawym przyciskiem myszy).
*   **Inteligentna wyszukiwarka palety:** Błyskawiczne filtrowanie i sortowanie komponentów.

---

## ✨ Główne Możliwości

### 🎨 Projektowanie Wizualne (Drag & Drop)
Twórz interfejsy w mgnieniu oka, korzystając z intuicyjnego płótna projektowego.
*   **Inteligentna paleta i wyszukiwarka:** Bogata baza komponentów z wbudowaną wyszukiwarką ignorującą polskie znaki. Kafelki pokazują w tooltipach dokładnie, z jakiego API BWS korzystają.
*   **Zakładki i okna:** Organizuj pracę w zakładkach (np. *🏠 Okno główne | 🪟 Dziecko*). Twórz okna główne, modalne (przyciemniające tło) i podręczne (pop-up).
*   **Precyzyjne kontenery:** Przeciąganie paneli i grup automatycznie przesuwa wszystkie przypięte do nich komponenty.
*   **Drzewo Obiektów:** Pełna obsługa Drag & Drop! Upuszczanie elementów w drzewie natychmiast aktualizuje ich kolejność rysowania (Z-Order).
*   **Podgląd na żywo:** Wbudowany edytor Monaco pozwala na bieżąco podglądać i pobierać wygenerowany kod C++ (`.cpp`).

<div align="center">
  <img src="image/2.png" alt="Widok projektowania wizualnego" width="700"/>
  <br>
  <em>Interfejs projektowania z nowym drzewem obiektów i zakładkami</em>
</div>

### 🛠 Zaawansowany Inspektor Obiektów
Miej pełną kontrolę nad każdym detalem i zachowaniem swojej aplikacji.
*   **Konfiguracja okna:** Zarządzaj przyciskami paska tytułu (Minimalizacja, Maksymalizacja, Zamknięcie) z możliwością generowania własnych belek.
*   **Nowy Próbnik Kolorów:** Zmieniaj kolory tła i tekstu płynnie w czasie rzeczywistym. Pełne wsparcie dla wartości ARGB.
*   **Edycja list i tekstów:** Łatwe zarządzanie treścią dla kontrolek jedno- i wielolinijkowych.

### 🧩 Edytor Wizualny Logiki (No-Code)
Tworzenie interakcji nigdy nie było tak proste. Zamiast pisać kod, układaj go z interaktywnych bloków (inspirowanych środowiskiem Scratch)!
*   **10 kolorowych kategorii akcji:** 🔵 Ruch, 🟣 Wygląd, 🩷 Dźwięk, 🟡 Zdarzenia, 🟠 Kontrola, 🟦 Czujniki, 🟢 Wyrażenia, 🟤 Zmienne, 🔴 Moje bloki oraz dedykowane 🟧 API BWS.
*   **Zaawansowana logika:** Buduj zaawansowane skrypty dzięki blokom *Powtarzaj aż, Jeżeli/W przeciwnym razie, Break/Continue*, oraz operatorom logicznym (`==, !=, ORAZ, LUB`).
*   **Perfekcyjny interfejs:** 
    *   Zawsze widoczne etykiety parametrów wewnątrz klocków.
    *   Wbudowany system pomocy — kliknij **„?”** na dowolnym bloku, aby zobaczyć jego opis, parametry i przykładowy kod C++.
    *   Płynny Zoom (50–180%) oraz tryb **Pełnego Ekranu** (⛶) dla wygody budowania rozbudowanych skryptów.
    *   Możliwość instalacji dodatkowych "Rozszerzeń" (Multimedia, Rysowanie, Czas).

<div align="center">
  <img src="image/2.png" alt="Edytor wizualny logiki w stylu Scratch" width="700"/>
  <br>
  <em>Blokowy edytor logiki ze wsparciem zagnieżdżeń i pomocy kontekstowej</em>
</div>

<div align="center">
  <img src="image/3.png" alt="Edytor wizualny logiki w stylu Scratch" width="700"/>
  <br>
  <em>API BWS</em>
</div>

### ⚙️ Niezawodny Generator Kodu C++
Narzędzie dba o to, by wygenerowany kod był od razu gotowy do kompilacji i działania z biblioteką `bursztyn_gui.h`.
*   **Bezpieczeństwo i standardy:** Poprawne escapowanie tekstu, sanityzacja polskich znaków w identyfikatorach oraz globalny trap błędów, który precyzyjnie wskazuje ewentualne problemy ze skryptami.
*   **Prawdziwe zagnieżdżenia:** Generator perfekcyjnie radzi sobie z niedomkniętymi lub zagnieżdżonymi blokami kodu, pilnując poprawności klamer `{}` i wcięć.
*   **Funkcjonalność Out-of-the-Box:** 
    *   `ComboBox`, `CheckBox`, `ListBox` reagują na kliknięcia, rozwijają się i przełączają stany.
    *   Prawidłowy, wielowarstwowy hit-test idący z góry na dół, blokujący "przebijanie" kliknięć przez nachodzące na siebie kontrolki i okna modalne.
    *   Pełna obsługa natywnych zdarzeń systemowych (w tym `TIMER`, obsługa prawego przycisku myszy, minimalizacja/maksymalizacja okien).
*   **Pełne pokrycie testami:** Generator przechodzi rygorystyczne testy dymne (Smoke Tests) pokrywające wszystkie wywołania BWS i asercje dla nowych bloków logicznych.

---
*Bursztyn Builder RAD – Programowanie w Bursztyn OS bez ograniczeń.*