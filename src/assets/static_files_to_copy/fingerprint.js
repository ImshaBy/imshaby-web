//FingerPrint2

/* global define */
(function (name, context, definition) {
    "use strict";
    if (typeof window !== "undefined" && typeof define === "function" && define.amd) { define(definition) } else if (typeof module !== "undefined" && module.exports) { module.exports = definition() } else if (context.exports) { context.exports = definition() } else { context[name] = definition() }
})("Fingerprint2", this, function () {
    "use strict";

    // detect if object is array
    // only implement if no native implementation is available
    if (typeof Array.isArray === "undefined") {
        Array.isArray = function (obj) {
            return Object.prototype.toString.call(obj) === "[object Array]";
        };
    };

    /// MurmurHash3 related functions

    //
    // Given two 64bit ints (as an array of two 32bit ints) returns the two
    // added together as a 64bit int (as an array of two 32bit ints).
    //
    var x64Add = function (m, n) {
        m = [m[0] >>> 16, m[0] & 0xffff, m[1] >>> 16, m[1] & 0xffff];
        n = [n[0] >>> 16, n[0] & 0xffff, n[1] >>> 16, n[1] & 0xffff];
        var o = [0, 0, 0, 0];
        o[3] += m[3] + n[3];
        o[2] += o[3] >>> 16;
        o[3] &= 0xffff;
        o[2] += m[2] + n[2];
        o[1] += o[2] >>> 16;
        o[2] &= 0xffff;
        o[1] += m[1] + n[1];
        o[0] += o[1] >>> 16;
        o[1] &= 0xffff;
        o[0] += m[0] + n[0];
        o[0] &= 0xffff;
        return [(o[0] << 16) | o[1], (o[2] << 16) | o[3]];
    };

    //
    // Given two 64bit ints (as an array of two 32bit ints) returns the two
    // multiplied together as a 64bit int (as an array of two 32bit ints).
    //
    var x64Multiply = function (m, n) {
        m = [m[0] >>> 16, m[0] & 0xffff, m[1] >>> 16, m[1] & 0xffff];
        n = [n[0] >>> 16, n[0] & 0xffff, n[1] >>> 16, n[1] & 0xffff];
        var o = [0, 0, 0, 0];
        o[3] += m[3] * n[3];
        o[2] += o[3] >>> 16;
        o[3] &= 0xffff;
        o[2] += m[2] * n[3];
        o[1] += o[2] >>> 16;
        o[2] &= 0xffff;
        o[2] += m[3] * n[2];
        o[1] += o[2] >>> 16;
        o[2] &= 0xffff;
        o[1] += m[1] * n[3];
        o[0] += o[1] >>> 16;
        o[1] &= 0xffff;
        o[1] += m[2] * n[2];
        o[0] += o[1] >>> 16;
        o[1] &= 0xffff;
        o[1] += m[3] * n[1];
        o[0] += o[1] >>> 16;
        o[1] &= 0xffff;
        o[0] += (m[0] * n[3]) + (m[1] * n[2]) + (m[2] * n[1]) + (m[3] * n[0]);
        o[0] &= 0xffff;
        return [(o[0] << 16) | o[1], (o[2] << 16) | o[3]];
    };
    //
    // Given a 64bit int (as an array of two 32bit ints) and an int
    // representing a number of bit positions, returns the 64bit int (as an
    // array of two 32bit ints) rotated left by that number of positions.
    //
    var x64Rotl = function (m, n) {
        n %= 64;
        if (n === 32) {
            return [m[1], m[0]];
        } else if (n < 32) {
            return [(m[0] << n) | (m[1] >>> (32 - n)), (m[1] << n) | (m[0] >>> (32 - n))];
        } else {
            n -= 32;
            return [(m[1] << n) | (m[0] >>> (32 - n)), (m[0] << n) | (m[1] >>> (32 - n))];
        }
    };
    //
    // Given a 64bit int (as an array of two 32bit ints) and an int
    // representing a number of bit positions, returns the 64bit int (as an
    // array of two 32bit ints) shifted left by that number of positions.
    //
    var x64LeftShift = function (m, n) {
        n %= 64;
        if (n === 0) {
            return m;
        } else if (n < 32) {
            return [(m[0] << n) | (m[1] >>> (32 - n)), m[1] << n];
        } else {
            return [m[1] << (n - 32), 0];
        }
    };
    //
    // Given two 64bit ints (as an array of two 32bit ints) returns the two
    // xored together as a 64bit int (as an array of two 32bit ints).
    //
    var x64Xor = function (m, n) {
        return [m[0] ^ n[0], m[1] ^ n[1]];
    };
    //
    // Given a block, returns murmurHash3's final x64 mix of that block.
    // (`[0, h[0] >>> 1]` is a 33 bit unsigned right shift. This is the
    // only place where we need to right shift 64bit ints.)
    //
    var x64Fmix = function (h) {
        h = x64Xor(h, [0, h[0] >>> 1]);
        h = x64Multiply(h, [0xff51afd7, 0xed558ccd]);
        h = x64Xor(h, [0, h[0] >>> 1]);
        h = x64Multiply(h, [0xc4ceb9fe, 0x1a85ec53]);
        h = x64Xor(h, [0, h[0] >>> 1]);
        return h;
    };

    //
    // Given a string and an optional seed as an int, returns a 128 bit
    // hash using the x64 flavor of MurmurHash3, as an unsigned hex.
    //
    var x64hash128 = function (key, seed) {
        key = key || "";
        seed = seed || 0;
        var remainder = key.length % 16;
        var bytes = key.length - remainder;
        var h1 = [0, seed];
        var h2 = [0, seed];
        var k1 = [0, 0];
        var k2 = [0, 0];
        var c1 = [0x87c37b91, 0x114253d5];
        var c2 = [0x4cf5ad43, 0x2745937f];
        var i;
        for (i = 0; i < bytes; i = i + 16) {
            k1 = [((key.charCodeAt(i + 4) & 0xff)) | ((key.charCodeAt(i + 5) & 0xff) << 8) | ((key.charCodeAt(i + 6) & 0xff) << 16) | ((key.charCodeAt(i + 7) & 0xff) << 24), ((key.charCodeAt(i) & 0xff)) | ((key.charCodeAt(i + 1) & 0xff) << 8) | ((key.charCodeAt(i + 2) & 0xff) << 16) | ((key.charCodeAt(i + 3) & 0xff) << 24)];
            k2 = [((key.charCodeAt(i + 12) & 0xff)) | ((key.charCodeAt(i + 13) & 0xff) << 8) | ((key.charCodeAt(i + 14) & 0xff) << 16) | ((key.charCodeAt(i + 15) & 0xff) << 24), ((key.charCodeAt(i + 8) & 0xff)) | ((key.charCodeAt(i + 9) & 0xff) << 8) | ((key.charCodeAt(i + 10) & 0xff) << 16) | ((key.charCodeAt(i + 11) & 0xff) << 24)];
            k1 = x64Multiply(k1, c1);
            k1 = x64Rotl(k1, 31);
            k1 = x64Multiply(k1, c2);
            h1 = x64Xor(h1, k1);
            h1 = x64Rotl(h1, 27);
            h1 = x64Add(h1, h2);
            h1 = x64Add(x64Multiply(h1, [0, 5]), [0, 0x52dce729]);
            k2 = x64Multiply(k2, c2);
            k2 = x64Rotl(k2, 33);
            k2 = x64Multiply(k2, c1);
            h2 = x64Xor(h2, k2);
            h2 = x64Rotl(h2, 31);
            h2 = x64Add(h2, h1);
            h2 = x64Add(x64Multiply(h2, [0, 5]), [0, 0x38495ab5]);
        }
        k1 = [0, 0];
        k2 = [0, 0];
        switch (remainder) {
            case 15:
                k2 = x64Xor(k2, x64LeftShift([0, key.charCodeAt(i + 14)], 48));
            // fallthrough
            case 14:
                k2 = x64Xor(k2, x64LeftShift([0, key.charCodeAt(i + 13)], 40));
            // fallthrough
            case 13:
                k2 = x64Xor(k2, x64LeftShift([0, key.charCodeAt(i + 12)], 32));
            // fallthrough
            case 12:
                k2 = x64Xor(k2, x64LeftShift([0, key.charCodeAt(i + 11)], 24));
            // fallthrough
            case 11:
                k2 = x64Xor(k2, x64LeftShift([0, key.charCodeAt(i + 10)], 16));
            // fallthrough
            case 10:
                k2 = x64Xor(k2, x64LeftShift([0, key.charCodeAt(i + 9)], 8));
            // fallthrough
            case 9:
                k2 = x64Xor(k2, [0, key.charCodeAt(i + 8)]);
                k2 = x64Multiply(k2, c2);
                k2 = x64Rotl(k2, 33);
                k2 = x64Multiply(k2, c1);
                h2 = x64Xor(h2, k2);
            // fallthrough
            case 8:
                k1 = x64Xor(k1, x64LeftShift([0, key.charCodeAt(i + 7)], 56));
            // fallthrough
            case 7:
                k1 = x64Xor(k1, x64LeftShift([0, key.charCodeAt(i + 6)], 48));
            // fallthrough
            case 6:
                k1 = x64Xor(k1, x64LeftShift([0, key.charCodeAt(i + 5)], 40));
            // fallthrough
            case 5:
                k1 = x64Xor(k1, x64LeftShift([0, key.charCodeAt(i + 4)], 32));
            // fallthrough
            case 4:
                k1 = x64Xor(k1, x64LeftShift([0, key.charCodeAt(i + 3)], 24));
            // fallthrough
            case 3:
                k1 = x64Xor(k1, x64LeftShift([0, key.charCodeAt(i + 2)], 16));
            // fallthrough
            case 2:
                k1 = x64Xor(k1, x64LeftShift([0, key.charCodeAt(i + 1)], 8));
            // fallthrough
            case 1:
                k1 = x64Xor(k1, [0, key.charCodeAt(i)]);
                k1 = x64Multiply(k1, c1);
                k1 = x64Rotl(k1, 31);
                k1 = x64Multiply(k1, c2);
                h1 = x64Xor(h1, k1);
            // fallthrough
        }
        h1 = x64Xor(h1, [0, key.length]);
        h2 = x64Xor(h2, [0, key.length]);
        h1 = x64Add(h1, h2);
        h2 = x64Add(h2, h1);
        h1 = x64Fmix(h1);
        h2 = x64Fmix(h2);
        h1 = x64Add(h1, h2);
        h2 = x64Add(h2, h1);
        return ("00000000" + (h1[0] >>> 0).toString(16)).slice(-8) + ("00000000" + (h1[1] >>> 0).toString(16)).slice(-8) + ("00000000" + (h2[0] >>> 0).toString(16)).slice(-8) + ("00000000" + (h2[1] >>> 0).toString(16)).slice(-8);
    };

    var defaultOptions = {
        preprocessor: null,
        audio: {
            timeout: 1000,
            // On iOS 11, audio context can only be used in response to user interaction.
            // We require users to explicitly enable audio fingerprinting on iOS 11.
            // See https://stackoverflow.com/questions/46363048/onaudioprocess-not-called-on-ios11#46534088
            excludeIOS11: true
        },
        fonts: {
            swfContainerId: "fingerprintjs2",
            swfPath: "flash/compiled/FontList.swf",
            userDefinedFonts: [],
            extendedJsFonts: false
        },
        screen: {
            // To ensure consistent fingerprints when users rotate their mobile devices
            detectScreenOrientation: true
        },
        plugins: {
            sortPluginsFor: [/palemoon/i],
            excludeIE: false
        },
        extraComponents: [],
        excludes: {
            // Unreliable on Windows, see https://github.com/Valve/fingerprintjs2/issues/375
            'enumerateDevices': true,
            // devicePixelRatio depends on browser zoom, and it's impossible to detect browser zoom
            'pixelRatio': true,
            // DNT depends on incognito mode for some browsers (Chrome) and it's impossible to detect incognito mode
            'doNotTrack': true,
            // uses js fonts already
            'fontsFlash': true
        },
        NOT_AVAILABLE: "not available",
        ERROR: "error",
        EXCLUDED: "excluded"
    };

    var each = function (obj, iterator) {
        if (Array.prototype.forEach && obj.forEach === Array.prototype.forEach) {
            obj.forEach(iterator);
        } else if (obj.length === +obj.length) {
            for (var i = 0, l = obj.length; i < l; i++) {
                iterator(obj[i], i, obj);
            }
        } else {
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    iterator(obj[key], key, obj);
                }
            }
        }
    };

    var map = function (obj, iterator) {
        var results = [];
        // Not using strict equality so that this acts as a
        // shortcut to checking for `null` and `undefined`.
        if (obj == null) {
            return results;
        }
        if (Array.prototype.map && obj.map === Array.prototype.map) { return obj.map(iterator) }
        each(obj, function (value, index, list) {
            results.push(iterator(value, index, list));
        });
        return results;
    };

    var extendSoft = function (target, source) {
        if (source == null) { return target }
        var value;
        var key;
        for (key in source) {
            value = source[key];
            if (value != null && !(Object.prototype.hasOwnProperty.call(target, key))) {
                target[key] = value;
            }
        }
        return target;
    };

    // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices
    var enumerateDevicesKey = function (done, options) {
        if (!isEnumerateDevicesSupported()) {
            return done(options.NOT_AVAILABLE);
        }
        navigator.mediaDevices.enumerateDevices().then(function (devices) {
            done(devices.map(function (device) {
                return "id=" + device.deviceId + ";gid=" + device.groupId + ";" + device.kind + ";" + device.label;
            }));
        })["catch"](function (error) {
            done(error);
        });
    };

    var isEnumerateDevicesSupported = function () {
        return (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices);
    };
    // Inspired by and based on https://github.com/cozylife/audio-fingerprint
    var audioKey = function (done, options) {
        var audioOptions = options.audio;
        if (audioOptions.excludeIOS11 && navigator.userAgent.match(/OS 11.+Version\/11.+Safari/)) {
            // See comment for excludeUserAgent and https://stackoverflow.com/questions/46363048/onaudioprocess-not-called-on-ios11#46534088
            return done(options.EXCLUDED);
        }

        var AudioContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;

        if (AudioContext == null) {
            return done(options.NOT_AVAILABLE);
        }

        var context = new AudioContext(1, 44100, 44100);

        var oscillator = context.createOscillator();
        oscillator.type = "triangle";
        oscillator.frequency.setValueAtTime(10000, context.currentTime);

        var compressor = context.createDynamicsCompressor();
        each([
            ["threshold", -50],
            ["knee", 40],
            ["ratio", 12],
            ["reduction", -20],
            ["attack", 0],
            ["release", 0.25]
        ], function (item) {
            if (compressor[item[0]] !== undefined && typeof compressor[item[0]].setValueAtTime === "function") {
                compressor[item[0]].setValueAtTime(item[1], context.currentTime);
            }
        });

        oscillator.connect(compressor);
        compressor.connect(context.destination);
        oscillator.start(0);
        context.startRendering();

        var audioTimeoutId = setTimeout(function () {
            console.warn('Audio fingerprint timed out. Please report bug at https://github.com/Valve/fingerprintjs2 with your user agent: "' + navigator.userAgent + '".');
            context.oncomplete = function () { };
            context = null;
            return done("audioTimeout");
        }, audioOptions.timeout);

        context.oncomplete = function (event) {
            var fingerprint;
            try {
                clearTimeout(audioTimeoutId);
                fingerprint = event.renderedBuffer.getChannelData(0)
                    .slice(4500, 5000)
                    .reduce(function (acc, val) { return acc + Math.abs(val) }, 0)
                    .toString();
                oscillator.disconnect();
                compressor.disconnect();
            } catch (error) {
                done(error);
                return;
            }
            done(fingerprint);
        };
    };
    var UserAgent = function (done) {
        done(navigator.userAgent);
    };
    var webdriver = function (done, options) {
        done(navigator.webdriver == null ? options.NOT_AVAILABLE : navigator.webdriver);
    };
    var languageKey = function (done, options) {
        done(navigator.language || navigator.userLanguage || navigator.browserLanguage || navigator.systemLanguage || options.NOT_AVAILABLE);
    };
    var colorDepthKey = function (done, options) {
        done(window.screen.colorDepth || options.NOT_AVAILABLE);
    };
    var deviceMemoryKey = function (done, options) {
        done(navigator.deviceMemory || options.NOT_AVAILABLE);
    };
    var pixelRatioKey = function (done, options) {
        done(window.devicePixelRatio || options.NOT_AVAILABLE);
    };
    var screenResolutionKey = function (done, options) {
        done(getScreenResolution(options));
    };
    var getScreenResolution = function (options) {
        var resolution = [window.screen.width, window.screen.height];
        if (options.screen.detectScreenOrientation) {
            resolution.sort().reverse();
        }
        return resolution;
    };
    var availableScreenResolutionKey = function (done, options) {
        done(getAvailableScreenResolution(options));
    };
    var getAvailableScreenResolution = function (options) {
        if (window.screen.availWidth && window.screen.availHeight) {
            var available = [window.screen.availHeight, window.screen.availWidth];
            if (options.screen.detectScreenOrientation) {
                available.sort().reverse();
            }
            return available;
        }
        // headless browsers
        return options.NOT_AVAILABLE;
    };
    var timezoneOffset = function (done) {
        done(new Date().getTimezoneOffset());
    };
    var timezone = function (done, options) {
        if (window.Intl && window.Intl.DateTimeFormat) {
            done(new window.Intl.DateTimeFormat().resolvedOptions().timeZone);
            return;
        }
        done(options.NOT_AVAILABLE);
    };
    var sessionStorageKey = function (done, options) {
        done(hasSessionStorage(options));
    };
    var localStorageKey = function (done, options) {
        done(hasLocalStorage(options));
    };
    var indexedDbKey = function (done, options) {
        done(hasIndexedDB(options));
    };
    var addBehaviorKey = function (done) {
        // body might not be defined at this point or removed programmatically
        done(!!(document.body && document.body.addBehavior));
    };
    var openDatabaseKey = function (done) {
        done(!!window.openDatabase);
    };
    var cpuClassKey = function (done, options) {
        done(getNavigatorCpuClass(options));
    };
    var platformKey = function (done, options) {
        done(getNavigatorPlatform(options));
    };
    var doNotTrackKey = function (done, options) {
        done(getDoNotTrack(options));
    };
    var canvasKey = function (done, options) {
        if (isCanvasSupported()) {
            done(getCanvasFp(options));
            return;
        }
        done(options.NOT_AVAILABLE);
    };
    var webglKey = function (done, options) {
        if (isWebGlSupported()) {
            done(getWebglFp());
            return;
        }
        done(options.NOT_AVAILABLE);
    };
    var webglVendorAndRendererKey = function (done) {
        if (isWebGlSupported()) {
            done(getWebglVendorAndRenderer());
            return;
        }
        done();
    };
    var adBlockKey = function (done) {
        done(getAdBlock());
    };
    var hasLiedLanguagesKey = function (done) {
        done(getHasLiedLanguages());
    };
    var hasLiedResolutionKey = function (done) {
        done(getHasLiedResolution());
    };
    var hasLiedOsKey = function (done) {
        done(getHasLiedOs());
    };
    var hasLiedBrowserKey = function (done) {
        done(getHasLiedBrowser());
    };
    // flash fonts (will increase fingerprinting time 20X to ~ 130-150ms)
    var flashFontsKey = function (done, options) {
        // we do flash if swfobject is loaded
        if (!hasSwfObjectLoaded()) {
            return done("swf object not loaded");
        }
        if (!hasMinFlashInstalled()) {
            return done("flash not installed");
        }
        if (!options.fonts.swfPath) {
            return done("missing options.fonts.swfPath");
        }
        loadSwfAndDetectFonts(function (fonts) {
            done(fonts);
        }, options);
    };
    // kudos to http://www.lalit.org/lab/javascript-css-font-detect/
    var jsFontsKey = function (done, options) {
        // a font will be compared against all the three default fonts.
        // and if it doesn't match all 3 then that font is not available.
        var baseFonts = ["monospace", "sans-serif", "serif"];

        var fontList = [
            "Andale Mono", "Arial", "Arial Black", "Arial Hebrew", "Arial MT", "Arial Narrow", "Arial Rounded MT Bold", "Arial Unicode MS",
            "Bitstream Vera Sans Mono", "Book Antiqua", "Bookman Old Style",
            "Calibri", "Cambria", "Cambria Math", "Century", "Century Gothic", "Century Schoolbook", "Comic Sans", "Comic Sans MS", "Consolas", "Courier", "Courier New",
            "Geneva", "Georgia",
            "Helvetica", "Helvetica Neue",
            "Impact",
            "Lucida Bright", "Lucida Calligraphy", "Lucida Console", "Lucida Fax", "LUCIDA GRANDE", "Lucida Handwriting", "Lucida Sans", "Lucida Sans Typewriter", "Lucida Sans Unicode",
            "Microsoft Sans Serif", "Monaco", "Monotype Corsiva", "MS Gothic", "MS Outlook", "MS PGothic", "MS Reference Sans Serif", "MS Sans Serif", "MS Serif", "MYRIAD", "MYRIAD PRO",
            "Palatino", "Palatino Linotype",
            "Segoe Print", "Segoe Script", "Segoe UI", "Segoe UI Light", "Segoe UI Semibold", "Segoe UI Symbol",
            "Tahoma", "Times", "Times New Roman", "Times New Roman PS", "Trebuchet MS",
            "Verdana", "Wingdings", "Wingdings 2", "Wingdings 3"
        ];

        if (options.fonts.extendedJsFonts) {
            var extendedFontList = [
                "Abadi MT Condensed Light", "Academy Engraved LET", "ADOBE CASLON PRO", "Adobe Garamond", "ADOBE GARAMOND PRO", "Agency FB", "Aharoni", "Albertus Extra Bold", "Albertus Medium", "Algerian", "Amazone BT", "American Typewriter",
                "American Typewriter Condensed", "AmerType Md BT", "Andalus", "Angsana New", "AngsanaUPC", "Antique Olive", "Aparajita", "Apple Chancery", "Apple Color Emoji", "Apple SD Gothic Neo", "Arabic Typesetting", "ARCHER",
                "ARNO PRO", "Arrus BT", "Aurora Cn BT", "AvantGarde Bk BT", "AvantGarde Md BT", "AVENIR", "Ayuthaya", "Bandy", "Bangla Sangam MN", "Bank Gothic", "BankGothic Md BT", "Baskerville",
                "Baskerville Old Face", "Batang", "BatangChe", "Bauer Bodoni", "Bauhaus 93", "Bazooka", "Bell MT", "Bembo", "Benguiat Bk BT", "Berlin Sans FB", "Berlin Sans FB Demi", "Bernard MT Condensed", "BernhardFashion BT", "BernhardMod BT", "Big Caslon", "BinnerD",
                "Blackadder ITC", "BlairMdITC TT", "Bodoni 72", "Bodoni 72 Oldstyle", "Bodoni 72 Smallcaps", "Bodoni MT", "Bodoni MT Black", "Bodoni MT Condensed", "Bodoni MT Poster Compressed",
                "Bookshelf Symbol 7", "Boulder", "Bradley Hand", "Bradley Hand ITC", "Bremen Bd BT", "Britannic Bold", "Broadway", "Browallia New", "BrowalliaUPC", "Brush Script MT", "Californian FB", "Calisto MT", "Calligrapher", "Candara",
                "CaslonOpnface BT", "Castellar", "Centaur", "Cezanne", "CG Omega", "CG Times", "Chalkboard", "Chalkboard SE", "Chalkduster", "Charlesworth", "Charter Bd BT", "Charter BT", "Chaucer",
                "ChelthmITC Bk BT", "Chiller", "Clarendon", "Clarendon Condensed", "CloisterBlack BT", "Cochin", "Colonna MT", "Constantia", "Cooper Black", "Copperplate", "Copperplate Gothic", "Copperplate Gothic Bold",
                "Copperplate Gothic Light", "CopperplGoth Bd BT", "Corbel", "Cordia New", "CordiaUPC", "Cornerstone", "Coronet", "Cuckoo", "Curlz MT", "DaunPenh", "Dauphin", "David", "DB LCD Temp", "DELICIOUS", "Denmark",
                "DFKai-SB", "Didot", "DilleniaUPC", "DIN", "DokChampa", "Dotum", "DotumChe", "Ebrima", "Edwardian Script ITC", "Elephant", "English 111 Vivace BT", "Engravers MT", "EngraversGothic BT", "Eras Bold ITC", "Eras Demi ITC", "Eras Light ITC", "Eras Medium ITC",
                "EucrosiaUPC", "Euphemia", "Euphemia UCAS", "EUROSTILE", "Exotc350 Bd BT", "FangSong", "Felix Titling", "Fixedsys", "FONTIN", "Footlight MT Light", "Forte",
                "FrankRuehl", "Fransiscan", "Freefrm721 Blk BT", "FreesiaUPC", "Freestyle Script", "French Script MT", "FrnkGothITC Bk BT", "Fruitger", "FRUTIGER",
                "Futura", "Futura Bk BT", "Futura Lt BT", "Futura Md BT", "Futura ZBlk BT", "FuturaBlack BT", "Gabriola", "Galliard BT", "Gautami", "Geeza Pro", "Geometr231 BT", "Geometr231 Hv BT", "Geometr231 Lt BT", "GeoSlab 703 Lt BT",
                "GeoSlab 703 XBd BT", "Gigi", "Gill Sans", "Gill Sans MT", "Gill Sans MT Condensed", "Gill Sans MT Ext Condensed Bold", "Gill Sans Ultra Bold", "Gill Sans Ultra Bold Condensed", "Gisha", "Gloucester MT Extra Condensed", "GOTHAM", "GOTHAM BOLD",
                "Goudy Old Style", "Goudy Stout", "GoudyHandtooled BT", "GoudyOLSt BT", "Gujarati Sangam MN", "Gulim", "GulimChe", "Gungsuh", "GungsuhChe", "Gurmukhi MN", "Haettenschweiler", "Harlow Solid Italic", "Harrington", "Heather", "Heiti SC", "Heiti TC", "HELV",
                "Herald", "High Tower Text", "Hiragino Kaku Gothic ProN", "Hiragino Mincho ProN", "Hoefler Text", "Humanst 521 Cn BT", "Humanst521 BT", "Humanst521 Lt BT", "Imprint MT Shadow", "Incised901 Bd BT", "Incised901 BT",
                "Incised901 Lt BT", "INCONSOLATA", "Informal Roman", "Informal011 BT", "INTERSTATE", "IrisUPC", "Iskoola Pota", "JasmineUPC", "Jazz LET", "Jenson", "Jester", "Jokerman", "Juice ITC", "Kabel Bk BT", "Kabel Ult BT", "Kailasa", "KaiTi", "Kalinga", "Kannada Sangam MN",
                "Kartika", "Kaufmann Bd BT", "Kaufmann BT", "Khmer UI", "KodchiangUPC", "Kokila", "Korinna BT", "Kristen ITC", "Krungthep", "Kunstler Script", "Lao UI", "Latha", "Leelawadee", "Letter Gothic", "Levenim MT", "LilyUPC", "Lithograph", "Lithograph Light", "Long Island",
                "Lydian BT", "Magneto", "Maiandra GD", "Malayalam Sangam MN", "Malgun Gothic",
                "Mangal", "Marigold", "Marion", "Marker Felt", "Market", "Marlett", "Matisse ITC", "Matura MT Script Capitals", "Meiryo", "Meiryo UI", "Microsoft Himalaya", "Microsoft JhengHei", "Microsoft New Tai Lue", "Microsoft PhagsPa", "Microsoft Tai Le",
                "Microsoft Uighur", "Microsoft YaHei", "Microsoft Yi Baiti", "MingLiU", "MingLiU_HKSCS", "MingLiU_HKSCS-ExtB", "MingLiU-ExtB", "Minion", "Minion Pro", "Miriam", "Miriam Fixed", "Mistral", "Modern", "Modern No. 20", "Mona Lisa Solid ITC TT", "Mongolian Baiti",
                "MONO", "MoolBoran", "Mrs Eaves", "MS LineDraw", "MS Mincho", "MS PMincho", "MS Reference Specialty", "MS UI Gothic", "MT Extra", "MUSEO", "MV Boli",
                "Nadeem", "Narkisim", "NEVIS", "News Gothic", "News GothicMT", "NewsGoth BT", "Niagara Engraved", "Niagara Solid", "Noteworthy", "NSimSun", "Nyala", "OCR A Extended", "Old Century", "Old English Text MT", "Onyx", "Onyx BT", "OPTIMA", "Oriya Sangam MN",
                "OSAKA", "OzHandicraft BT", "Palace Script MT", "Papyrus", "Parchment", "Party LET", "Pegasus", "Perpetua", "Perpetua Titling MT", "PetitaBold", "Pickwick", "Plantagenet Cherokee", "Playbill", "PMingLiU", "PMingLiU-ExtB",
                "Poor Richard", "Poster", "PosterBodoni BT", "PRINCETOWN LET", "Pristina", "PTBarnum BT", "Pythagoras", "Raavi", "Rage Italic", "Ravie", "Ribbon131 Bd BT", "Rockwell", "Rockwell Condensed", "Rockwell Extra Bold", "Rod", "Roman", "Sakkal Majalla",
                "Santa Fe LET", "Savoye LET", "Sceptre", "Script", "Script MT Bold", "SCRIPTINA", "Serifa", "Serifa BT", "Serifa Th BT", "ShelleyVolante BT", "Sherwood",
                "Shonar Bangla", "Showcard Gothic", "Shruti", "Signboard", "SILKSCREEN", "SimHei", "Simplified Arabic", "Simplified Arabic Fixed", "SimSun", "SimSun-ExtB", "Sinhala Sangam MN", "Sketch Rockwell", "Skia", "Small Fonts", "Snap ITC", "Snell Roundhand", "Socket",
                "Souvenir Lt BT", "Staccato222 BT", "Steamer", "Stencil", "Storybook", "Styllo", "Subway", "Swis721 BlkEx BT", "Swiss911 XCm BT", "Sylfaen", "Synchro LET", "System", "Tamil Sangam MN", "Technical", "Teletype", "Telugu Sangam MN", "Tempus Sans ITC",
                "Terminal", "Thonburi", "Traditional Arabic", "Trajan", "TRAJAN PRO", "Tristan", "Tubular", "Tunga", "Tw Cen MT", "Tw Cen MT Condensed", "Tw Cen MT Condensed Extra Bold",
                "TypoUpright BT", "Unicorn", "Univers", "Univers CE 55 Medium", "Univers Condensed", "Utsaah", "Vagabond", "Vani", "Vijaya", "Viner Hand ITC", "VisualUI", "Vivaldi", "Vladimir Script", "Vrinda", "Westminster", "WHITNEY", "Wide Latin",
                "ZapfEllipt BT", "ZapfHumnst BT", "ZapfHumnst Dm BT", "Zapfino", "Zurich BlkEx BT", "Zurich Ex BT", "ZWAdobeF"];
            fontList = fontList.concat(extendedFontList);
        }

        fontList = fontList.concat(options.fonts.userDefinedFonts);

        // remove duplicate fonts
        fontList = fontList.filter(function (font, position) {
            return fontList.indexOf(font) === position;
        });

        // we use m or w because these two characters take up the maximum width.
        // And we use a LLi so that the same matching fonts can get separated
        var testString = "mmmmmmmmmmlli";

        // we test using 72px font size, we may use any size. I guess larger the better.
        var testSize = "72px";

        var h = document.getElementsByTagName("body")[0];

        // div to load spans for the base fonts
        var baseFontsDiv = document.createElement("div");

        // div to load spans for the fonts to detect
        var fontsDiv = document.createElement("div");

        var defaultWidth = {};
        var defaultHeight = {};

        // creates a span where the fonts will be loaded
        var createSpan = function () {
            var s = document.createElement("span");
            /*
             * We need this css as in some weird browser this
             * span elements shows up for a microSec which creates a
             * bad user experience
             */
            s.style.position = "absolute";
            s.style.left = "-9999px";
            s.style.fontSize = testSize;

            // css font reset to reset external styles
            s.style.fontStyle = "normal";
            s.style.fontWeight = "normal";
            s.style.letterSpacing = "normal";
            s.style.lineBreak = "auto";
            s.style.lineHeight = "normal";
            s.style.textTransform = "none";
            s.style.textAlign = "left";
            s.style.textDecoration = "none";
            s.style.textShadow = "none";
            s.style.whiteSpace = "normal";
            s.style.wordBreak = "normal";
            s.style.wordSpacing = "normal";

            s.innerHTML = testString;
            return s;
        };

        // creates a span and load the font to detect and a base font for fallback
        var createSpanWithFonts = function (fontToDetect, baseFont) {
            var s = createSpan();
            s.style.fontFamily = "'" + fontToDetect + "'," + baseFont;
            return s;
        };

        // creates spans for the base fonts and adds them to baseFontsDiv
        var initializeBaseFontsSpans = function () {
            var spans = [];
            for (var index = 0, length = baseFonts.length; index < length; index++) {
                var s = createSpan();
                s.style.fontFamily = baseFonts[index];
                baseFontsDiv.appendChild(s);
                spans.push(s);
            }
            return spans;
        };

        // creates spans for the fonts to detect and adds them to fontsDiv
        var initializeFontsSpans = function () {
            var spans = {};
            for (var i = 0, l = fontList.length; i < l; i++) {
                var fontSpans = [];
                for (var j = 0, numDefaultFonts = baseFonts.length; j < numDefaultFonts; j++) {
                    var s = createSpanWithFonts(fontList[i], baseFonts[j]);
                    fontsDiv.appendChild(s);
                    fontSpans.push(s);
                }
                spans[fontList[i]] = fontSpans; // Stores {fontName : [spans for that font]}
            }
            return spans;
        };

        // checks if a font is available
        var isFontAvailable = function (fontSpans) {
            var detected = false;
            for (var i = 0; i < baseFonts.length; i++) {
                detected = (fontSpans[i].offsetWidth !== defaultWidth[baseFonts[i]] || fontSpans[i].offsetHeight !== defaultHeight[baseFonts[i]]);
                if (detected) {
                    return detected;
                }
            }
            return detected;
        };

        // create spans for base fonts
        var baseFontsSpans = initializeBaseFontsSpans();

        // add the spans to the DOM
        h.appendChild(baseFontsDiv);

        // get the default width for the three base fonts
        for (var index = 0, length = baseFonts.length; index < length; index++) {
            defaultWidth[baseFonts[index]] = baseFontsSpans[index].offsetWidth; // width for the default font
            defaultHeight[baseFonts[index]] = baseFontsSpans[index].offsetHeight; // height for the default font
        }

        // create spans for fonts to detect
        var fontsSpans = initializeFontsSpans();

        // add all the spans to the DOM
        h.appendChild(fontsDiv);

        // check available fonts
        var available = [];
        for (var i = 0, l = fontList.length; i < l; i++) {
            if (isFontAvailable(fontsSpans[fontList[i]])) {
                available.push(fontList[i]);
            }
        }

        // remove spans from DOM
        h.removeChild(fontsDiv);
        h.removeChild(baseFontsDiv);
        done(available);
    };
    var pluginsComponent = function (done, options) {
        if (isIE()) {
            if (!options.plugins.excludeIE) {
                done(getIEPlugins(options));
            } else {
                done(options.EXCLUDED);
            }
        } else {
            done(getRegularPlugins(options));
        }
    };
    var getRegularPlugins = function (options) {
        if (navigator.plugins == null) {
            return options.NOT_AVAILABLE;
        }

        var plugins = [];
        // plugins isn't defined in Node envs.
        for (var i = 0, l = navigator.plugins.length; i < l; i++) {
            if (navigator.plugins[i]) { plugins.push(navigator.plugins[i]) }
        }

        // sorting plugins only for those user agents, that we know randomize the plugins
        // every time we try to enumerate them
        if (pluginsShouldBeSorted(options)) {
            plugins = plugins.sort(function (a, b) {
                if (a.name > b.name) { return 1 }
                if (a.name < b.name) { return -1 }
                return 0;
            });
        }
        return map(plugins, function (p) {
            var mimeTypes = map(p, function (mt) {
                return [mt.type, mt.suffixes];
            });
            return [p.name, p.description, mimeTypes];
        });
    };
    var getIEPlugins = function (options) {
        var result = [];
        if ((Object.getOwnPropertyDescriptor && Object.getOwnPropertyDescriptor(window, "ActiveXObject")) || ("ActiveXObject" in window)) {
            var names = [
                "AcroPDF.PDF", // Adobe PDF reader 7+
                "Adodb.Stream",
                "AgControl.AgControl", // Silverlight
                "DevalVRXCtrl.DevalVRXCtrl.1",
                "MacromediaFlashPaper.MacromediaFlashPaper",
                "Msxml2.DOMDocument",
                "Msxml2.XMLHTTP",
                "PDF.PdfCtrl", // Adobe PDF reader 6 and earlier, brrr
                "QuickTime.QuickTime", // QuickTime
                "QuickTimeCheckObject.QuickTimeCheck.1",
                "RealPlayer",
                "RealPlayer.RealPlayer(tm) ActiveX Control (32-bit)",
                "RealVideo.RealVideo(tm) ActiveX Control (32-bit)",
                "Scripting.Dictionary",
                "SWCtl.SWCtl", // ShockWave player
                "Shell.UIHelper",
                "ShockwaveFlash.ShockwaveFlash", // flash plugin
                "Skype.Detection",
                "TDCCtl.TDCCtl",
                "WMPlayer.OCX", // Windows media player
                "rmocx.RealPlayer G2 Control",
                "rmocx.RealPlayer G2 Control.1"
            ];
            // starting to detect plugins in IE
            result = map(names, function (name) {
                try {
                    // eslint-disable-next-line no-new
                    new window.ActiveXObject(name);
                    return name;
                } catch (e) {
                    return options.ERROR;
                }
            });
        } else {
            result.push(options.NOT_AVAILABLE);
        }
        if (navigator.plugins) {
            result = result.concat(getRegularPlugins(options));
        }
        return result;
    };
    var pluginsShouldBeSorted = function (options) {
        var should = false;
        for (var i = 0, l = options.plugins.sortPluginsFor.length; i < l; i++) {
            var re = options.plugins.sortPluginsFor[i];
            if (navigator.userAgent.match(re)) {
                should = true;
                break;
            }
        }
        return should;
    };
    var touchSupportKey = function (done) {
        done(getTouchSupport());
    };
    var hardwareConcurrencyKey = function (done, options) {
        done(getHardwareConcurrency(options));
    };
    var hasSessionStorage = function (options) {
        try {
            return !!window.sessionStorage;
        } catch (e) {
            return options.ERROR; // SecurityError when referencing it means it exists
        }
    };

    // https://bugzilla.mozilla.org/show_bug.cgi?id=781447
    var hasLocalStorage = function (options) {
        try {
            return !!window.localStorage;
        } catch (e) {
            return options.ERROR; // SecurityError when referencing it means it exists
        }
    };
    var hasIndexedDB = function (options) {
        try {
            return !!window.indexedDB;
        } catch (e) {
            return options.ERROR; // SecurityError when referencing it means it exists
        }
    };
    var getHardwareConcurrency = function (options) {
        if (navigator.hardwareConcurrency) {
            return navigator.hardwareConcurrency;
        }
        return options.NOT_AVAILABLE;
    };
    var getNavigatorCpuClass = function (options) {
        return navigator.cpuClass || options.NOT_AVAILABLE;
    };
    var getNavigatorPlatform = function (options) {
        if (navigator.platform) {
            return navigator.platform;
        } else {
            return options.NOT_AVAILABLE;
        }
    };
    var getDoNotTrack = function (options) {
        if (navigator.doNotTrack) {
            return navigator.doNotTrack;
        } else if (navigator.msDoNotTrack) {
            return navigator.msDoNotTrack;
        } else if (window.doNotTrack) {
            return window.doNotTrack;
        } else {
            return options.NOT_AVAILABLE;
        }
    };
    // This is a crude and primitive touch screen detection.
    // It's not possible to currently reliably detect the  availability of a touch screen
    // with a JS, without actually subscribing to a touch event.
    // http://www.stucox.com/blog/you-cant-detect-a-touchscreen/
    // https://github.com/Modernizr/Modernizr/issues/548
    // method returns an array of 3 values:
    // maxTouchPoints, the success or failure of creating a TouchEvent,
    // and the availability of the 'ontouchstart' property

    var getTouchSupport = function () {
        var maxTouchPoints = 0;
        var touchEvent;
        if (typeof navigator.maxTouchPoints !== "undefined") {
            maxTouchPoints = navigator.maxTouchPoints;
        } else if (typeof navigator.msMaxTouchPoints !== "undefined") {
            maxTouchPoints = navigator.msMaxTouchPoints;
        }
        try {
            document.createEvent("TouchEvent");
            touchEvent = true;
        } catch (_) {
            touchEvent = false;
        }
        var touchStart = "ontouchstart" in window;
        return [maxTouchPoints, touchEvent, touchStart];
    };
    // https://www.browserleaks.com/canvas#how-does-it-work

    var getCanvasFp = function (options) {
        var result = [];
        // Very simple now, need to make it more complex (geo shapes etc)
        var canvas = document.createElement("canvas");
        canvas.width = 2000;
        canvas.height = 200;
        canvas.style.display = "inline";
        var ctx = canvas.getContext("2d");
        // detect browser support of canvas winding
        // http://blogs.adobe.com/webplatform/2013/01/30/winding-rules-in-canvas/
        // https://github.com/Modernizr/Modernizr/blob/master/feature-detects/canvas/winding.js
        ctx.rect(0, 0, 10, 10);
        ctx.rect(2, 2, 6, 6);
        result.push("canvas winding:" + ((ctx.isPointInPath(5, 5, "evenodd") === false) ? "yes" : "no"));

        ctx.textBaseline = "alphabetic";
        ctx.fillStyle = "#f60";
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = "#069";
        // https://github.com/Valve/fingerprintjs2/issues/66
        if (options.dontUseFakeFontInCanvas) {
            ctx.font = "11pt Arial";
        } else {
            ctx.font = "11pt no-real-font-123";
        }
        ctx.fillText("Cwm fjordbank glyphs vext quiz, \ud83d\ude03", 2, 15);
        ctx.fillStyle = "rgba(102, 204, 0, 0.2)";
        ctx.font = "18pt Arial";
        ctx.fillText("Cwm fjordbank glyphs vext quiz, \ud83d\ude03", 4, 45);

        // canvas blending
        // http://blogs.adobe.com/webplatform/2013/01/28/blending-features-in-canvas/
        // http://jsfiddle.net/NDYV8/16/
        ctx.globalCompositeOperation = "multiply";
        ctx.fillStyle = "rgb(255,0,255)";
        ctx.beginPath();
        ctx.arc(50, 50, 50, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "rgb(0,255,255)";
        ctx.beginPath();
        ctx.arc(100, 50, 50, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "rgb(255,255,0)";
        ctx.beginPath();
        ctx.arc(75, 100, 50, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "rgb(255,0,255)";
        // canvas winding
        // http://blogs.adobe.com/webplatform/2013/01/30/winding-rules-in-canvas/
        // http://jsfiddle.net/NDYV8/19/
        ctx.arc(75, 75, 75, 0, Math.PI * 2, true);
        ctx.arc(75, 75, 25, 0, Math.PI * 2, true);
        ctx.fill("evenodd");

        if (canvas.toDataURL) { result.push("canvas fp:" + canvas.toDataURL()) }
        return result;
    };
    var getWebglFp = function () {
        var gl;
        var fa2s = function (fa) {
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LEQUAL);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            return "[" + fa[0] + ", " + fa[1] + "]";
        };
        var maxAnisotropy = function (gl) {
            var ext = gl.getExtension("EXT_texture_filter_anisotropic") || gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic") || gl.getExtension("MOZ_EXT_texture_filter_anisotropic");
            if (ext) {
                var anisotropy = gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
                if (anisotropy === 0) {
                    anisotropy = 2;
                }
                return anisotropy;
            } else {
                return null;
            }
        };

        gl = getWebglCanvas();
        if (!gl) { return null }
        // WebGL fingerprinting is a combination of techniques, found in MaxMind antifraud script & Augur fingerprinting.
        // First it draws a gradient object with shaders and convers the image to the Base64 string.
        // Then it enumerates all WebGL extensions & capabilities and appends them to the Base64 string, resulting in a huge WebGL string, potentially very unique on each device
        // Since iOS supports webgl starting from version 8.1 and 8.1 runs on several graphics chips, the results may be different across ios devices, but we need to verify it.
        var result = [];
        var vShaderTemplate = "attribute vec2 attrVertex;varying vec2 varyinTexCoordinate;uniform vec2 uniformOffset;void main(){varyinTexCoordinate=attrVertex+uniformOffset;gl_Position=vec4(attrVertex,0,1);}";
        var fShaderTemplate = "precision mediump float;varying vec2 varyinTexCoordinate;void main() {gl_FragColor=vec4(varyinTexCoordinate,0,1);}";
        var vertexPosBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
        var vertices = new Float32Array([-0.2, -0.9, 0, 0.4, -0.26, 0, 0, 0.732134444, 0]);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        vertexPosBuffer.itemSize = 3;
        vertexPosBuffer.numItems = 3;
        var program = gl.createProgram();
        var vshader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vshader, vShaderTemplate);
        gl.compileShader(vshader);
        var fshader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fshader, fShaderTemplate);
        gl.compileShader(fshader);
        gl.attachShader(program, vshader);
        gl.attachShader(program, fshader);
        gl.linkProgram(program);
        gl.useProgram(program);
        program.vertexPosAttrib = gl.getAttribLocation(program, "attrVertex");
        program.offsetUniform = gl.getUniformLocation(program, "uniformOffset");
        gl.enableVertexAttribArray(program.vertexPosArray);
        gl.vertexAttribPointer(program.vertexPosAttrib, vertexPosBuffer.itemSize, gl.FLOAT, !1, 0, 0);
        gl.uniform2f(program.offsetUniform, 1, 1);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexPosBuffer.numItems);
        try {
            result.push(gl.canvas.toDataURL());
        } catch (e) {
            /* .toDataURL may be absent or broken (blocked by extension) */
        }
        result.push("extensions:" + (gl.getSupportedExtensions() || []).join(";"));
        result.push("webgl aliased line width range:" + fa2s(gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE)));
        result.push("webgl aliased point size range:" + fa2s(gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE)));
        result.push("webgl alpha bits:" + gl.getParameter(gl.ALPHA_BITS));
        result.push("webgl antialiasing:" + (gl.getContextAttributes().antialias ? "yes" : "no"));
        result.push("webgl blue bits:" + gl.getParameter(gl.BLUE_BITS));
        result.push("webgl depth bits:" + gl.getParameter(gl.DEPTH_BITS));
        result.push("webgl green bits:" + gl.getParameter(gl.GREEN_BITS));
        result.push("webgl max anisotropy:" + maxAnisotropy(gl));
        result.push("webgl max combined texture image units:" + gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS));
        result.push("webgl max cube map texture size:" + gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE));
        result.push("webgl max fragment uniform vectors:" + gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS));
        result.push("webgl max render buffer size:" + gl.getParameter(gl.MAX_RENDERBUFFER_SIZE));
        result.push("webgl max texture image units:" + gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS));
        result.push("webgl max texture size:" + gl.getParameter(gl.MAX_TEXTURE_SIZE));
        result.push("webgl max varying vectors:" + gl.getParameter(gl.MAX_VARYING_VECTORS));
        result.push("webgl max vertex attribs:" + gl.getParameter(gl.MAX_VERTEX_ATTRIBS));
        result.push("webgl max vertex texture image units:" + gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS));
        result.push("webgl max vertex uniform vectors:" + gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS));
        result.push("webgl max viewport dims:" + fa2s(gl.getParameter(gl.MAX_VIEWPORT_DIMS)));
        result.push("webgl red bits:" + gl.getParameter(gl.RED_BITS));
        result.push("webgl renderer:" + gl.getParameter(gl.RENDERER));
        result.push("webgl shading language version:" + gl.getParameter(gl.SHADING_LANGUAGE_VERSION));
        result.push("webgl stencil bits:" + gl.getParameter(gl.STENCIL_BITS));
        result.push("webgl vendor:" + gl.getParameter(gl.VENDOR));
        result.push("webgl version:" + gl.getParameter(gl.VERSION));

        try {
            // Add the unmasked vendor and unmasked renderer if the debug_renderer_info extension is available
            var extensionDebugRendererInfo = gl.getExtension("WEBGL_debug_renderer_info");
            if (extensionDebugRendererInfo) {
                result.push("webgl unmasked vendor:" + gl.getParameter(extensionDebugRendererInfo.UNMASKED_VENDOR_WEBGL));
                result.push("webgl unmasked renderer:" + gl.getParameter(extensionDebugRendererInfo.UNMASKED_RENDERER_WEBGL));
            }
        } catch (e) { /* squelch */ }

        if (!gl.getShaderPrecisionFormat) {
            loseWebglContext(gl);
            return result;
        }

        each(["FLOAT", "INT"], function (numType) {
            each(["VERTEX", "FRAGMENT"], function (shader) {
                each(["HIGH", "MEDIUM", "LOW"], function (numSize) {
                    each(["precision", "rangeMin", "rangeMax"], function (key) {
                        var format = gl.getShaderPrecisionFormat(gl[shader + "_SHADER"], gl[numSize + "_" + numType])[key];
                        if (key !== "precision") {
                            key = "precision " + key;
                        }
                        var line = ["webgl ", shader.toLowerCase(), " shader ", numSize.toLowerCase(), " ", numType.toLowerCase(), " ", key, ":", format].join("");
                        result.push(line);
                    });
                });
            });
        });
        loseWebglContext(gl);
        return result;
    };
    var getWebglVendorAndRenderer = function () {
        /* This a subset of the WebGL fingerprint with a lot of entropy, while being reasonably browser-independent */
        try {
            var glContext = getWebglCanvas();
            var extensionDebugRendererInfo = glContext.getExtension("WEBGL_debug_renderer_info");
            var params = glContext.getParameter(extensionDebugRendererInfo.UNMASKED_VENDOR_WEBGL) + "~" + glContext.getParameter(extensionDebugRendererInfo.UNMASKED_RENDERER_WEBGL);
            loseWebglContext(glContext);
            return params;
        } catch (e) {
            return null;
        }
    };
    var getAdBlock = function () {
        var ads = document.createElement("div");
        ads.innerHTML = "&nbsp;";
        ads.className = "adsbox";
        var result = false;
        try {
            // body may not exist, that's why we need try/catch
            document.body.appendChild(ads);
            result = document.getElementsByClassName("adsbox")[0].offsetHeight === 0;
            document.body.removeChild(ads);
        } catch (e) {
            result = false;
        }
        return result;
    };
    var getHasLiedLanguages = function () {
        // We check if navigator.language is equal to the first language of navigator.languages
        // navigator.languages is undefined on IE11 (and potentially older IEs)
        if (typeof navigator.languages !== "undefined") {
            try {
                var firstLanguages = navigator.languages[0].substr(0, 2);
                if (firstLanguages !== navigator.language.substr(0, 2)) {
                    return true;
                }
            } catch (err) {
                return true;
            }
        }
        return false;
    };
    var getHasLiedResolution = function () {
        return window.screen.width < window.screen.availWidth || window.screen.height < window.screen.availHeight;
    };
    var getHasLiedOs = function () {
        var userAgent = navigator.userAgent.toLowerCase();
        var oscpu = navigator.oscpu;
        var platform = navigator.platform.toLowerCase();
        var os;
        // We extract the OS from the user agent (respect the order of the if else if statement)
        if (userAgent.indexOf("windows phone") >= 0) {
            os = "Windows Phone";
        } else if (userAgent.indexOf("windows") >= 0 || userAgent.indexOf("win16") >= 0 || userAgent.indexOf("win32") >= 0 || userAgent.indexOf("win64") >= 0 || userAgent.indexOf("win95") >= 0 || userAgent.indexOf("win98") >= 0 || userAgent.indexOf("winnt") >= 0 || userAgent.indexOf("wow64") >= 0) {
            os = "Windows";
        } else if (userAgent.indexOf("android") >= 0) {
            os = "Android";
        } else if (userAgent.indexOf("linux") >= 0 || userAgent.indexOf("cros") >= 0 || userAgent.indexOf("x11") >= 0) {
            os = "Linux";
        } else if (userAgent.indexOf("iphone") >= 0 || userAgent.indexOf("ipad") >= 0 || userAgent.indexOf("ipod") >= 0 || userAgent.indexOf("crios") >= 0 || userAgent.indexOf("fxios") >= 0) {
            os = "iOS";
        } else if (userAgent.indexOf("macintosh") >= 0 || userAgent.indexOf("mac_powerpc)") >= 0) {
            os = "Mac";
        } else {
            os = "Other";
        }
        // We detect if the person uses a touch device
        var mobileDevice = (("ontouchstart" in window) ||
            (navigator.maxTouchPoints > 0) ||
            (navigator.msMaxTouchPoints > 0));

        if (mobileDevice && os !== "Windows" && os !== "Windows Phone" && os !== "Android" && os !== "iOS" && os !== "Other" && userAgent.indexOf("cros") === -1) {
            return true;
        }

        // We compare oscpu with the OS extracted from the UA
        if (typeof oscpu !== "undefined") {
            oscpu = oscpu.toLowerCase();
            if (oscpu.indexOf("win") >= 0 && os !== "Windows" && os !== "Windows Phone") {
                return true;
            } else if (oscpu.indexOf("linux") >= 0 && os !== "Linux" && os !== "Android") {
                return true;
            } else if (oscpu.indexOf("mac") >= 0 && os !== "Mac" && os !== "iOS") {
                return true;
            } else if ((oscpu.indexOf("win") === -1 && oscpu.indexOf("linux") === -1 && oscpu.indexOf("mac") === -1) !== (os === "Other")) {
                return true;
            }
        }

        // We compare platform with the OS extracted from the UA
        if (platform.indexOf("win") >= 0 && os !== "Windows" && os !== "Windows Phone") {
            return true;
        } else if ((platform.indexOf("linux") >= 0 || platform.indexOf("android") >= 0 || platform.indexOf("pike") >= 0) && os !== "Linux" && os !== "Android") {
            return true;
        } else if ((platform.indexOf("mac") >= 0 || platform.indexOf("ipad") >= 0 || platform.indexOf("ipod") >= 0 || platform.indexOf("iphone") >= 0) && os !== "Mac" && os !== "iOS") {
            return true;
        } else if (platform.indexOf("arm") >= 0 && os === "Windows Phone") {
            return false;
        } else if (platform.indexOf("pike") >= 0 && userAgent.indexOf("opera mini") >= 0) {
            return false;
        } else {
            var platformIsOther = platform.indexOf("win") < 0 &&
                platform.indexOf("linux") < 0 &&
                platform.indexOf("mac") < 0 &&
                platform.indexOf("iphone") < 0 &&
                platform.indexOf("ipad") < 0 &&
                platform.indexOf("ipod") < 0;
            if (platformIsOther !== (os === "Other")) {
                return true;
            }
        }

        return typeof navigator.plugins === "undefined" && os !== "Windows" && os !== "Windows Phone";
    };
    var getHasLiedBrowser = function () {
        var userAgent = navigator.userAgent.toLowerCase();
        var productSub = navigator.productSub;

        // we extract the browser from the user agent (respect the order of the tests)
        var browser;
        if (userAgent.indexOf("edge/") >= 0 || userAgent.indexOf("iemobile/") >= 0) {
            // Unreliable, different versions use EdgeHTML, Webkit, Blink, etc.
            return false;
        } else if (userAgent.indexOf("opera mini") >= 0) {
            // Unreliable, different modes use Presto, WebView, Webkit, etc.
            return false;
        } else if (userAgent.indexOf("firefox/") >= 0) {
            browser = "Firefox";
        } else if (userAgent.indexOf("opera/") >= 0 || userAgent.indexOf(" opr/") >= 0) {
            browser = "Opera";
        } else if (userAgent.indexOf("chrome/") >= 0) {
            browser = "Chrome";
        } else if (userAgent.indexOf("safari/") >= 0) {
            if (userAgent.indexOf("android 1.") >= 0 || userAgent.indexOf("android 2.") >= 0 || userAgent.indexOf("android 3.") >= 0 || userAgent.indexOf("android 4.") >= 0) {
                browser = "AOSP";
            } else {
                browser = "Safari";
            }
        } else if (userAgent.indexOf("trident/") >= 0) {
            browser = "Internet Explorer";
        } else {
            browser = "Other";
        }

        if ((browser === "Chrome" || browser === "Safari" || browser === "Opera") && productSub !== "20030107") {
            return true;
        }

        // eslint-disable-next-line no-eval
        var tempRes = eval.toString().length;
        if (tempRes === 37 && browser !== "Safari" && browser !== "Firefox" && browser !== "Other") {
            return true;
        } else if (tempRes === 39 && browser !== "Internet Explorer" && browser !== "Other") {
            return true;
        } else if (tempRes === 33 && browser !== "Chrome" && browser !== "AOSP" && browser !== "Opera" && browser !== "Other") {
            return true;
        }

        // We create an error to see how it is handled
        var errFirefox;
        try {
            // eslint-disable-next-line no-throw-literal
            throw "a";
        } catch (err) {
            try {
                err.toSource();
                errFirefox = true;
            } catch (errOfErr) {
                errFirefox = false;
            }
        }
        return errFirefox && browser !== "Firefox" && browser !== "Other";
    };
    var isCanvasSupported = function () {
        var elem = document.createElement("canvas");
        return !!(elem.getContext && elem.getContext("2d"));
    };
    var isWebGlSupported = function () {
        // code taken from Modernizr
        if (!isCanvasSupported()) {
            return false;
        }

        var glContext = getWebglCanvas();
        var isSupported = !!window.WebGLRenderingContext && !!glContext;
        loseWebglContext(glContext);
        return isSupported;
    };
    var isIE = function () {
        if (navigator.appName === "Microsoft Internet Explorer") {
            return true;
        } else if (navigator.appName === "Netscape" && /Trident/.test(navigator.userAgent)) { // IE 11
            return true;
        }
        return false;
    };
    var hasSwfObjectLoaded = function () {
        return typeof window.swfobject !== "undefined";
    };
    var hasMinFlashInstalled = function () {
        return window.swfobject.hasFlashPlayerVersion("9.0.0");
    };
    var addFlashDivNode = function (options) {
        var node = document.createElement("div");
        node.setAttribute("id", options.fonts.swfContainerId);
        document.body.appendChild(node);
    };
    var loadSwfAndDetectFonts = function (done, options) {
        var hiddenCallback = "___fp_swf_loaded";
        window[hiddenCallback] = function (fonts) {
            done(fonts);
        };
        var id = options.fonts.swfContainerId;
        addFlashDivNode();
        var flashvars = { onReady: hiddenCallback };
        var flashparams = { allowScriptAccess: "always", menu: "false" };
        window.swfobject.embedSWF(options.fonts.swfPath, id, "1", "1", "9.0.0", false, flashvars, flashparams, {});
    };
    var getWebglCanvas = function () {
        var canvas = document.createElement("canvas");
        var gl = null;
        try {
            gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        } catch (e) { /* squelch */ }
        if (!gl) { gl = null }
        return gl;
    };
    var loseWebglContext = function (context) {
        var loseContextExtension = context.getExtension("WEBGL_lose_context");
        if (loseContextExtension != null) {
            loseContextExtension.loseContext();
        }
    };

    var components = [
        { key: "userAgent", getData: UserAgent },
        { key: "webdriver", getData: webdriver },
        { key: "language", getData: languageKey },
        { key: "colorDepth", getData: colorDepthKey },
        { key: "deviceMemory", getData: deviceMemoryKey },
        { key: "pixelRatio", getData: pixelRatioKey },
        { key: "hardwareConcurrency", getData: hardwareConcurrencyKey },
        { key: "screenResolution", getData: screenResolutionKey },
        { key: "availableScreenResolution", getData: availableScreenResolutionKey },
        { key: "timezoneOffset", getData: timezoneOffset },
        { key: "timezone", getData: timezone },
        { key: "sessionStorage", getData: sessionStorageKey },
        { key: "localStorage", getData: localStorageKey },
        { key: "indexedDb", getData: indexedDbKey },
        { key: "addBehavior", getData: addBehaviorKey },
        { key: "openDatabase", getData: openDatabaseKey },
        { key: "cpuClass", getData: cpuClassKey },
        { key: "platform", getData: platformKey },
        { key: "doNotTrack", getData: doNotTrackKey },
        { key: "plugins", getData: pluginsComponent },
        { key: "canvas", getData: canvasKey },
        { key: "webgl", getData: webglKey },
        { key: "webglVendorAndRenderer", getData: webglVendorAndRendererKey },
        { key: "adBlock", getData: adBlockKey },
        { key: "hasLiedLanguages", getData: hasLiedLanguagesKey },
        { key: "hasLiedResolution", getData: hasLiedResolutionKey },
        { key: "hasLiedOs", getData: hasLiedOsKey },
        { key: "hasLiedBrowser", getData: hasLiedBrowserKey },
        { key: "touchSupport", getData: touchSupportKey },
        { key: "fonts", getData: jsFontsKey, pauseBefore: true },
        { key: "fontsFlash", getData: flashFontsKey, pauseBefore: true },
        { key: "audio", getData: audioKey },
        { key: "enumerateDevices", getData: enumerateDevicesKey }
    ];

    var Fingerprint2 = function (options) {
        throw new Error("'new Fingerprint()' is deprecated, see https://github.com/Valve/fingerprintjs2#upgrade-guide-from-182-to-200");
    };

    Fingerprint2.get = function (options, callback) {
        if (!callback) {
            callback = options;
            options = {};
        } else if (!options) {
            options = {};
        }
        extendSoft(options, defaultOptions);
        options.components = options.extraComponents.concat(components);

        var keys = {
            data: [],
            addPreprocessedComponent: function (key, value) {
                if (typeof options.preprocessor === "function") {
                    value = options.preprocessor(key, value);
                }
                keys.data.push({ key: key, value: value });
            }
        };

        var i = -1;
        var chainComponents = function (alreadyWaited) {
            i += 1;
            if (i >= options.components.length) { // on finish
                callback(keys.data);
                return;
            }
            var component = options.components[i];

            if (options.excludes[component.key]) {
                chainComponents(false); // skip
                return;
            }

            if (!alreadyWaited && component.pauseBefore) {
                i -= 1;
                setTimeout(function () {
                    chainComponents(true);
                }, 1);
                return;
            }

            try {
                component.getData(function (value) {
                    keys.addPreprocessedComponent(component.key, value);
                    chainComponents(false);
                }, options);
            } catch (error) {
                // main body error
                keys.addPreprocessedComponent(component.key, String(error));
                chainComponents(false);
            }
        };

        chainComponents(false);
    };

    Fingerprint2.getPromise = function (options) {
        return new Promise(function (resolve, reject) {
            Fingerprint2.get(options, resolve);
        });
    };

    Fingerprint2.getV18 = function (options, callback) {
        if (callback == null) {
            callback = options;
            options = {};
        }
        return Fingerprint2.get(options, function (components) {
            var newComponents = [];
            for (var i = 0; i < components.length; i++) {
                var component = components[i];
                if (component.value === (options.NOT_AVAILABLE || "not available")) {
                    newComponents.push({ key: component.key, value: "unknown" });
                } else if (component.key === "plugins") {
                    newComponents.push({
                        key: "plugins",
                        value: map(component.value, function (p) {
                            var mimeTypes = map(p[2], function (mt) {
                                if (mt.join) { return mt.join("~") }
                                return mt;
                            }).join(",");
                            return [p[0], p[1], mimeTypes].join("::");
                        })
                    });
                } else if (["canvas", "webgl"].indexOf(component.key) !== -1 && Array.isArray(component.value)) {
                    // sometimes WebGL returns error in headless browsers (during CI testing for example)
                    // so we need to join only if the values are array
                    newComponents.push({ key: component.key, value: component.value.join("~") });
                } else if (["sessionStorage", "localStorage", "indexedDb", "addBehavior", "openDatabase"].indexOf(component.key) !== -1) {
                    if (component.value) {
                        newComponents.push({ key: component.key, value: 1 });
                    } else {
                        // skip
                        continue;
                    }
                } else {
                    if (component.value) {
                        newComponents.push(component.value.join ? { key: component.key, value: component.value.join(";") } : component);
                    } else {
                        newComponents.push({ key: component.key, value: component.value });
                    }
                }
            }
            var murmur = x64hash128(map(newComponents, function (component) { return component.value }).join("~~~"), 31);
            callback(murmur, newComponents);
        });
    };

    Fingerprint2.x64hash128 = x64hash128;
    Fingerprint2.VERSION = "2.1.0";
    return Fingerprint2;
});
//FingerPrint2

