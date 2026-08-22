/* =========================================================================
 * Bursztyn Builder RAD v3.0 - start aplikacji i globalna obsluga zdarzen
 * ========================================================================= */

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
