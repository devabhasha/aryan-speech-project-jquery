define(function (require) {
  var component = require('flight/lib/component');
  var withUtils = require('mixins/with_utils');
  var defiant = require('defiant/defiant.min');
  var sanscript = require('sanscript/sanscript');

  return component(roots, withUtils);

  function roots() {
    this.attributes({
      rootSelector: '.root',
      sequenceSelector: '.sequence',
      distanceSelector: '.distance',
      countSelector: '.count',
      aspirateBases: function () {
        return ["k", "g", "c", "j", "T", "D", "t", "d", "p", "b"];
      },
      diphthongBases: function () {
        return ["a"];
      }
    });

    this.showRootData = function (event, data) {
      var $rootNode = $('.root[data-root="' + data.root + '"]');
      $rootNode.addClass('root-hover');
      var soundProperties = data.soundProperties;
      var $this = this;
      $rootNode.popover({
        title: data.root + (data.rootAlt ? ' / ' + data.rootAlt : '') + (data.rootAlt1 ? ' / ' + data.rootAlt1 : ''),
        html: true,
        content: $this.getRootProperties(soundProperties)
      })
      $rootNode.popover('show');
    }

    this.getRootProperties = function (props) {
      var propStr = '';
      var type = {
        undefined: "Guttural",
        1: "Palatal",
        2: "Cerebral",
        3: "Dental",
        4: "Labial",
        5: "Palato-guttural",
        6: "Labio-guttural",
        7: "Labio-dental"
      }
      var contact = {
        undefined: "Full",
        1: "Slight",
        2: "Slightly open",
        3: "None"
      }
      var strain = {
        undefined: "Soft",
        1: "Hard"
      }

      var aspirate = {
        undefined: "No",
        1: "Yes"
      }

      var nasal = {
        undefined: "No",
        1: "Yes"
      }

      var quantity = {
        undefined: "Short",
        1: "Long"
      }

      propStr += "Type: <strong>" + type[props.type] + '</strong><br>';
      propStr += "Contact: <strong>" + contact[props.contact] + '</strong><br>';
      propStr += "Strain: <strong>" + strain[props.strain] + '</strong><br>';
      propStr += "Aspirate: <strong>" + aspirate[props.aspirate] + '</strong><br>';
      propStr += "Nasal: <strong>" + nasal[props.nasal] + '</strong><br>';
      propStr += "Quantity: <strong>" + quantity[props.quantity] + '</strong>';

      return propStr;
    }

    this.hideRootData = function (event, data) {
      var $rootNode = $('.root[data-root="' + data.root + '"]');
      $rootNode.removeClass('root-hover');
      $rootNode.popover('destroy');
    }

    this.filterRoots = function (event, data) {
      var currentSounds = [];

      currentSounds.push(data.root);

      if (data.rootAlt)
        currentSounds.push(data.rootAlt);
      if (data.rootAlt1)
        currentSounds.push(data.rootAlt1);
      if (!this.sequences.length) {
        this.sequences = currentSounds;
      } else {
        var newSequences = [];
        this.sequences.forEach(function (seq) {
          currentSounds.forEach(function (news) {
            newSequences.push(seq + news);
          });
        });
        this.sequences = newSequences;
      }

      var nextSounds = [];
      var formedRoots = [];
      var filteredRoots = JSON.search(this.db, "//*/roots").filter(function (root) {
        var found = false;
        this.sequences.some(function (seq) {
          var currentRootSuffix = root.r.slice(seq.length);
          if (this.isValidCombination(seq[seq.length - 1], currentRootSuffix[0]) && root.r.match('^' + seq.split('^').join('\\^'))) {
            if (currentRootSuffix == '') {
              formedRoots.push(root);
              return;
            } else {
              nextSounds.push(this.getStartingSound(currentRootSuffix));
              found = true;
              return;
            }
          }
        }, this);
        if (found) return true;
        return false;
      }, this);

      this.db = {
        "roots": filteredRoots
      }

      var nextSoundsCount = {};

      nextSounds.forEach(function (sound) {
        if (nextSoundsCount[sound]) {
          nextSoundsCount[sound] += 1;
        } else {
          nextSoundsCount[sound] = 1;
        }
      });

      this.trigger('uiRootsUpdated', {
        roots: filteredRoots,
        sequences: this.sequences,
        currentSound: data.root,
        nextSounds: Object.keys(nextSoundsCount),
        nextSoundsCount: nextSoundsCount,
        formedRoots: formedRoots
      });
    }

    this.updateRootsDisplay = function (event, data) {
      data.nextSounds.forEach(function (sound) {
        var matchingNode = this.getMatchingRootNode(sound);
        if (matchingNode.length == 0) {
          return;
        }
        matchingNode.removeClass('root-disabled');
        matchingNode.find(this.attr.countSelector).text(data.nextSoundsCount[sound]);
        if (data.currentSound) {
          var currentRoot = this.getMatchingRootNode(data.currentSound);
          var currentSoundProperties = currentRoot.data('sound-properties');
          var matchingNodeSoundProperties = matchingNode.data('sound-properties');
          matchingNode.attr('data-distance', this.getDistance(currentSoundProperties, matchingNodeSoundProperties));
        } else {
          // init default
          matchingNode.attr('data-distance', 0);
        }
      }, this);
    }

    this.isValidCombination = function (curr, next) {
      var valid = true;
      if (this.attr.aspirateBases.indexOf(curr) != -1 && next == 'h') {
        valid = false;
      } else if (this.attr.diphthongBases.indexOf(curr) != -1 && ['i', 'u'].indexOf(next) != -1) {
        valid = false;
      } else if (curr == 'S' && next == 'h') {
        valid = false;
      }
      return valid;
    }

    this.initRootsDisplay = function (event, data) {
      this.defaultData = data;
      this.db = JSON.parse(JSON.stringify(data));
      var nextSounds = [];
      JSON.search(this.db, "//*/roots/r").forEach(function (root) {
        nextSounds.push(this.getStartingSound(root));
      }, this);
      var nextSoundsCount = {};

      nextSounds.forEach(function (sound) {
        if (nextSoundsCount[sound]) {
          nextSoundsCount[sound] += 1;
        } else {
          nextSoundsCount[sound] = 1;
        }
      });
      this.updateRootsDisplay(event, {
        nextSounds: Object.keys(nextSoundsCount),
        nextSoundsCount: nextSoundsCount
      })
    }

    this.getMatchingRootNode = function (root) {
      return $(".root[data-root='" + root + "']").length ?
        $(".root[data-root='" + root + "']") :
        $(".root[data-root-alt='" + root + "']").length ?
          $(".root[data-root-alt='" + root + "']") :
          $(".root[data-root-alt-1='" + root + "']").length ?
            $(".root[data-root-alt-1='" + root + "']") : [];
    }

    this.after('initialize', function () {
      this.sequences = [];
      this.on('mouseover', {
        rootSelector: 'uiRootHovered'
      });
      this.on('mouseout', {
        rootSelector: 'uiRootHoveredOut'
      });
      this.on(document, 'dataReceived', this.initRootsDisplay);
      this.on('click', {
        rootSelector: 'uiRootClicked'
      });
      this.on(document, 'updateRootData', this.filterRoots);
      this.on('uiRootsUpdated', this.updateRootsDisplay);
      this.on(document, 'showRootData', this.showRootData);
      this.on(document, 'hideRootData', this.hideRootData);
    });

    this.before('updateRootsDisplay', function () {
      this.select('rootSelector').addClass('root-disabled');
      this.select('rootSelector').find(this.attr.sequenceSelector).empty();
      this.select('rootSelector').find(this.attr.countSelector).empty();
      $('.root[data-distance]').attr('data-distance', null);
    })
  }
});