/*! evtrack -- UI module trackui.js */
(function (window) {

    var document = window.document;

    // Define default events, as if they were set in `settings` object
    var _docEvents = "mousedown mouseup mousemove mouseover mouseout mousewheel ";
    _docEvents += "touchstart touchend touchmove keydown keyup keypress ";
    _docEvents += "click dblclick scroll change select submit reset contextmenu cut copy paste";
    var _winEvents = "load unload beforeunload blur focus resize error online offline";
    // Convert these event lists to actual array lists
    _docEvents = _docEvents.split(" ");
    _winEvents = _winEvents.split(" ");
    // Save a shortcut for "*" events
    var _allEvents = _docEvents.concat(_winEvents);

    var ARGS_SEPARATOR = " " // Arguments separator for the logged data
        ,
        INFO_SEPARATOR = "|||" // This one must match that of save.php (INFSEP)
        ;

    var _uid = 0 // Unique user ID, assigned by the server
        ,
        _time = 0 // Tracking time, for pollingMs
        ,
        _info = [] // Registered information is: cursorId, timestamp, xpos, ypos, event, xpath, attrs
        ;

    /**
     * A small lib to track the user activity by listening to browser events.
     * @author Luis Leiva
     * @version 0.2
     * @requires tracklib.js
     * @license Dual licensed under the MIT and GPL licenses.
     */
    var TrackUI = {
        /**
         * Default settings -- can be overridden on init.
         */
        settings: {
            // The server where logs will be stored.
            postServer: "//my.server.org/save.script",
            // The interval (in seconds) to post data to the server.
            postInterval: 30,
            // Events to be tracked whenever the browser fires them. Default:
            //      mouse-related: "mousedown mouseup mousemove mouseover mouseout mousewheel click dblclick"
            //      touch-related: "touchstart touchend touchmove"
            //   keyboard-related: "keydown keyup keypress"
            //     window-related: "load unload beforeunload blur focus resize error online offline"
            //             others: "scroll change select submit reset contextmenu cut copy paste"
            // If this property is empty, no events will be tracked.
            // Use space-separated values to indicate multiple events, e.g. "click mousemove touchmove".
            // The "*" wildcard can be used to specify all events.
            regularEvents: "*",
            // Events to be polled, because some events are not always needed (e.g. mousemove).
            // If this property is empty (default value), no events will be polled.
            // Use space-separated values to indicate multiple events, e.g. "mousemove touchmove".
            // The "*" wildcard can be used to specify all events.
            // Events in pollingEvents will override those specified in regularEvents.
            // You can leave regularEvents empty and use only pollingEvents, if need be.
            pollingEvents: "",
            // Sampling frequency (in ms) to register events.
            // If set to 0, every single event will be recorded.
            pollingMs: 150,
            // A name that identifies the current task.
            // Useful to filter logs by e.g. tracking campaign ID.
            taskName: "evtrack",
            // A custom function to execute on each recording tick.
            callback: null,
            // Whether to dump element attributes together with each recorded event.
            saveAttributes: true,
            // Main layout content diagramation; a.k.a 'how page content flows'. XXX: Actually not used.
            // Possible values are the following ones:
            //   "left" (fixed), "right" (fixed), "center" (fixed and centered), or "liquid" (adaptable, default behavior).
            layoutType: "liquid",
            // Enable this to display some debug information
            debug: false
        },
        /**
         * Init method. Registers event listeners.
         * @param {object} config  Tracking Settings
         * @return void
         */
        record: function (config) {
            _time = new Date().getTime();
            // Override settings
            for (var prop in TrackUI.settings) {
                if (config.hasOwnProperty(prop) && config[prop] !== null) {
                    TrackUI.settings[prop] = config[prop];
                }
            }
            TrackUI.log("Recording starts...", _time, TrackUI.settings);
            TrackUI.addEventListeners();
            setTimeout(function () {
                TrackUI.initNewData(true);
            }, TrackUI.settings.postInterval * 1000);
        },
        /**
         * Adds required event listeners.
         * @return void
         */
        addEventListeners: function () {
            if (TrackUI.settings.regularEvents == "*") {
                TrackUI.addCustomEventListeners(_allEvents);
            } else {
                TrackUI.log("Settings regular events...");
                TrackUI.settings.regularEvents = TrackUI.settings.regularEvents.split(" ");
                TrackUI.addCustomEventListeners(TrackUI.settings.regularEvents);
            }
            // All events in this set will override those defined in regularEvents
            if (TrackUI.settings.pollingEvents == "*") {
                TrackUI.addCustomEventListeners(_allEvents);
            } else {
                TrackUI.log("Settings polling events...");
                TrackUI.settings.pollingEvents = TrackUI.settings.pollingEvents.split(" ");
                TrackUI.addCustomEventListeners(TrackUI.settings.pollingEvents);
            }
            // Flush data on closing the window/tab
            var unload = (typeof window.onbeforeunload === "function") ? "beforeunload" : "unload";
            TrackLib.Events.add(window, unload, TrackUI.flush);
        },
        /**
         * Adds custom event listeners.
         * @return void
         */
        addCustomEventListeners: function (eventList) {
            TrackUI.log("Adding event listeners:", eventList);
            for (var i = 0; i < eventList.length; ++i) {
                var ev = eventList[i];
                if (!ev) continue;
                if (_docEvents.indexOf(ev) > -1) {
                    TrackLib.Events.add(document, ev, TrackUI.docHandler);
                    TrackUI.log("Adding document event:", ev);
                    // This is for IE compatibility, grrr
                    if (document.attachEvent) {
                        // See http://todepoint.com/blog/2008/02/18/windowonblur-strange-behavior-on-browsers/
                        if (ev == "focus") TrackLib.Events.add(document.body, "focusin", TrackUI.winHandler);
                        if (ev == "blur") TrackLib.Events.add(document.body, "focusout", TrackUI.winHandler);
                    }
                } else if (_winEvents.indexOf(ev) > -1) {
                    TrackLib.Events.add(window, ev, TrackUI.winHandler);
                    TrackUI.log("Adding window event:", ev);
                }
            }
        },
        /**
         * Sets data for the first time for a given user.
         * @param {boolean} async  Whether the request should be asynchronous or not
         * @return void
         */
        initNewData: function (async) {
            var win = TrackLib.Dimension.getWindowSize(),
                doc = TrackLib.Dimension.getDocumentSize(),
                data = {
                    url: encodeURIComponent(window.location.href),
                    screenW: screen.width,
                    screenH: screen.height,
                    winW: win.width,
                    winH: win.height,
                    docW: doc.width,
                    docH: doc.height,
                    info: encodeURIComponent(_info.join(INFO_SEPARATOR)),
                    task: encodeURIComponent(TrackUI.settings.taskName),
                    action: "init",
                }

            //data += "&layout="  + TrackUI.settings.layoutType;
            //data += "&cookies=" + document.cookie;

            // Send request
            //TrackUI.send({
            //    async: async,
            //    postdata: data,
            //    callback: TrackUI.setUserId
            //});
            // Clean up
            _info = [];
            return data;
        },
        /**
         * Sets the user ID, to append data for the same session.
         * @param {string} response  XHR response object
         * @return void
         */
        setUserId: function (xhr) {
            _uid = parseInt(xhr.responseText);
            TrackUI.log("setUserId:", _uid);
            if (_uid) {
                setInterval(function () {
                    TrackUI.appendData(true);
                }, TrackUI.settings.postInterval * 1000);
            }
        },
        /**
         * Continues saving data for the same (previous) user.
         * @param {boolean} async  Whether the request should be asynchronous or not
         * @return void
         */
        appendData: function (async) {
            var data = "uid=" + _uid;
            data += "&info=" + encodeURIComponent(_info.join(INFO_SEPARATOR));
            data += "&action=" + "append";
            // Send request
            TrackUI.send({
                async: async,
                postdata: data
            });
            // Clean up
            _info = [];
        },
        /**
         * A common sending method with CORS support.
         * @param {object} req  Ajax request
         * @return void
         */
        send: function (req) {
            req.url = TrackUI.settings.postServer;
            TrackLib.XHR.sendAjaxRequest(req);
        },
        /**
         * Handles document events.
         * @param {object} e  Event
         * @return void
         */
        docHandler: function (e) {
            if (e.type.indexOf("touch") > -1) {
                TrackUI.touchHandler(e);
            } else {
                TrackUI.eventHandler(e);
            }
        },
        /**
         * Handles window events.
         * @param {object} e  Event
         * @return void
         */
        winHandler: function (e) {
            TrackUI.eventHandler(e);
        },
        /**
         * Generic callback for event listeners.
         * @param {object} e  Event
         * @return void
         */
        eventHandler: function (e) {
            e = TrackLib.Events.fix(e);

            var timeNow = new Date().getTime(),
                eventName = e.type,
                register = true;
            if (TrackUI.settings.pollingMs > 0 && TrackUI.settings.pollingEvents.indexOf(eventName) > -1) {
                register = (timeNow - _time >= TrackUI.settings.pollingMs);
            }

            if (register) {
                var cursorPos = TrackUI.getMousePos(e),
                    elemXpath = TrackLib.XPath.getXPath(e.target),
                    elemAttrs = TrackUI.settings.saveAttributes ? TrackLib.Util.serializeAttrs(e.target) : "{}",
                    extraInfo = {};
                if (typeof TrackUI.settings.callback === "function") {
                    extraInfo = TrackUI.settings.callback(e);
                }
                TrackUI.fillInfo(e.id, timeNow, cursorPos.x, cursorPos.y, eventName, elemXpath, elemAttrs, JSON.stringify(extraInfo));
                _time = timeNow;
            }
        },
        /**
         * Callback for touch event listeners.
         * @param {object} e  Event
         * @return void
         */
        touchHandler: function (e) {
            e = TrackLib.Events.fix(e);

            var touches = e.changedTouches; // better
            if (touches) for (var i = 0, touch; i < touches.length; ++i) {
                touch = touches[i];
                touch.type = e.type;
                TrackUI.eventHandler(touch);
            }
        },
        /**
         * Cross-browser way to register the mouse position.
         * @param {object} e  Event
         * @return {object} Coordinates
         *   @config {int} x Horizontal component
         *   @config {int} y Vertical component
         */
        getMousePos: function (e) {
            e = TrackLib.Events.fix(e);

            var cx = 0,
                cy = 0;
            if (e.pageX || e.pageY) {
                cx = e.pageX;
                cy = e.pageY;
            } else if (e.clientX || e.clientY) {
                cx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                cy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
            }
            // Sometimes the mouse coordinates are negative (e.g., in Opera)
            if (!cx || cx < 0) cx = 0;
            if (!cy || cy < 0) cy = 0;

            return {
                x: cx,
                y: cy
            };
        },
        /**
         * Fills in a log data row.
         * @param {integer} id      Cursor ID
         * @param {integer} time    Current timestamp
         * @param {integer} posX    Cursor X position
         * @param {integer} posY    Cursor Y position
         * @param {string}  event   Related event name
         * @param {string}  xpath   Related element in XPath notation
         * @param {string}  attrs   Serialized node attributes
         * @return void
         */
        fillInfo: function () {
            var args = [].slice.apply(arguments);
            _info.push(args.join(ARGS_SEPARATOR));
            TrackUI.log(args);
        },
        /**
         * Transmit remaining (if any) data to server.
         * @param {object} e  Event
         * @return void
         */
        flush: function (e) {
            TrackUI.log("Flushing data...", _uid);
            var i;
            for (i = 0; i < _docEvents.length; ++i) {
                TrackLib.Events.remove(document, _docEvents[i], TrackUI.docHandler);
            }
            for (i = 0; i < _winEvents.length; ++i) {
                TrackLib.Events.remove(window, _winEvents[i], TrackUI.winHandler);
            }
            // Don't use asynchronous requests here, otherwise this won't work
            if (_uid) {
                TrackUI.appendData(false);
            } else {
                TrackUI.initNewData(false);
            }
        },

        log: function () {
            if (TrackUI.settings.debug && typeof console.log === "function") {
                console.log.apply(console, arguments);
            }
        }

    };

    // Expose
    window.TrackUI = TrackUI;

})(this);

