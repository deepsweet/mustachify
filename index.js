var path = require('path'),
    through = require('through2'),
    extend = require('extend'),
    Hogan = require('hogan.js'),
    htmlMinifier = require('html-minifier').minify;

var // default config
    defaults = {
        extension: '.html',
        // https://github.com/kangax/html-minifier#options-quick-reference
        minify: {
            removeComments: true,
            removeCommentsFromCDATA: true,
            removeCDATASectionsFromCDATA: true,
            collapseWhitespace: true,
            conservativeCollapse: false,
            preserveLineBreaks: false,
            collapseBooleanAttributes: true,
            removeAttributeQuotes: false,
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

    // get options
    options = extend(true, {}, defaults, options);

    if (path.extname(file) !== options.extension) {
        return through();
    }

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
