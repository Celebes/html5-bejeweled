jewel.board = (function () {
    let settings, jewels, cols, rows, baseScore, numJewelTypes;

    /*
     * Prints the board to the console for debugging purposes
     */
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

    /*
     * Initializes a fresh board, callback is an entry for later when web worker will be implemented
     */
    function initialize(callback) {
        settings = jewel.settings;
        numJewelTypes = settings.numJewelTypes;
        baseScore = settings.baseScore;
        cols = settings.cols;
        rows = settings.rows;
        fillBoard();
        callback();
    }

    /*
     * Fills board (which is just a 2D array) with jewels.
     * It makes sure that there are no chains (pair of 3+ in a row/column) at the start.
     */
    function fillBoard() {
        let type;
        jewels = [];
        for (let x = 0; x < cols; x++) {
            jewels[x] = [];
            for (let y = 0; y < rows; y++) {
                type = randomJewel();
                // make sure not to generate any chains
                while ((type === getJewel(x - 1, y) &&
                    type === getJewel(x - 2, y)) ||
                (type === getJewel(x, y - 1) &&
                    type === getJewel(x, y - 2))) {
                    type = randomJewel();
                }
                jewels[x][y] = type;
            }
        }
        // if created board doesn't have possible moves to create a chain - recreate it by recursion.
        if (!hasMoves()) {
            fillBoard();
        }
    }

    /*
     * Every jewel is represented by integer from 0 to (numJewelTypes - 1).
     */
    function randomJewel() {
        return Math.floor(Math.random() * numJewelTypes);
    }

    /*
     * Returns the jewel at specified position or -1 if coordinates are outside the board
     */
    function getJewel(x, y) {
        if (x < 0 || x > cols - 1 || y < 0 || y > rows - 1) {
            return -1;
        } else {
            return jewels[x][y];
        }
    }

    /*
     * Checks in all directions if there is a chain of 3+ jewels of the same type.
     * Returns longest found chain's length;
     */
    function checkChain(x, y) {
        let type = getJewel(x, y),
            left = 0, right = 0,
            down = 0, up = 0;

        while (type === getJewel(x + right + 1, y)) {
            right++;
        }

        while (type === getJewel(x - left - 1, y)) {
            left++;
        }

        while (type === getJewel(x, y + up + 1)) {
            up++;
        }

        while (type === getJewel(x, y - down - 1)) {
            down++;
        }

        return Math.max(left + 1 + right, up + 1 + down);
    }

    /*
     * Checks if jewel at coords (x1, y1) can be swapped with (x2, y2) to create a chain
     */
    function canSwap(x1, y1, x2, y2) {
        const type1 = getJewel(x1, y1),
            type2 = getJewel(x2, y2);
        let chain;

        if (!isAdjacent(x1, y1, x2, y2)) {
            return false;
        }

        // temporary swap to check chains
        jewels[x1][y1] = type2;
        jewels[x2][y2] = type1;

        chain = (checkChain(x2, y2) > 2
            || checkChain(x1, y1) > 2);

        // undo the temporary swap
        jewels[x1][y1] = type1;
        jewels[x2][y2] = type2;

        return chain;
    }

    /*
     * Checks if jewel (x1, y1) is a neighbour of jewel (x2, y2)
     */
    function isAdjacent(x1, y1, x2, y2) {
        const dx = Math.abs(x1 - x2),
            dy = Math.abs(y1 - y2);
        return (dx + dy === 1);
    }

    /**
     * calculates max chain length for every jewel on the board
     */
    function getChains() {
        let chains = [];

        for (let x = 0; x < cols; x++) {
            chains[x] = [];
            for (let y = 0; y < rows; y++) {
                chains[x][y] = checkChain(x, y);
            }
        }

        return chains;
    }

    /*
     * creates a deep copy of the entire board
     */
    function getBoard() {
        const copy = [];
        for (let x = 0; x < cols; x++) {
            copy[x] = jewels[x].slice(0);
        }
        return copy;
    }


    /*
     * Returns true if there is at least 1 possible move for the player
     */
    function hasMoves() {
        for (let x = 0; x < cols; x++) {
            for (let y = 0; y < rows; y++) {
                if (canJewelMove(x, y)) {
                    return true;
                }
            }
        }
        return false;
    }

    /*
     * Check() is called recursively to determine all the changes on the board after a single swap.
     * In each call it checks every column from bottom to top, marks jewels that formed a chain for deletion,
     * moves jewels above the deleted ones down, then fills the gaps from the top with new random jewels.
     * One chain generated from a single swap can change the board in such a way, that new chains will be generated,
     * so check() calls itself until no new chains are created, saving the history of all events along the way.
     * In the end the function returns "events" array, that holds objects. Each object represents all of the
     * events from a single recursive check() call. It means that "events" array is a chronological log of
     * all the events that were caused by a single swap, which will be used later for displaying animations
     * and graphics correctly.
     */
    function check(events) {
        // initialize fields and deterimne which board cells are part of a chain
        const chains = getChains(), removed = [], moved = [], gaps = [];
        let hadChains = false, score = 0;

        // for each column from left to right
        for (let x = 0; x < cols; x++) {
            // determine how big the gap is if some jewels were deleted after forming the chain
            gaps[x] = 0;
            // for each row in current cell, from bottom to top
            for (let y = rows - 1; y >= 0; y--) {
                // if the cell is part of a chain, increase the gap, record "removed" event, add points etc.
                if (chains[x][y] > 2) {
                    hadChains = true;
                    gaps[x]++;
                    removed.push({
                        x: x, y: y,
                        type: getJewel(x, y)
                    });

                    score += baseScore
                        * Math.pow(2, (chains[x][y] - 3));
                // if it isn't part of the chain, but below it some cells were removed with a chain, move it down
                } else if (gaps[x] > 0) {
                    moved.push({
                        toX: x, toY: y + gaps[x],
                        fromX: x, fromY: y,
                        type: getJewel(x, y)
                    });
                    jewels[x][y + gaps[x]] = getJewel(x, y);
                }
            }

            // fill empty cells, if there are any, from the top, with new random jewels
            for (y = 0; y < gaps[x]; y++) {
                jewels[x][y] = randomJewel();
                moved.push({
                    toX: x, toY: y,
                    fromX: x, fromY: y - gaps[x],
                    type: jewels[x][y]
                });
            }
        }

        // if it is a first call from swap(), events will always be an empty array
        // otherwise events come from a recursive check() call and is saved for future calls
        events = events || [];

        // if there was at least one chain detected in current recursive invocation,
        // update the events array with all generated events and call check() again,
        // because new chains could have formed. Otherwise return "events".
        if (hadChains) {
            events.push({
                type: 'remove',
                data: removed
            }, {
                type: 'score',
                data: score
            }, {
                type: 'move',
                data: moved
            });

            // if due to changes made by removing the chain() etc. there are no moves - recreate the board
            if (!hasMoves()) {
                fillBoard();
                events.push({
                    type: 'refill',
                    data: getBoard()
                });
            }

            return check(events);
        } else {
            return events;
        }

    }

    /*
     * Returns true if jewel (x,y) is inside the board and can be swapped to create a chain
     */
    function canJewelMove(x, y) {
        return ((x > 0 && canSwap(x, y, x - 1, y)) ||
            (x < cols - 1 && canSwap(x, y, x + 1, y)) ||
            (y > 0 && canSwap(x, y, x, y - 1)) ||
            (y < rows - 1 && canSwap(x, y, x, y + 1)));
    }

    /*
     * Swaps two jewels if it is possible (will create a chain), then generates events
     */
    function swap(x1, y1, x2, y2, callback) {
        let tmp, events;

        if (canSwap(x1, y1, x2, y2)) {
            // swap jewels
            tmp = getJewel(x1, y1);
            jewels[x1][y1] = getJewel(x2, y2);
            jewels[x2][y2] = tmp;

            // determine changes on the board after swap
            events = check();

            callback(events);
        } else {
            callback(false);
        }
    }

    return {
        initialize: initialize,
        swap: swap,
        canSwap: canSwap,
        getBoard: getBoard,
        print: print
    };

})();