/*! evtrack -- Lib module tracklib.js */

/**
 * Auxiliary functions to track the user activity.
 * @author Luis Leiva
 * @version 0.2
 * @license Dual licensed under the MIT and GPL licenses.
 */
var TrackLib = window.TrackLib || {};
/**
 * XPath functions.
 * Not documented yet.
 * Code adapted from window.js @ http://code.google.com/p/xpathchecker/
 * @author Brian Slesinsky (http://slesinsky.org)
 */
TrackLib.XPath = {

    queryXPath: function (document, xpath) {
        var iterator;
        if (typeof document.evaluate === "function") {
            iterator = document.evaluate(xpath, document.documentElement, null, XPathResult.ANY_TYPE, null);
        } else {
            try {
                // IE5 and later has implemented that [0] should be the first node,
                // but according to the W3C standard it should have been [1]!
                document.setProperty("SelectionLanguage", "XPath");
                iterator = document.selectNodes(xpath);
            } catch (err) {
                iterator = false;
            }
        }

        return iterator;
    },

    getXPathNodes: function (document, xpath) {
        var iterator = this.queryXPath(document, xpath);
        var result = [];
        var item = iterator.iterateNext();
        while (item) {
            result.push(item);
            item = iterator.iterateNext();
        }

        return result;
    },

    getXPath: function (targetNode, absolute) {
        var lowerCase = (targetNode.ownerDocument instanceof HTMLDocument)
            , xNodePath = this.getNodePath(targetNode, absolute)
            , nodeNames = []
            ;
        for (var i in xNodePath) {
            var node = xNodePath[i]
                , nIdx
                ;
            if (node.nodeType == 1) {
                if (i == 0 && !absolute && node.hasAttribute("id")) {
                    nodeNames.push("/*[@id='" + node.getAttribute("id") + "']");
                } else {
                    var tagName = node.tagName;
                    if (lowerCase) {
                        tagName = tagName.toLowerCase();
                    }
                    nIdx = this.getNodeIndex(node);
                    if (nIdx != null) {
                        nodeNames.push(tagName + "[" + nIdx + "]");
                    } else {
                        nodeNames.push(tagName);
                    }
                }
            } else if (node.nodeType == 3) {
                nIdx = this.getTextNodeIndex(node);
                if (nIdx != null) {
                    nodeNames.push("text()[" + nIdx + "]");
                } else {
                    nodeNames.push("text()");
                }
            }
        }

        return "/" + nodeNames.join("/");
    },

    getNodeIndex: function (node) {
        if (node.nodeType != 1 || node.parentNode == null) return null;
        var list = this.getChildNodesWithTagName(node.parentNode, node.tagName);
        if (list.length == 1 && list[0] == node) return null;
        for (var i = 0; i < list.length; i++) {
            if (list[i] == node) return i + 1;
        }

        throw new Error("couldn't find node in parent's list: " + node.tagName);
    },

    getTextNodeIndex: function (node) {
        var list = this.getChildTextNodes(node.parentNode)
        if (list.length == 1 && list[0] == node) return null;
        for (var i = 0; i < list.length; i++) {
            if (list[i] == node) return i + 1;
        }

        throw new Error("couldn't find node in parent's list: " + node.tagName);
    },

    getChildNodesWithTagName: function (parent, tagName) {
        var result = [], child = parent.firstChild;
        while (child != null) {
            if (child.tagName && child.tagName == tagName) {
                result.push(child);
            }
            child = child.nextSibling;
        }

        return result;
    },

    getChildTextNodes: function (parent) {
        var result = [], child = parent.firstChild;
        while (child != null) {
            if (child.nodeType == 3) {
                result.push(child);
            }
            child = child.nextSibling;
        }

        return result;
    },

    getNodePath: function (node, absolute) {
        var result = [];
        while (node.nodeType == 1 || node.nodeType == 3) {
            result.unshift(node);
            if (node.nodeType == 1 && node.hasAttribute("id") && !absolute) return result;
            node = node.parentNode;
        }

        return result;
    },

    getNodeValues: function (resultList) {
        var result = [];
        for (var i in resultList) {
            result.push(resultList[i].nodeValue);
        }

        return result;
    }

};
/**
 * Ajax handling object.
 */
