'use strict'

module.exports = function(svgjs) {
  // Visit the entire tree
  var visit_node = function(node) {
    // Read node attributes
    console.log(node["elem"])

    // Visit children or stop
    const children = node["content"] || []
    for (let child of children) {
      visit_node(child);
    }
    return;
    
  }

  visit_node(svgjs);
  console.log(i);
} 