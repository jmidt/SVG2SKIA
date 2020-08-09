'use strict'

/****
 * A custom entry point for the SVGO tool.
 * Runs the SVG2JS modules and selected plugins, but does not transform back to SVG.
 * Instead it runs a custom SVG2SKIA module
 */

const fs = require("fs");

var YAML = require('js-yaml'),
    PATH = require('path'),
    CONFIG = require('../svgo/lib/svgo/config.js'),
    SVG2JS = require('../svgo/lib/svgo/svg2js.js'),
    JS2SVG = require('../svgo/lib/svgo/js2svg.js'),
    PLUGINS = require('../svgo/lib/svgo/plugins.js'),
    JSAPI = require('../svgo/lib/svgo/jsAPI.js'),
    JS2SKIA = require('./js2skia.js')
    
var extendstr = fs.readFileSync(PATH.resolve(__dirname, '../bin/otto.config'))
var extended_config = YAML.safeLoad(extendstr)
var config = CONFIG(extended_config)

module.exports.run = function() {
  const data = fs.readFileSync("/dev/stdin", "utf-8");
  _optimizeOnce(data)
}

function _optimizeOnce(svgstr) {

    SVG2JS(svgstr, function(svgjs) {
        if (svgjs.error) {
            console.log(svgjs.error);
            return;
        }

        svgjs = PLUGINS(svgjs, {}, config.plugins);
        
        JS2SKIA(svgjs);
        //console.log(svgjs);
        console.log(JS2SVG(svgjs, config.js2svg))
        
    });
};