/* =========================================================================
 * Bursztyn Builder RAD v3.0 - narzedzia pomocnicze
 * ========================================================================= */

/* Parsuje kolor w formacie BWS 0xAARRGGBB na {a, hex}. */
function parseBursztynColor(bHex) {
    let clean = (bHex || '').toString().replace('0x', '');
    while (clean.length < 8) clean = '0' + clean;
    let a = parseInt(clean.substring(0, 2), 16);
    let hex = '#' + clean.substring(2);
    return { a, hex };
}

/* Buduje kolor BWS 0xAARRGGBB z alfa i hex RGB. */
function buildBursztynColor(a, hex) {
    let aStr = parseInt(a).toString(16).toUpperCase().padStart(2, '0');
    let hStr = hex.replace('#', '').toUpperCase();
    return '0x' + aStr + hStr;
}

/* Kolor BWS -> CSS rgba() do podgladu na plotnie. */
function bursztynToRGBA(bHex) {
    let { a, hex } = parseBursztynColor(bHex);
    let r = parseInt(hex.substring(1, 3), 16) || 0;
    let g = parseInt(hex.substring(3, 5), 16) || 0;
    let b = parseInt(hex.substring(5, 7), 16) || 0;
    return `rgba(${r}, ${g}, ${b}, ${a / 255.0})`;
}

/* Escapuje tekst tak, by bezpiecznie trafil do literalu C++ ("...").
 * Wczesniej teksty z cudzyslowami / backslashami / nowymi liniami
 * (np. wielolinijkowy TMemo) lamaly wygenerowany kod. */
function escapeCppString(str) {
    if (str === undefined || str === null) return '';
    return String(str)
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\r\n/g, '\\n')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\n')
        .replace(/\t/g, '\\t');
}

/* Tworzy unikalny, poprawny identyfikator C++ z nazwy nadanej przez
 * uzytkownika (usuwa polskie znaki/spacje/znaki specjalne, dokleja
 * id elementu, zeby uniknac kolizji przy duplikatach nazw). */
function cIdent(el) {
    let base = (el.name || el.type || 'obj').toString();
    const map = {'ą':'a','ć':'c','ę':'e','ł':'l','ń':'n','ó':'o','ś':'s','ź':'z','ż':'z',
                 'Ą':'A','Ć':'C','Ę':'E','Ł':'L','Ń':'N','Ó':'O','Ś':'S','Ź':'Z','Ż':'Z'};
    base = base.replace(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, ch => map[ch] || ch);
    base = base.replace(/[^a-zA-Z0-9_]/g, '_');
    if (!/^[a-zA-Z_]/.test(base)) base = '_' + base;
    return `${base}_${el.id}`;
}

/* Bezpieczna liczba calkowita z parametru akcji. */
function intParam(v, fallback) {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : (fallback || 0);
}

Object.assign(window, {
    parseBursztynColor,
    buildBursztynColor,
    bursztynToRGBA,
    escapeCppString,
    cIdent,
    intParam
});
