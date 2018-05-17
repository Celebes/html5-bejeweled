jewel.board = (function () {
    const dom = jewel.dom;
    let settings,
        worker,
        messageCount,
        callbacks,
        rows,
        cols;

    function initialize(callback) {
        settings = jewel.settings;
        rows = settings.rows;
        cols = settings.cols;
        messageCount = 0;
        callbacks = [];
        worker = new Worker('scripts/board.worker.js');
        dom.bind(worker, 'message', messageHandler);
        post('initialize', jewel.settings, callback);
    }

    /*
     * Saves callback for later with unique ID, then sends message to the Web Worker
     */
    function post(command, data, callback) {
        callbacks[messageCount] = callback;
        worker.postMessage({
            id: messageCount,
            command: command,
            data: data
        });
        messageCount++;
    }

    /*
     * Receives message from the Web Worker, finds correct callback using ID saved before in post() and executes it
     */
    function messageHandler(event) {
        const message = event.data;

        jewels = message.jewels;

        if (callbacks[message.id]) {
            callbacks[message.id](message.data);
            delete callbacks[message.id];
        }
    }

    function swap(x1, y1, x2, y2, callback) {
        post('swap', {
            x1: x1,
            y1: y1,
            x2: x2,
            y2: y2
        }, callback);
    }

    function getBoard() {
        const copy = [];
        let x;
        for (x = 0; x < cols; x++) {
            copy[x] = jewels[x].slice(0);
        }
        return copy;
    }

    function getJewel(x, y) {
        if (x < 0 || x > cols - 1 || y < 0 || y > rows - 1) {
            return -1;
        } else {
            return jewels[x][y];
        }
    }

    function print() {
        let str = '';
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                str += getJewel(x, y) + ' ';
            }
            str += '\r\n';
        }
        console.log(str);
    }

    return {
        initialize: initialize,
        swap: swap,
        getBoard: getBoard,
        print: print
    };
})();