TrackLib.XHR = {
    /**
     * Creates an XML/HTTP request to provide async communication with the server.
     * @return {object} XHR object
     * @autor Peter-Paul Koch (http://quirksMode.org)
     */
    createXMLHTTPObject: function () {
        var xmlhttp = false;
        // Current AJAX flavors
        var factories = [
            function () { return new XMLHttpRequest(); },
            function () { return new ActiveXObject("Msxml2.XMLHTTP"); },
            function () { return new ActiveXObject("Msxml3.XMLHTTP"); },
            function () { return new ActiveXObject("Microsoft.XMLHTTP"); }
        ];
        // Check AJAX flavor
        for (var i = 0; i < factories.length; ++i) {
            try {
                xmlhttp = factories[i]();
            } catch (e) { continue; }
            break;
        }

        return xmlhttp;
    },
    /**
     * Makes an asynchronous XMLHTTP request (XHR) via GET or POST.
     * Inspired by Peter-Paul Koch's XMLHttpRequest function.
     * Note: CORS on IE will work only for version 8 or higher.
     * @return void
     * @param  {object} setup Request properties
     *    @config {string}    url       Request URL
     *    @config {boolean}  [async]    Asynchronous request (or not)
     *    @config {function} [callback] Response function
     *    @config {string}   [postdata] POST vars in the form "var1=name&var2=name..."
     *    @config {object}   [xmlhttp]  A previous XMLHTTP object can be reused
     */
    sendAjaxRequest: function (setup) {
        // Create XHR object or reuse it
        var request = setup.xmlhttp ? setup.xmlhttp : this.createXMLHTTPObject();
        var cors = !TrackLib.Util.sameDomain(window.location.href, setup.url);
        // CORS does work with XMLHttpRequest on modern browsers, except IE
        if (cors && window.XDomainRequest) {
            request = new XDomainRequest();
        }
        if (!request) return false;

        var method = setup.postdata ? "POST" : "GET";
        var asynchronous = setup.hasOwnProperty("async") ? setup.async : true;
        // Start request
        request.open(method, setup.url, asynchronous);

        var iecors = window.XDomainRequest && (request instanceof XDomainRequest);
        // Post requests must set the correct content type (not allowed under CORS + IE, though)
        if (setup.postdata && !iecors) {
            request.setRequestHeader("Content-Type", "application/json");
        }
        // Add load listener
        if (iecors) {
            request.onload = function () {
                if (typeof setup.callback === "function") setup.callback(request);
            };
        } else {
            // Check for the 'complete' request state
            request.onreadystatechange = function () {
                if (request.readyState == 4 && typeof setup.callback === "function") {
                    setup.callback(request);
                }
            };
        }
        var jsonData = JSON.stringify(setup.postdata)
        request.send(jsonData);
    }
};
/**
 * Event handling object.
 */
