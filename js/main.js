/* =========================================================================
 * Bursztyn Builder RAD v3.0 - start aplikacji i globalna obsluga zdarzen
 * ========================================================================= */

/* Globalny lapacz bledow: zamiast cichej awarii pokazuje komunikat,
 * dzieki czomu latwiej zglosic/zdiagnozowac problem. */
window.addEventListener('error', (e) => {
    try {
        let toast = document.getElementById('bws-error-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'bws-error-toast';
            toast.style.cssText = 'position:fixed;bottom:10px;left:50%;transform:translateX(-50%);z-index:99999;background:#7A0000;color:#fff;border:1px solid #FF6666;padding:8px 14px;border-radius:6px;font:11px monospace;max-width:80%;box-shadow:0 4px 16px rgba(0,0,0,.6);';
            document.body.appendChild(toast);
        }
        toast.textContent = '⚠ Błąd skryptu: ' + e.message + (e.filename ? ' (' + e.filename.split('/').pop() + ':' + e.lineno + ')' : '');
        clearTimeout(window.__errToastT);
        window.__errToastT = setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 8000);
    } catch (_) { /* ignoruj */ }
});

window.onload = () => {
    buildPalette();
    addElement('window', 50, 50, 600, 450, 'Aplikacja Bursztyn (VCL Edition)');
    addElement('TButton', 80, 100, 120, 30, 'Przycisk');
    addElement('TComboBox', 80, 150, 150, 24, 'Opcja 1\nOpcja 2\nOpcja 3');
    addElement('TGroupBox', 250, 100, 200, 120, 'Opcje Zasilania');

    document.addEventListener('mousemove', onGlobalMove);
    document.addEventListener('mouseup', onGlobalUp);
    document.addEventListener('click', (e) => {
        if (!ctxMenu.contains(e.target)) ctxMenu.classList.add('hidden');
    });
    document.addEventListener('keydown', (e) => {
        const active = document.activeElement;
        const tag = active && active.tagName;
        const inField = (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT');

        if (e.key === 'Delete' && selectedId !== null && !inField) deleteSelected();
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !inField) { e.preventDefault(); restoreDeleted(); }
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd' && selectedId !== null && !inField) { e.preventDefault(); duplicateSelected(); }
    });

    canvas.onmousedown = (e) => { if (e.target === canvas && e.button === 0) { selectedId = null; updateUI(); } };
};
