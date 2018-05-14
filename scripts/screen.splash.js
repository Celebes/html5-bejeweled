jewel.screens['splash-screen'] = (function () {
    const game = jewel.game;
    const dom = jewel.dom;
    let firstRun = true;

    function setup() {
        dom.bind('#splash-screen', 'click', function () {
            game.showScreen('main-menu');
        });
    }

    function run() {
        if (firstRun) {
            setup();
            firstRun = false;
        }
    }

    return {
        run: run
    };
})();
