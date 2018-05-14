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

    return {
        $,
        hasClass,
        addClass,
        removeClass
    }
})();