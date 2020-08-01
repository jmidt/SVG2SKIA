'use strict'

const { pathElems } = require("../svgo/plugins/_collections")

module.exports = function(svgjs) {
  var visit_node = function(node) {
    var parse_root = function(attrs) {
      console.log("SkPath path;")
      console.log("SkPaint paint;")
    }

    var parse_group = function(attrs) {
      console.log("// NEW GROUP //");
    }

    var parse_rect = function(attrs) {
      // Draw rectangle
      console.log('paint.setStyle(SkPaint::kStroke_Style);')
      console.log('ctx.drawRect({' + attrs['x'].value + ',' + attrs['y'].value + ',' + attrs['width'].value + ',' + attrs['height'].value + '}, paint)')
      // (Possibly) draw fill
      console.log('paint.setStyle(SkPaint::kFill_Style);')
      if (attrs['fill'] == undefined) {
        // Fill in stroke colour 
        console.log('ctx.drawRect({' + attrs['x'].value + ',' + attrs['y'].value + ',' + attrs['width'].value + ',' + attrs['height'].value + '}, paint)')
      } else if (attrs['fill'].value == 'none') {
        // No fill
      } else {
        // Fill in other colour
        console.log('paint.setColour(' + attrs['fill'].value + ');')
        console.log('ctx.drawRect({' + attrs['x'].value + ',' + attrs['y'].value + ',' + attrs['width'].value + ',' + attrs['height'].value + '}, paint)')
      }
    }

    var parse_styles = function(attrs) {
      for (const attrkey in attrs) {
        const attr = attrs[attrkey]
        switch (attr.name) {
          case 'stroke': console.log('paint.setColor(' + attr.value + ');'); break;
          case 'stroke-width': console.log('paint.setStrokeWidth(' + attr.value + ');'); break;
          case 'stroke-linecap': {
            if (attr.value == 'round') console.log('paint.setStrokeCap(SkPaint::kRound_Cap);');
            break;
          }
          case 'stroke-linejoin': {
            if (attr.value == 'round') console.log('paint.setStrokeJoin(skPaint::kRound_Join);');
            break;
          }

        }
      } 
    }

    // Parse style elements
    parse_styles(node.attrs);
    // Read node element
    switch (node.elem) {
      case '#document': break;
      case 'svg': parse_root(node.attrs); break;
      case 'g': parse_group(node.attrs); break;
      case 'rect': parse_rect(node.attrs); break;
      default: console.log("// ELEMENT NOT RECOGNIZED //");
    }
    
    // Visit children or stop
    const children = node["content"] || []
    for (let child of children) {
      visit_node(child);
    }
    return;
  }

  // Visit tree
  visit_node(svgjs);
  // Clean-up, if any

} 