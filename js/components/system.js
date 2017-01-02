define(function(require) {
  'use strict';

  var component = require('flight/lib/component');
  var db = require('db/data');

  return component(system);

  function system() {
    this.handleRootClicked = function (event, data) {
      if ($(data.el).hasClass('root-disabled'))
        return;
      this.trigger('updateRootData', this.getRootNodeData(data));
    }

    this.handleRootHovered = function (event, data) {
      if ($(data.el).hasClass('root-disabled'))
        return;
      this.trigger('showRootData', this.getRootNodeData(data));
    }

    this.handleRootHoveredOut = function (event, data) {
      if ($(data.el).hasClass('root-disabled') && !$(data.el).hasClass('root-hover'))
        return;
      this.trigger('hideRootData', this.getRootNodeData(data));
    }

    this.getRootNodeData = function (data) {
      var $root = $(data.el);
      return {
        devanagari: $root.data('root-dvng'),
        root: $root.data('root'),
        rootAlt: $root.data('root-alt'),
        rootAlt1: $root.data('root-alt1'),
        soundProperties: $root.data('sound-properties')
      }
    }

    this.after('initialize', function () {
      this.trigger('dataReceived', db);
      this.on('uiRootClicked', this.handleRootClicked);
      this.on('uiRootHovered', this.handleRootHovered);
      this.on('uiRootHoveredOut', this.handleRootHoveredOut);
    });
  }
})