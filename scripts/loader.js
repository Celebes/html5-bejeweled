const jewel = {};

window.addEventListener('load', function() {
    Modernizr.load([
        {
            load: [
                'scripts/sizzle.js',
                'scripts/dom.js',
                'scripts/game.js'
            ],
            complete: function() {
                console.log('Finished loading all the scripts asynchronously!');
                jewel.game.showScreen('splash-screen');
            }
        }
    ])
});