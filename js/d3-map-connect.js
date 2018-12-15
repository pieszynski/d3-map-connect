/// <reference types="./d3-map-connect" />
/// <reference types="@types/d3" />

var d3MapConnect = (function (undefined) {
  "use strict";

  function MapVisualizer(node, options) {
    this.node = node;
    this.options = Object.assign({}, {
      chart: {
        //fontFamily: "Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        fontFamily: 'Verdana',
        fontSize: 14,
        blockDistance: 50,
        blockInnerSize: 30,
        blockInnerMargin: 3,
        fontStroke: 'black',
        edge: {
          dotRadius: 3,
          edgeOpacity: 0.5,
          inStroke: '#fa0',
          outStroke: 'blue'
        },
        pos: {
          x: 30,
          y: 30
        }
      },
      showUnused: true
    }, options);
    this.refs = {
      chart: undefined,
      edgesGroup: undefined,
      edges: undefined,
      blocks: undefined,
      mouse: undefined
    };
  }

  MapVisualizer.prototype = function MapVisualizerProto() {

    function setData(data) {
      this.data = data;
      console.log('options', this.options);
      console.log('data', this.data);
      reDraw.call(this);
    }

    function showUnused(show) {
      this.options.showUnused = !!show;
      reDraw.call(this);
    }

    function reDraw() {
      var _this = this;

      createChart.call(this);

      markUsedFields.call(this);

      var _lastBlockStartX = 0;
      this.data.blocks.forEach(function _forEachBlock(el, idx, arr) {
        var blockRef = {
          node: undefined,
          data: el,
          x: _lastBlockStartX,
          y: 0,
          width: 0,
          height: 0,
          request: {
            node: undefined,
            width: 0,
            height: 0
          },
          response: {
            node: undefined,
            width: 0,
            height: 0
          }
        };
        _this.refs.blocks[idx] = blockRef;
        
        drawBlock.call(_this, blockRef, idx, (idx === arr.length - 1));

        _lastBlockStartX += blockRef.width + _this.options.chart.blockDistance;
      });

      this.data.maps.forEach(function _forEachMap(el) {
        var srcRef = getBlockRefById.call(_this, el.sourceBlockId);
        var dstRef = getBlockRefById.call(_this, el.destinationBlockId);

        var edgeRef = drawEdges.call(_this, el.name, srcRef, dstRef, el.mapping);
        if (edgeRef) {
          _this.refs.edges.push(edgeRef);
        }
      });
    }

    function createChart() {
      if (this.refs.chart) {
        this.refs.chart.remove();
      }

      this.refs.chart = d3.select(this.node)
        .append('g')
        .attr('class', 'chart-node');
      
      updateChartPos.call(this);
      
      this.refs.edgesGroup = this.refs.chart
        .append('g')
        .attr('class', 'chart-edges');
      
      this.refs.edges = [];
      this.refs.blocks = [];
      this.refs.mouse = {
        isDown: false,
        lastPos: undefined
      }

      helpers.on(
        this,
        this.node,
        'mousedown',
        function _mouseDownEvt(evt) {
          this.refs.mouse.isDown = true;
        }
      );
      helpers.on(
        this,
        this.node,
        'mouseup',
        function _mouseDownEvt(evt) {
          this.refs.mouse.isDown = false;
          this.refs.mouse.lastPos = undefined;
        }
      );
      helpers.on(
        this,
        this.node,
        'mouseout',
        function _mouseDownEvt(evt) {
          this.refs.mouse.isDown = false;
          this.refs.mouse.lastPos = undefined;
        }
      );
      helpers.on(
        this,
        this.node,
        'mousemove',
        function _mouseMoveEvt(evt) {
          if (!this.refs.mouse.isDown)
            return;
          if (!this.refs.mouse.lastPos) {
            this.refs.mouse.lastPos = { x: evt.clientX, y: evt.clientY };
            return;
          }
          var dx = evt.clientX - this.refs.mouse.lastPos.x;
          var dy = evt.clientY - this.refs.mouse.lastPos.y;
          this.refs.mouse.lastPos.x = evt.clientX;
          this.refs.mouse.lastPos.y = evt.clientY;
          if (0 === dx && 0 === dy)
            return;

          moveChartPos.call(this, dx, dy);
        }
      );
    }

    function updateChartPos(x, y) {
      if (undefined === x || null === x) {
        x = this.options.chart.pos.x;
        y = this.options.chart.pos.y;
      } else if ('number' !== typeof (x)) {
        y = x.y;
        x = x.x;
      }

      this.options.chart.pos.x = x;
      this.options.chart.pos.y = y;

      this.refs.chart
        .attr('transform', `translate(${x},${y})`);
    }

    function moveChartPos(dx, dy) {
      this.options.chart.pos.x += dx;
      this.options.chart.pos.y += dy;
      updateChartPos.call(this);
    }

    function drawBlock(blockRef, idx, isLast) {
      blockRef.node = this.refs.chart.append('g')
        .attr('class', `block-${helpers.name(blockRef.data.id)}`);
      
      // wyliczanie najdłuższego tekstu we/wy
      blockRef.request.width = calcLongestTextWidth.call(
        this,
        blockRef.node,
        blockRef.data.requestNodes
      );
      blockRef.response.width = calcLongestTextWidth.call(
        this,
        blockRef.node,
        blockRef.data.responseNodes
      );

      // narysowanie bloków we/wy
      var reqNodes = drawInputOutputs.call(
        this,
        blockRef.x,
        blockRef.y,
        blockRef.request.width,
        'end',
        blockRef.node,
        blockRef.data.requestNodes
      );
      blockRef.request.node = reqNodes.node;
      blockRef.request.height = reqNodes.height;
      blockRef.request.yScaleFn = reqNodes.yScaleFn;

      var respNodes = drawInputOutputs.call(
        this,
        blockRef.x + blockRef.request.width + 2 * this.options.chart.blockInnerMargin + this.options.chart.blockInnerSize,
        blockRef.y,
        blockRef.response.width,
        'start',
        blockRef.node,
        blockRef.data.responseNodes
      );
      blockRef.response.node = respNodes.node;
      blockRef.response.height = respNodes.height;
      blockRef.response.yScaleFn = respNodes.yScaleFn;

      blockRef.width = blockRef.request.width
        + this.options.chart.blockInnerSize
        + 2 * this.options.chart.blockInnerMargin
        + blockRef.response.width;
      blockRef.height = Math.max(blockRef.request.height, blockRef.response.height);

      // narysowanie kwadratu wewnętrznego określającego blok
      var heightAdd = Math.max(reqNodes.yOffset, respNodes.yOffset);
      blockRef.node.append('rect')
        .attr('x', blockRef.x + blockRef.request.width + this.options.chart.blockInnerMargin)
        .attr('y', blockRef.y)
        .attr('width', this.options.chart.blockInnerSize)
        .attr('height', blockRef.height + heightAdd)
        .attr('stroke', this.options.chart.fontStroke)
        .attr('fill', 'transparent');
    }

    function drawInputOutputs(x, y, width, align, parentNode, nameNodesArray) {
      var showUnused = this.options.showUnused,
        data = nameNodesArray
          .filter(function (el) { return showUnused || el.isUsed || false; })
          .map(function (el) { return { name: el.name, width: 0 }; }),
        ySize = this.options.chart.fontSize,
        ySpacing = ySize + Math.round(ySize / 5),
        yScale = d3.scaleBand()
          .domain(data.map(function (el) { return el.name; }))
          .rangeRound([0, data.length]),
        yOffset = 'end' !== align ? Math.round(ySpacing / 2) : 0;
      
      var node = parentNode.append('g')
        .attr('class', 'block-inputs')
        .selectAll('text')
        .data(data);
      
      function yScaleFn(name) {
        return y + yScale(name) * ySpacing + ySize + yOffset;
      }
      
      node.enter().append('text')
        .attr('y', function (d) { return yScaleFn(d.name); })
        .attr('font-family', this.options.chart.fontFamily)
        .attr('font-size', this.options.chart.fontSize)
        .text(function (d) { return d.name; })
        .each(function (d) { d.width = Math.ceil(this.getComputedTextLength()); })
        .attr('x', function (d) { return ('end' !== align ? x : x + width - d.width); });
      
      return {
        node: node,
        height: data.length * ySpacing,
        yOffset: yOffset,
        yScaleFn: yScaleFn
      }
    }

    function calcLongestTextWidth(parentNode, nameNodesArray) {

      var resp = 0;
      parentNode.selectAll('text')
        .data(nameNodesArray.map(function (el) { return el.name; }))
        .enter().append('text')
        .attr('class', 'text-length-calc')
        .attr('font-family', this.options.chart.fontFamily)
        .attr('font-size', this.options.chart.fontSize)
        .attr('stroke', this.options.chart.fontStroke)
        .text(function (d) { return d; })
        .each(function (d) {
          resp = Math.max(resp, this.getComputedTextLength());
          this.remove();
        })
      
      return Math.ceil(resp);
    }

    function drawEdges(name, srcRef, dstRef, mapping) {
      var _this = this,
        bezLen = Math.ceil(_this.options.chart.blockDistance / 2),
        node = this.refs.edgesGroup.append('g')
        .attr('class', `edges-for-${helpers.name(name)}`);
      
      mapping.forEach(function (el) {
        var srcXY = getEdgeXYFor.call(_this, el.src, srcRef, true);
        if (!srcXY)
          return undefined;
        
        var dstXY = getEdgeXYFor.call(_this, el.dst, dstRef, false);
        if (!dstXY)
          return undefined;
        
        node.append('path')
          .attr('stroke', _this.options.chart.fontStroke)
          .attr('stroke-opacity', _this.options.chart.edge.edgeOpacity)
          .attr('fill', 'transparent')
          .attr('d', `M ${srcXY.x} ${srcXY.y} ${(0 < srcXY.bezLen ? `L ${srcXY.x + srcXY.bezLen} ${srcXY.y} ` : '')}C ${srcXY.x + srcXY.bezLen + bezLen} ${srcXY.y}, ${dstXY.x - bezLen} ${dstXY.y}, ${dstXY.x} ${dstXY.y}`);
        node.append('circle')
          .attr('cx', srcXY.x)
          .attr('cy', srcXY.y)
          .attr('stroke', srcXY.stroke)
          .attr('fill', srcXY.stroke)
          .attr('stroke-opacity', _this.options.chart.edge.edgeOpacity)
          .attr('fill-opacity', _this.options.chart.edge.edgeOpacity)
          .attr('r', _this.options.chart.edge.dotRadius);
        node.append('circle')
          .attr('cx', dstXY.x)
          .attr('cy', dstXY.y)
          .attr('stroke', _this.options.chart.fontStroke)
          .attr('fill', _this.options.chart.fontStroke)
          .attr('stroke-opacity', _this.options.chart.edge.edgeOpacity)
          .attr('fill-opacity', _this.options.chart.edge.edgeOpacity)
          .attr('r', _this.options.chart.edge.dotRadius);
      });

      return {
        node: node
      };
    }

    function getEdgeXYFor(name, blockRef, isStart) {
      var yScaleFn = undefined,
        baseX = blockRef.x,
        stroke = undefined,
        bezLen = 0;
      if (0 === name.toUpperCase().indexOf('IN.')) {
        yScaleFn = blockRef.request.yScaleFn;
        name = name.substr(3);
        stroke = this.options.chart.edge.inStroke;
        if (isStart) {
          baseX += blockRef.request.width;
          bezLen = 2 * this.options.chart.blockInnerMargin
            + this.options.chart.blockInnerSize
            + blockRef.response.width
            ;//+ Math.ceil(this.options.chart.blockDistance / 3);
        }
      } else if (0 === name.toUpperCase().indexOf('OUT.')) {
        yScaleFn = blockRef.response.yScaleFn;
        name = name.substr(4);
        stroke = this.options.chart.edge.outStroke;
        baseX += blockRef.request.width + 2 * this.options.chart.blockInnerMargin + this.options.chart.blockInnerSize;
        if (isStart) {
          baseX += blockRef.response.width;
        }
      } else {
        throw new Error(`Unknown direction for name: ${name}`);
      }

      if (isStart) {
        baseX += 3 * this.options.chart.blockInnerMargin;
      } else {
        baseX -= 3 * this.options.chart.blockInnerMargin;
      }

      var baseY = yScaleFn(name) || undefined;
      if (!baseY)
        return undefined;

      return {
        x: baseX,
        y: baseY - Math.round(this.options.chart.fontSize / 3),
        stroke: stroke,
        bezLen: bezLen
      }
    }

    function getBlockRefById(id) {
      var respRef = this.refs.blocks.find(function (fel) { return fel.data.id === id; });
      return respRef;
    }

    function getDataBlockById(id) {
      var resp = this.data.blocks.find(function (fel) { return fel.id === id; });
      return resp;
    }

    function markUsedFields() {
      var _this = this;

      this.data.maps.forEach(function (el) {
        var srcBlock = getDataBlockById.call(_this, el.sourceBlockId);
        var srcFields = el.mapping.map(function (m) { return m.src; });
        if (srcBlock && srcFields) {
          markUsedFieldsInBlock.call(_this, srcBlock, srcFields);
        }

        var dstBlock = getDataBlockById.call(_this, el.destinationBlockId);
        var dstFields = el.mapping.map(function (m) { return m.dst; });
        if (dstBlock && dstFields) {
          markUsedFieldsInBlock.call(_this, dstBlock, dstFields);
        }
      });
    }

    function markUsedFieldsInBlock(block, fieldsArray) {
      fieldsArray.forEach(function (name) {
        if (0 === name.toUpperCase().indexOf('IN.')) {
          name = name.substr(3);
          var node = block.requestNodes.find(function (fel) { return !fel.isUsed && fel.name === name; });
          if (node) {
            node.isUsed = true;
          }
        } else if (0 === name.toUpperCase().indexOf('OUT.')) {
          name = name.substr(4);
          var node = block.responseNodes.find(function (fel) { return !fel.isUsed && fel.name === name; });
          if (node) {
            node.isUsed = true;
          }
        }
      });
    }

    return {
      setData: setData,
      showUnused: showUnused,
      updateChartPos: updateChartPos
    };
  }();

  var helpers = {
    name: function _helperName(name) {
      if (!name) {
          throw new Error('Field name is missing');
      }
      var resp = name.replace(/[^a-z0-9_-]/gi, '');
      return resp;
    },
    on: function _on(_this, target, event, cb) {
      target.addEventListener(event, function () {
        cb.apply(_this, arguments);
      });
    }
  }

  function connectWith(node, options) {
    return new MapVisualizer(node, options)
  }

  return {
    connectWith: connectWith
  }
}());
