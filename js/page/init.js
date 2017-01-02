define(function (require) {
  'use strict';

  var Roots = require('components/roots');
  var Details = require('components/details');
  var System = require('components/system');

  return initialize;

  function initialize() {
    Roots.attachTo('.roots-component');
    Details.attachTo('.details-component');
    System.attachTo(document);
  }
});
