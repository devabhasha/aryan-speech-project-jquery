'use strict';

require.config({
  baseUrl: "js",
  paths: {
      "flight": "../bower_components/flight",
      "db": "../db",
      "defiant": "../bower_components/defiant/dist",
      "hogan": "../bower_components/hogan/web/builds/3.0.2",
      "sanscript": "../bower_components/sanscript/sanscript"
  }
});

require(
  [
    'flight/lib/compose',
    'flight/lib/registry',
    'flight/lib/advice',
    'flight/lib/logger',
    'flight/lib/debug'
  ],

  function(compose, registry, advice, withLogging, debug) {
    debug.enable(true);
    compose.mixin(registry, [advice.withAdvice]);

    require(['page/init'], function(initializeDefault) {
      initializeDefault();
    });
  }
);
