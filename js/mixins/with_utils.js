define(function(require) {
  'use strict';

  require('sanscript/sanscript');
  var utils = require('flight/lib/utils');

  return withUtils;

  function withUtils() {
    this.attributes({
      typeWeight: 1,
      contactWeight: 1,
      strainWeight: 1,
      aspirateWeight: 1,
      nasalWeight: 1,
      quantityWeight: 1
    });

    this.getStartingSound = function (word) {
      var sound = word.match(/^aa|^A/) ||
        word.match(/^ii|^I/) ||
        word.match(/^uu|^U/) ||
        word.match(/^RRi|^R\^i/) ||
        word.match(/^RRI|^R\^I/) ||
        word.match(/^LLi|^L\^i/) ||
        word.match(/^LLI|^L^I/) ||
        word.match(/^ai/) ||
        word.match(/^au/) ||
        word.match(/^M|^\.m|^\.n/) ||
        // word.match(/^aM|^a\.m|^a\.n/) ||
        word.match(/^aH/) ||
        word.match(/^a\.N/) ||
        word.match(/^kh/) ||
        word.match(/^gh/) ||
        word.match(/^~N|^N\^/) ||
        word.match(/^Ch|^chh/) ||
        word.match(/^ch/) ||
        word.match(/^jh/) ||
        word.match(/^~n|^JN/) ||
        word.match(/^Th/) ||
        word.match(/^Dh/) ||
        word.match(/^th/) ||
        word.match(/^dh/) ||
        word.match(/^ph/) ||
        word.match(/^bh/) ||
        word.match(/^sh/) ||
        word.match(/^Sh/) ||
        word.match(/^ld/) ||
        // word.match(/^kSh|^x/) ||
        word.match(/^j~n|dny|GY/) ||
        word.match(/^shr/) ||
        // word.match(/^\.m|^\.n/) ||
        word.match(/^\.a/) ||
        word.match(/^\.c/) ||
        word.match(/^\.N/) ||
        word.match(/^\.h/) ||
        word.match(/^OM|^AUM/);

      if (sound) {
        return sound[0];
      }

      return word[0];
    }

    this.sanscript = function (word) {
      return Sanscript.t(word, 'itrans', 'devanagari');
    }

    this.getDistance = function (props1, props2) {
      var distance = 0;

      if (props1.type != props2.type) {
        distance += this.attr.typeWeight;
      }

      if (props1.contact != props2.contact) {
        distance += this.attr.contactWeight;
      }

      if (props1.strain != props2.strain) {
        distance += this.attr.strainWeight;
      }

      if (props1.aspirate != props2.aspirate) {
        distance += this.attr.aspirateWeight;
      }

      if (props1.nasal != props2.nasal) {
        distance += this.attr.nasalWeight;
      }

      if (props1.quantity != props2.quantity) {
        distance += this.attr.quantityWeight;
      }

      return distance;
    }
  }
})