TrackLib.Events = {
    /**
     * Adds event listeners unobtrusively.
     * @author John Resig (http://ejohn.org)
     * @param {object}    obj   Object to add listener(s) to.
     * @param {string}    type  Event type.
     * @param {function}  fn    Function to execute.
     * @return void
     */
    add: function (obj, type, fn) {
        if (!obj) return false;
        if (obj.addEventListener) { // W3C standard
            obj.addEventListener(type, fn, false);
        } else if (obj.attachEvent) { // IE versions
            obj.attachEvent("on" + type, fn);
        } else { // Really old browser
            obj[type + fn] = function () { fn(window.event); };
        }
    },
    /**
     * Removes event listeners unobtrusively.
     * @author John Resig (http://ejohn.org)
     * @param {object}    obj   Object to remove listener(s) from
     * @param {string}    type  Event type
     * @param {function}  fn    Function to remove from event
     * @return void
     */
    remove: function (obj, type, fn) {
        if (!obj) return false;
        if (obj.removeEventListener) { // W3C standard
            obj.removeEventListener(type, fn, false);
        } else if (obj.detachEvent) { // IE versions
            obj.detachEvent("on" + type, fn);
        } else { // Really old browser
            obj[type + fn] = null;
        }
    },
    /**
     * Fixes event handling inconsistencies between browsers.
     * @param {object}  e Event
     * @return {object}   Fixed event
     */
    fix: function (e) {
        e = e || window.event;
        // Fix target property, if necessary (IE 6/7/8 & Safari 2)
        if (!e.target) e.target = e.srcElement || document;
        // Target should not be a text node (Safari bug)
        if (e.target.nodeType == 3) e.target = e.target.parentNode;
        // For mouse/key events; add metaKey if it's not there (IE 6/7/8)
        if (typeof e.metaKey === "undefined") e.metaKey = e.ctrlKey;
        // Support multitouch events (index 0 is consistent with mobile devices)
        e.id = e.identifier || 0;

        return e;
    },
    /**
     * Executes callback on DOM load.
     * @param {function} callback
     * @return void
     */
    domReady: function (callback) {
        if (document.addEventListener) {
            // W3C browsers
            document.addEventListener("DOMContentLoaded", callback, false);
        }
        else if (document.attachEvent) {
            // Internet Explorer ��
            try {
                document.write("<scr" + "ipt id=__ie_onload defer=true src=//:><\/scr" + "ipt>");
                var script = document.getElementById("__ie_onload");
                script.onreadystatechange = function () {
                    if (this.readyState === "complete") { callback(); }
                };
            } catch (err) { }
        }
        else {
            // Really old browsers
            TrackLib.Events.add(window, "load", callback);
        }
    }

};
/**
 * Dimension handling object.
 */
