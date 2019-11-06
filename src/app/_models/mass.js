"use strict";
/**
 * Created by Alena Misan on 03.01.2017.
 */
var Mass = (function () {
    function Mass(langCode, parish, duration, info) {
        this.langCode = langCode;
        this.parish = parish;
        this.duration = duration;
        this.info = info;
    }
    return Mass;
}());
exports.Mass = Mass;
