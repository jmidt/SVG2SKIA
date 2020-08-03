'use strict';



module.exports = function(svgjs) {

  // Draw calls
  var draw_rect = function(params) {
    console.log(
        'ctx.drawRect({' + params.x + ', ' + params.y + ', ' + params.w +
        ', ' + params.h + '}, paint);');
  };
  
  var draw_circle = function(params) {
    console.log('ctx.DrawCircle(' + params.cx + ', ' + params.cy + ', ' + params.r + ', paint);')
  };

  var draw_ellipse = function(params) {
    console.log('ctx.DrawEllipse(' + params.cx + ', ' + params.cy + ', ' + params.rx + ', ' + params.ry + ', paint);')
  };

  // Common element traits
  var draw_fillable = function(draw_func, params) {
    if (stroke == fill || fill == undefined) {
      console.log('paint.setStyle(SkPaint::kStrokeAndFill_Style);');
      console.log('paint.setColor(' + stroke + ');')
      draw_func(params)
    }
    else if (fill != 'none') {
      console.log('paint.setStyle(SkPaint::kFill_Style);');
      console.log('paint.setColor(' + fill + ');')
      draw_func(params)
      console.log('paint.setStyle(SkPaint::kStroke_Style);');
      console.log('paint.setColor(' + stroke + ');')
      draw_func(params)
    }
    else {
      console.log('paint.setStyle(SkPaint::kStroke_Style);');
      console.log('paint.setColor(' + stroke + ');')
      draw_func(params)
    }
  }
  
  // Element types
  var parse_root = function(attrs) {
    console.log('SkPath path;');
    console.log('SkPaint paint;');
  };
  
  var parse_group = function(attrs) {
    console.log('// NEW GROUP //');
  };
  
  var parse_rect = function(attrs) {
    const rect_params =
        {
          x: attrs['x'].value, 
          y: attrs['y'].value, 
          w: attrs['width'].value,
          h: attrs['height'].value
        }
    draw_fillable(draw_rect, rect_params)
  };
  
  var parse_circle = function(attrs) {
    const circ_params = 
      {
        cx: attrs['cx'].value,
        cy: attrs['cy'].value,
        r: attrs['r'].value
      }
    draw_fillable(draw_circle, circ_params)
  };

  var parse_ellipse = function(attrs) {
    const ellipse_params = 
      {
        cx: attrs['cx'].value,
        cy: attrs['cy'].value,
        rx: attrs['rx'].value,
        ry: attrs['ry'].value
      }
    draw_fillable(draw_ellipse, ellipse_params)
  };

  var parse_path = function(attrs) {
    var commands = []
    let path = attrs["d"].value
    // Split into separate commands
    var next_command = /^\s*([a-zA-Z]?)(-?[\d\.]+)\s?(-?[\d\.]+)/
    while (path.length > 1) {
      // Get next command
      const commandstr = path.match(next_command)
      path = path.replace(next_command,'')
      var command = {}
      // Get command type
      command['type'] = commandstr[1]
      command['x'] = commandstr[2]
      command['y'] = commandstr[3]
      commands.push(command)
    }
    // Close path?
    var close_path = path.match(/^\s?([zZ])\s?$/)
    if (close_path) {
      commands.push({type: close_path[1], x: '', y: ''})
    }
    console.log(commands)

  }

  var visit_node = function(node, depth) {
    var parse_styles = function(attrs) {
      for (const attrkey in attrs) {
        const attr = attrs[attrkey];
        switch (attr.name) {
          case 'stroke': {
            stroke = attr.value;
            stroke_depth = depth;
            break;
          }
          case 'stroke-width': {
            console.log('paint.setStrokeWidth(' + attr.value + ');');
            break;
          }
          case 'stroke-linecap': {
            if (attr.value == 'round')
              console.log('paint.setStrokeCap(SkPaint::kRound_Cap);');
            break;
          }
          case 'stroke-linejoin': {
            if (attr.value == 'round')
              console.log('paint.setStrokeJoin(skPaint::kRound_Join);');
            break;
          }
          case 'fill': {
            fill = attr.value;
            fill_depth = depth;
            break;
          }
        }
      }
    };

    // Possibly invalidate cache data
    if (depth <= stroke_depth) stroke = undefined;
    if (depth <= fill_depth) fill = undefined;

    // Parse style elements
    parse_styles(node.attrs);
    // Read node element
    switch (node.elem) {
      case '#document':
        break;
      case 'svg':
        parse_root(node.attrs);
        break;
      case 'g':
        parse_group(node.attrs);
        break;
      case 'rect':
        parse_rect(node.attrs);
        break;
      case 'circle':
        parse_circle(node.attrs);
        break;
      case 'ellipse':
        parse_ellipse(node.attrs);
        break;
      case 'path':
        parse_path(node.attrs);
      default:
        console.log('// ELEMENT NOT RECOGNIZED //');
    }

    // Visit children or stop
    const children = node['content'] || [];
    for (let child of children) {
      visit_node(child, depth + 1);
    }
    return;
  };

  // Global state that becomes invalidated when moving back up the tree.
  // Might need to be more fancy as things progress
  // The reason for it is that some things (most notably fill colour) is not
  // necessarily given in the same
  var stroke = undefined;
  var stroke_depth = undefined;
  var fill = undefined;
  var fill_depth = undefined;

  // Visit tree
  visit_node(svgjs, 0);
  
};