TrackLib.Dimension = {
    /**
     * Gets the browser's window size (aka 'the viewport').
     * @return {object} window dimmensions
     *    @config {integer} width
     *    @config {integer} height
     */
    getWindowSize: function () {
        var d = document;
        var w = (window.innerWidth) ? window.innerWidth
            : (d.documentElement && d.documentElement.clientWidth) ? d.documentElement.clientWidth
                : (d.body && d.body.clientWidth) ? d.body.clientWidth
                    : 0;
        var h = (window.innerHeight) ? window.innerHeight
            : (d.documentElement && d.documentElement.clientHeight) ? d.documentElement.clientHeight
                : (d.body && d.body.clientHeight) ? d.body.clientHeight
                    : 0;

        return { width: w, height: h };
    },
    /**
     * Gets the document's size.
     * @return {object} document dimensions
     *    @config {integer} width
     *    @config {integer} height
     */
    getDocumentSize: function () {
        var d = document;
        var w = (window.innerWidth && window.scrollMaxX) ? window.innerWidth + window.scrollMaxX
            : (d.body && d.body.scrollWidth > d.body.offsetWidth) ? d.body.scrollWidth
                : (d.body && d.body.offsetWidth) ? d.body.offsetWidth
                    : 0;
        var h = (window.innerHeight && window.scrollMaxY) ? window.innerHeight + window.scrollMaxY
            : (d.body && d.body.scrollHeight > d.body.offsetHeight) ? d.body.scrollHeight
                : (d.body && d.body.offsetHeight) ? d.body.offsetHeight
                    : 0;

        return { width: w, height: h };
    },
    /**
     * Gets the max value from both window (viewport's size) and document's size.
     * @return {object} viewport dimensions
     *    @config {integer} width
     *    @config {integer} height
     */
    getPageSize: function () {
        var win = this.getWindowSize(),
            doc = this.getDocumentSize();

        // Find max values from this group
        var w = (doc.width < win.width) ? win.width : doc.width;
        var h = (doc.height < win.height) ? win.height : doc.height;

        return { width: w, height: h };
    }

};
/**
 * Some utilies.
 */
