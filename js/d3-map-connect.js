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
        fontStroke: 'black'
      },
      showUnused: true
    }, options);
    this.refs = {
      chart: undefined,
      edgesGroup: undefined,
      edges: undefined,
      blocks: undefined
    };
  }

  MapVisualizer.prototype = function MapVisualizerProto() {

    function setData(data) {
      this.data = data;
      reDraw.call(this);
    }

    function reDraw() {
      console.log('options', this.options);
      console.log('data', this.data);
      var _this = this;

      createChart.call(this);

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
    }

    function createChart() {
      if (this.refs.chart) {
        this.refs.chart.remove();
      }

      this.refs.chart = d3.select(this.node)
        .append('g')
        .attr('class', 'chart-node')
        .attr('transform', 'translate(30,30)');
      
      this.refs.edgesGroup = this.refs.chart
        .append('g')
        .attr('class', 'chart-edges');
      
      this.refs.edges = [];
      this.refs.blocks = [];
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

      blockRef.width = blockRef.request.width
        + this.options.chart.blockInnerSize
        + 2 * this.options.chart.blockInnerMargin
        + blockRef.response.width;
      blockRef.height = Math.max(blockRef.request.height, blockRef.response.height);

      // narysowanie kwadratu wewnętrznego określającego blok
      blockRef.node.append('rect')
        .attr('x', blockRef.x + blockRef.request.width + this.options.chart.blockInnerMargin)
        .attr('y', blockRef.y)
        .attr('width', this.options.chart.blockInnerSize)
        .attr('height', blockRef.height)
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
          .rangeRound([0, data.length]);
      
      var node = parentNode.append('g')
        .attr('class', 'block-inputs')
        .selectAll('text')
        .data(data);
      
      node.enter().append('text')
        .attr('y', function (d) { return y + yScale(d.name) * ySpacing + ySize; })
        .attr('font-family', this.options.chart.fontFamily)
        .attr('font-size', this.options.chart.fontSize)
        .text(function (d) { return d.name; })
        .each(function (d) { d.width = Math.ceil(this.getComputedTextLength()); })
        .attr('x', function (d) { return ('end' !== align ? x : x + width - d.width); });
      
      return {
        node: node,
        height: data.length * ySpacing
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

    return {
      setData: setData
    };
  }();

  var helpers = {
    name: function _helperName(name) {
      if (!name) {
          throw new Error('Field name is missing');
      }
      var resp = name.replace(/[^a-z0-9_-]/gi, '');
      return resp;
    }
  }

  function connectWith(node, options) {
    return new MapVisualizer(node, options)
  }

  return {
    connectWith: connectWith
  }
}());
