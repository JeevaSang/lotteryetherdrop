Utils = new function () {
    this.isTouchDevice = function () {
        try {
            document.createEvent('TouchEvent');
            return true;
        } catch (e) {
            return false;
        }
    };
};

