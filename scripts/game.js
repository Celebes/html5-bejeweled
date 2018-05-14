jewel.game = (function () {
    const dom = jewel.dom;
    const $ = dom.$;

    function showScreen(screenId) {
        const activeScreen = $('#game .screen.active')[0];
        const screen = $(`#${screenId}`)[0];
        if (activeScreen) {
            dom.removeClass(activeScreen, 'active');
        }
        dom.addClass(screen, 'active');
    }

    return {
        showScreen
    }
})();