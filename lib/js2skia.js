'use strict'

const { pathElems } = require("../svgo/plugins/_collections")

module.exports = function(svgjs) {
  var visit_node = function(node) {
    var draw_node;
    // Read node attributes
    const attrs = node["attrs"] || []
    for (let attr in attrs) {
      parse_attribute(attrs[attr])
    }
    // Read node element
    parse_element(node["elem"])
    
    // Visit children or stop
    const children = node["content"] || []
    for (let child of children) {
      visit_node(child);
    }
    return;
  }

  var parse_element = function(elem) {
    switch (elem) {
      case 'g':
        console.log("// New Group //");
        return;
      case 'l':
        console.log("// New Layer //");
      case 'rect':
        console.log("Drawing rectangle");
        return;
      default:
        return;
    }
  }

  var parse_attribute = function(attr) {
    console.log(attr);
    return;
  }

  // Preamble
  console.log("SkPath path;")
  console.log("SkPaint paint;")
  // Visit tree
  visit_node(svgjs);
  // Clean-up, if any

} 