TrackLib.Util = {
    /**
     * Tests whether a set of URLs come from the same domain.
     * @return {boolean}
     */
    sameDomain: function () {
        var prevDomain, sameDomain = true;
        for (var i = 0, l = arguments.length; i < l; ++i) {
            if (i > 0) {
                sameDomain = (this.getDomain(prevDomain) == this.getDomain(arguments[i]));
            }
            prevDomain = arguments[i];
        }

        return sameDomain;
    },
    /**
     * Gets the domain of a given URL.
     * @return {string}
     */
    getDomain: function (url) {
        var d, link = document.createElement("a");
        link.href = url;
        d = link.hostname;
        link = null; // free

        return d;
    },
    /**
     * Serializes the attributes of a DOM node.
     * @param {object} elem  DOM node
     * @return {string} JSON representation of the node attributes
     */
    serializeAttrs: function (elem) {
        var obj = {};
        if (elem && elem.attributes) {
            obj[elem.nodeName] = {};
            for (var i = 0, t = elem.attributes.length; i < t; i++) {
                var attrib = elem.attributes[i];
                if (attrib.specified) {
                    obj[elem.nodeName][attrib.name] = attrib.value;
                }
            }
        }

        return JSON.stringify(obj);
    }

};

// Initialize Fingerprint2

