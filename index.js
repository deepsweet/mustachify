var path = require('path'),
    through = require('through2'),
    extend = require('extend'),
    Hogan = require('hogan.js'),
    htmlMinifier = require('html-minifier').minify;

    // possible extensions
var extensions = [ '.hogan', '.mustache', '.html' ],
    // default config
    defaults = {
        // https://github.com/kangax/html-minifier#options-quick-reference
        minify: {
            removeComments: true,
            removeCommentsFromCDATA: true,
            removeCDATASectionsFromCDATA: true,
            collapseWhitespace: true,
            conservativeCollapse: false,
            preserveLineBreaks: false,
            collapseBooleanAttributes: true,
            removeAttributeQuotes: true,
            removeRedundantAttributes: false,
            removeEmptyAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true,
            removeOptionalTags: false,
            removeEmptyElements: false,
            keepClosingSlash: true,
            caseSensitive: true,
            minifyJS: false,
            minifyCSS: false,
            minifyURLs: false
        }
    };

module.exports = function (file, options) {

    if (extensions.indexOf(path.extname(file)) === -1) {
        return through();
    }

    // get options
    options = extend(true, {}, defaults, options);

    var buffer = '';

    function write(chunk, enc, next) {
        buffer += chunk;
        next();
    }

    function end() {

        var template,
            compiled;

        // minify
        if (options.minify !== false) {
            buffer = htmlMinifier(buffer, options.minify);
        }

        // compile the template
        template = Hogan.compile(buffer, { asString: true }),
        // wrap it
        compiled = 'var Hogan = require("hogan.js");' +
                   'module.exports = new Hogan.Template(' + template + ');';

        this.push(compiled);
        this.push(null);

    }

    return through(write, end);

};
