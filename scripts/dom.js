jewel.dom = (function () {
    const $ = Sizzle;

    function hasClass(el, className) {
        const regex = new RegExp(`(^|\\s)${className}(\\s|$)`);
        return regex.test(el.className);
    }

    function addClass(el, className) {
        if (!hasClass(el, className)) {
            el.className += " " + className;
        }
    }

    function removeClass(el, className) {
        const regex = new RegExp(`(^|\\s)${className}(\\s|$)`);
        el.className = el.className.replace(regex, " ");
    }

    function bind(element, event, handler) {
        if (typeof element === 'string') {
            element = $(element)[0];
        }
        element.addEventListener(event, handler, false)
    }

    return {
        $,
        hasClass,
        addClass,
        removeClass,
        bind
    }
})();