var fingerPringOptions = {
    preprocessor: null,
    audio: {
        timeout: 1000,
        // On iOS 11, audio context can only be used in response to user interaction.
        // We require users to explicitly enable audio fingerprinting on iOS 11.
        // See https://stackoverflow.com/questions/46363048/onaudioprocess-not-called-on-ios11#46534088
        excludeIOS11: true
    },
    fonts: {
        swfContainerId: "fingerprintjs2",
        swfPath: "flash/compiled/FontList.swf",
        userDefinedFonts: [],
        extendedJsFonts: false
    },
    screen: {
        // To ensure consistent fingerprints when users rotate their mobile devices
        detectScreenOrientation: true
    },
    plugins: {
        sortPluginsFor: [/palemoon/i],
        excludeIE: false
    },
    extraComponents: [],
    excludes: {
        // Unreliable on Windows, see https://github.com/Valve/fingerprintjs2/issues/375
        'enumerateDevices': true,
        // devicePixelRatio depends on browser zoom, and it's impossible to detect browser zoom
        'pixelRatio': true,
        // DNT depends on incognito mode for some browsers (Chrome) and it's impossible to detect incognito mode
        'doNotTrack': true,
        // uses js fonts already
        'fontsFlash': true
    },
    NOT_AVAILABLE: "not available",
    ERROR: "error",
    EXCLUDED: "excluded"
};

// DEFINE OUR VARS
window.CID = null;
window.UTMPARAMS = [];

// Parse UTMS
var parseUtms = function () {
    // substring example: ?utm_source=SourceName&utm_medium=cpc&utm_campaign=name&utm_term=term&utm_content=content
    let utmQuery = decodeURIComponent(window.location.search.substring(1)),
        utmVariables = utmQuery.split("&"),
        ParameterName,
        i;

    const getUTMValue = (inputParameter) => {
        for (i = 0; i < utmVariables.length; i++) {
            ParameterName = utmVariables[i].split("=");
            if (ParameterName[0] === inputParameter) {
                return ParameterName[1] === null ? null : ParameterName[1];
            }
        }
    }

    const valueExists = (value) => {
        return (value != null && value !== "" && value != undefined);
    }

    const utmParams = [
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_content",
        "utm_term"
    ];

    utmParams.forEach(param => {
        var pValue = getUTMValue(param);
        if (valueExists(pValue)) {
            //window.UTMPARAMS.push({ [param]: pValue });
            window.UTMPARAMS.push(pValue);
        };
    });
}
parseUtms();

var timestamp;
if (document.referrer === "" || !window.CTURL.includes(document.referrer.split("/")[2])) {
    timestamp = Date.now();
    localStorage.setItem("cleantrafficsessionid", timestamp);
} else {
    timestamp = localStorage.getItem("cleantrafficsessionid");
}
var identified = false;

// Initialize Fingerprint
if ((location.origin).localeCompare(window.CTURL) === 0) {
    var fingerprintReport = function () {
        if (identified === true) return;
        Fingerprint2.get(function (components) {
            var murmur = Fingerprint2.x64hash128(components.map(function (pair) { return pair.value }).join(), 31);

            window.CID = murmur;

            components.push({ "CID": murmur });
            components.push({ "url": window.location.href });
            components.push({ "referrer": document.referrer });
            components.push(...window.UTMPARAMS);

            var JsonArray = JSON.stringify(components);
            var obj = JSON.parse(JsonArray);

            //Better for json
            var jsonComponents = {
                sessionId: timestamp,
                UserAgent: obj[0].value,
                Webdriver: obj[1].value,
                Language: obj[2].value,
                ColorDepth: obj[3].value,
                DeviceMemory: obj[4].value,
                HardwareConcurrency: obj[5].value,
                ScreenResolution: obj[6].value,
                AvailableScreenResolution: obj[7].value,
                TimezoneOffset: obj[8].value,
                Timezone: obj[9].value,
                SessionStorage: obj[10].value,
                LocalStorage: obj[11].value,
                IndexedDb: obj[12].value,
                AddBehavior: obj[13].value,
                OpenDatabase: obj[14].value,
                CpuClass: obj[15].value,
                Platform: obj[16].value,
                Plugins: obj[17].value,
                WebglVendorAndRenderer: obj[20].value,
                AdBlock: obj[21].value,
                HasLiedLanguages: obj[22].value,
                HasLiedResolution: obj[23].value,
                HasLiedOs: obj[24].value,
                HasLiedBrowser: obj[25].value,
                TouchSupport: obj[26].value,
                Fonts: obj[27].value,
                Audio: obj[28].value,
                CID: murmur,
                Url: window.location.href,
                Referrer: document.referrer,
                UtmSource: obj[32],
                UtmMedium: obj[33],
                UtmCampaign: obj[34],
                UtmContent: obj[35],
                UtmTerm: obj[36]
            }

            var url = serverUrl + "/api/identified";
            sendData(url, JSON.stringify(jsonComponents), false);
            identified = true;
        });
    };

    setTimeout(fingerprintReport, 0);
}

if (window.CTDEBUG === true) {
    serverUrl = "http://localhost:7071"; //port 57603
} else {
    serverUrl = "https://ctserverlessgateway.azurewebsites.net";
}

function sendData(url, data, async) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, async);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(data);
    return xhr.response;
}

// Initialize Tracker

// Array for observed events
var observedEvents = [];

console.log("origin: " + location.origin); //TODO: Remove debug
console.log("cturl: " + window.CTURL); //TODO: Remove debug
console.log("compare: " + (location.origin).localeCompare(window.CTURL)); //TODO: Remove debug

if ((location.origin).localeCompare(window.CTURL) === 0) {

    (function () {

        var callbackFunc = function (event) {

            var xPath = [];

            if (event.path) {
                var p = event.path.pop();

                for (var i = 0; i < event.path.length; i++) {
                    if (event.path[i] != p) {
                        xPath.push(event.path[i].nodeName);
                    }
                }
            } else {
                xPath.push(event.target.nodeName + "| XPath not available");
            }

            var attributes = [];

            if (event.target.attributes != undefined) {
                for (var i = 0; i < event.target.attributes.length; i++) {
                    var a = '{' + event.target.attributes[i].name + '": "' + event.target.attributes[i].value + '"}';
                    attributes.push(a);
                }
            }

            var trackedMouseEvent = {
                SessionId: timestamp,
                Cursor: event.id,
                Timestamp: parseInt(event.timeStamp),
                XPos: event.x != undefined ? event.x : null,
                YPos: event.y != undefined ? event.y : null,
                Event: event.type,
                XPath: xPath,
                Attrs: attributes,
                CID: window.CID != undefined ? window.CID : null,
                CtUrl: window.CTURL,
                TrackedUrl: window.location.href,
                CtApiKey: window.CTAPIKEY
            };

            if (identified === true && window.CID !== null) {
                observedEvents.push(trackedMouseEvent);
            }
        }

        var sendTrackedData = function () {
            var url = serverUrl + "/api/observed";

            if (observedEvents.length > 0) {
                sendData(url, JSON.stringify(observedEvents), true);
                observedEvents = [];
            }
        }

        setInterval(sendTrackedData, 300);

        TrackUI.record({
            // The server where logs will be stored.
            postServer: serverUrl + "/api/observed",
            // The interval (in seconds) to post data to the server.
            postInterval: 0.3,
            // Events to be tracked whenever the browser fires them. Default:
            //      mouse-related: "mousedown mouseup mousemove mouseover mouseout mousewheel click dblclick"
            //      touch-related: "touchstart touchend touchmove"
            //   keyboard-related: "keydown keyup keypress"
            //     window-related: "load unload beforeunload blur focus resize error online offline"
            //             others: "scroll change select submit reset contextmenu cut copy paste"
            // If this property is empty, no events will be tracked.
            // Use space-separated values to indicate multiple events, e.g. "click mousemove touchmove".
            // The "*" wildcard can be used to specify all events.
            regularEvents: "*",
            // Events to be polled, because some events are not always needed (e.g. mousemove).
            // If this property is empty (default value), no events will be polled.
            // Use space-separated values to indicate multiple events, e.g. "mousemove touchmove".
            // The "*" wildcard can be used to specify all events.
            // Events in pollingEvents will override those specified in regularEvents.
            // You can leave regularEvents empty and use only pollingEvents, if need be.
            pollingEvents: "",
            // Sampling frequency (in ms) to register events.
            // If set to 0, every single event will be recorded.
            pollingMs: 300,
            // A name that identifies the current task.
            // Useful to filter logs by e.g. tracking campaign ID.
            taskName: "evtrack",
            // A custom function to execute on each recording tick.
            callback: callbackFunc,
            // Whether to dump element attributes together with each recorded event.
            saveAttributes: true,
            // Enable this to display some debug information
            debug: false
        });
    })();
}

