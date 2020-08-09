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

  var make_path = function(commands) {
    // No commands should omit type, so unless relative line commands are used, no state is necessary.
    console.log('path.reset()')
    for (var cmd of commands) {
      const param_str = cmd['params'].map(num => num.toString()).join(', ')
      switch (cmd['type']){
        case 'M': console.log('path.moveTo(' + param_str + ');'); break;
        case 'L': console.log('path.lineTo(' + param_str + ');'); break;
        case 'C': console.log('path.cubicTo(' + param_str + ');'); break;
        case 'Q': console.log('path.quadTo(' + param_str + ');'); break;
        case 'Z':
        case 'z': console.log('path.close()'); break;
        default:
      } 
    }

    //function update_abs() {x = cmd['x']; y = cmd['y'];}
    //function update_rel() {x += cmd['x']; y += cmd['y'];}
  }

  var draw_path = function(params) {
    console.log('ctx.drawPath(path, paint);')
  }

  // Common element traits
  var draw_fillable = function(draw_func, params) {
    if (stroke == fill || fill == undefined) {
      console.log('paint.setStyle(SkPaint::kStrokeAndFill_Style);');
      console.log('paint.setColor(' + color(stroke) + ');')
      draw_func(params)
    }
    else if (fill != 'none') {
      console.log('paint.setStyle(SkPaint::kFill_Style);');
      console.log('paint.setColor(' + color(fill) + ');')
      draw_func(params)
      console.log('paint.setStyle(SkPaint::kStroke_Style);');
      console.log('paint.setColor(' + color(stroke) + ');')
      draw_func(params)
    }
    else {
      console.log('paint.setStyle(SkPaint::kStroke_Style);');
      console.log('paint.setColor(' + color(stroke) + ');')
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
    let type = ''
    while (path.length > 0) {
      var command = {}
      // Get next command type
      var next_type = /^\s*([a-zA-Z]?)/
      const commandtype = path.match(next_type)
      path = path.replace(next_type,'')
      if (commandtype != undefined)
        if (commandtype[1] != '' &&  commandtype[1] != undefined)
          type = commandtype[1]
      command['type'] = type
      // Get appropriate number of parameters
      let num_params = 0;
      if (['M', 'm', 'L', 'l', 'T', 't'].includes(type)) num_params = 2 
      else if (['H', 'h', 'V', 'v'].includes(type)) num_params = 1
      else if (['C', 'c'].includes(type)) num_params = 6
      else if (['S', 's', 'Q', 'q'].includes(type)) num_params = 4
      else if (['A', 'a'].includes(type)) num_params = 7
      else if (['Z', 'z'].includes(type)) num_params = 0
      var params_pattern = new RegExp(`^(\\s?-?[\\d\\.]+){${num_params}}`)
      const params = path.match(params_pattern)
      path = path.replace(params_pattern, '')
      // Split into parts
      command['params'] = params[0].trim().split(/[\s']+/).map(str => parseFloat(str))
      commands.push(command)
    }
    // Close path?
    var close_path = path.match(/^\s?([zZ])\s?$/)
    if (close_path) {
      commands.push({type: close_path[1], params: []})
    }
    
    make_path(commands)
    // draw_path does not use any path-specific thing, but it retains consistency
    draw_fillable(draw_path, commands)
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
        break;
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

  // Format conversion. Has to be able to deal with short-form hex codes
  // Taken from here: https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
  function hex_to_RGB(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
      return r + r + g + g + b + b;
    });
  
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  /// TODO: Add recognition of OTTO colors
  function color(colstr) {
    const rgb = hex_to_RGB(colstr)
    return 'SkColorSetRGB(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ')'
  }
  
};
