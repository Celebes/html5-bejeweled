const jewel = {
    screens: {},
    settings: {
        rows: 8,
        cols: 8,
        baseScore: 100,
        numJewelTypes: 7
    }
};

window.addEventListener('load', function () {
    Modernizr.addTest('standalone', function () {
        return (window.navigator.standalone != false);
    });

    // creates a yepnope prefix, which prevents scripts from being executed on load
    // thanks to this we can load web worker without errors, because functions like
    // importScripts() are available to use only when we are in Web Worker context
    yepnope.addPrefix("preload", function (resource) {
        resource.noexec = true;
        return resource;
    });

    Modernizr.load([
        {
            load: [
                'scripts/sizzle.js',
                'scripts/dom.js',
                'scripts/game.js'
            ],
        },
        {
            test: Modernizr.standalone,
            yep: 'scripts/screen.splash.js',
            nope: 'scripts/screen.install.js',
            complete: function () {
                jewel.game.setup();
                if (Modernizr.standalone) {
                    jewel.game.showScreen('splash-screen');
                } else {
                    jewel.game.showScreen('install-screen');
                }
            }
        }
    ]);
    // if we are on Safari iOS, force user to install game as standalone
    // then only show main menu if the game was opened from "native" icon
    // in other cases (not Safari iOS), this will always be run
    if (Modernizr.standalone) {
        Modernizr.load([
            {
                load: [
                    'scripts/screen.main-menu.js'
                ]
            }, {
                test: Modernizr.webworkers,
                yep: [
                    'scripts/board.worker-interface.js',
                    'preload!scripts/board.worker.js'
                ],
                nope: 'scripts/board.js'
            }
        ]);
    }
});