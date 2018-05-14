jewel.screens['main-menu'] = (function () {
    var dom = jewel.dom;
    const game = jewel.game;
    let firstRun = true;

    function setup() {
        dom.bind('#main-menu ul.menu', 'click', function (e) {
            if (e.target.nodeName.toLowerCase() === 'button') {
                var action = e.target.getAttribute('name');
                game.showScreen(action);
            }
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
