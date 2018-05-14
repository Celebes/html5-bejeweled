jewel.game = (function () {
    const dom = jewel.dom;
    const $ = dom.$;

    function showScreen(screenId) {
        const activeScreen = $('#game .screen.active')[0];
        const screen = $(`#${screenId}`)[0];
        if (activeScreen) {
            dom.removeClass(activeScreen, 'active');
        }
        // run init method of the screen
        jewel.screens[screenId].run();
        // show the screen
        dom.addClass(screen, 'active');
    }

    function setup() {
        // prevent the browser from scrolling the page with game in it
        dom.bind(document, 'touchmove', function (event) {
            event.preventDefault();
        });
        // hides the address bar on Android browsers
        if (/Android/.test(navigator.userAgent)) {
            $('html')[0].style.height = '200%';
            setTimeout(function () {
                window.scrollTo(0, 1);
            }, 0);
        }
    }

    return {
        showScreen,
        setup
    }
})();