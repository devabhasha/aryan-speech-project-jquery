define(function (require) {
  'use strict';

  var component = require('flight/lib/component');
  var Hogan = require('hogan/hogan-3.0.2.min.amd');
  var withUtils = require('mixins/with_utils');
  var defiant = require('defiant/defiant.min');

  return component(details, withUtils);

  function details() {
    this.attributes({
      rootsBadgeSelector: '.roots-badge',
      listBadgeSelector: '.list-badge',
      listPaneSelector: '.tab-pane#list',
      rootsPaneSelector: '.tab-pane#roots',
      sequenceDisplaySelector: '.js-sequence',
      devanagariSequenceSelector: '.js-seq-dvng',
      itransSequenceSelector: '.js-seq-itrans',
      searchBoxSelector: '.js-search',
      listGroupItemSelector: '.list-group-item',
      rootDisplaySelector: '.js-root',
      searchBarTemplate: function () {
        return '<div class="input-group input-group-lg" style="margin-top: 20px"> \
                  <span class="input-group-addon" id="sizing-addon1">√</span> \
                  <input type="text" class="form-control js-search" placeholder="Search root sense" aria-describedby="sizing-addon1"> \
                </div>';
      },
      rootsListTemplate: function () {
        return '<div class="list-group pre-scrollable" style="max-height: 500px"> \
                  {{#roots}} \
                    <a href="#" class="list-group-item" data-root="{{root}}"> \
                      <h4 class="list-group-item-heading" style="font-weight: 600">{{#sans}}{{r}}{{/sans}} <small>{{r}}</small></h4> \
                      <p class="list-group-item-text">{{s}}</p> \
                    </a> \
                  {{/roots}} \
                </div>';
      },
      rootDisplayTemplate: function () {
        return '{{#root}} \
                  <div class="jumbotron"> \
                    <h1>{{#sans}}{{r}}{{/sans}}</h1> \
                    <p>{{s}}</p> \
                    {{#g.length}} \
                      <small>GROUPS</small> \
                      <ul class="list-unstyled"> \
                        {{#g}} \
                          <li>{{.}}</li> \
                        {{/g}} \
                      </ul> \
                    {{/g.length}} \
                    {{#d.length}} \
                      <small>DERIVATIVES</small> \
                      <ul style="margin-top: 10px"> \
                        {{#d}} \
                          <li><p>{{#sans}}{{f}}{{/sans}}{{#m}}: {{m}}{{/m}}</p></li> \
                        {{/d}} \
                      </ul> \
                    {{/d.length}} \
                  </div> \
                {{/root}}';
      }
    });
    this.updateRootsDisplay = function (event, data) {
      this.transformData(data);
      var templ = Hogan.compile(this.attr.rootsListTemplate);
      var possibleRootsListDom = templ.render(data);
      this.possibleRoots = {
        roots: data.roots
      }
      this.select('listBadgeSelector').text(data.roots.length);
      this.select('listPaneSelector').html(this.attr.searchBarTemplate + possibleRootsListDom);

      if (data.sequences) {
        var seq = data.sequences[0];
        $(this.attr.devanagariSequenceSelector).text(this.sanscript(seq));
        $(this.attr.itransSequenceSelector).text(seq);
        $(this.attr.sequenceDisplaySelector).show();
      }
    }

    this.updateFormedRootsDisplay = function (event, data) {
      if (data.formedRoots && data.formedRoots.length) {
        this.formedRootsList = this.formedRootsList.concat(data.formedRoots);
        this.formedRoots = {
          roots: this.formedRootsList
        }
        this.transformData(this.formedRoots);
        var templ = Hogan.compile(this.attr.rootsListTemplate);
        var formedRootsListDom = templ.render(this.formedRoots);
        this.select('rootsPaneSelector').html(this.attr.searchBarTemplate + formedRootsListDom);
        this.select('rootsBadgeSelector').text(this.formedRoots.roots.length);
      }
    }

    this.showSearchResults = function (event, data) {
      var $searchParent = $(data.el).closest('.tab-pane');
      this.transformData(data);
      if ($searchParent.attr('id') == 'list') {
        var templ = Hogan.compile(this.attr.rootsListTemplate);
        this.select('listBadgeSelector').text(data.roots.length);
      } else {
        var templ = Hogan.compile(this.attr.rootsListTemplate);
        this.select('rootsBadgeSelector').text(data.roots.length);
      }
      var html = templ.render(data);
      $searchParent.find('.pre-scrollable').html(html);
    }

    this.handleSearch = function (event, data) {
      var searchParent = $(data.el).closest('.tab-pane').attr('id');
      var searchData;
      if (searchParent == 'list') {
        searchData = this.possibleRoots;
      } else {
        searchData = this.formedRoots;
      }
      var results = JSON.search(searchData, "//roots[contains(s, '" + $(data.el).val().trim() + "')]");
      this.showSearchResults(event, {
        roots: results,
        el: data.el
      });
    }

    this.transformData = function (data) {
      var $this = this;

      if (data.roots) {
        data.roots.map(function (root) {
          root.root = JSON.stringify(root);
        });
      }

      data.sans = function () {
        return function (text) {
          return $this.sanscript(Hogan.compile(text).render(this));
        }
      }
    }

    this.handleRootClicked = function (event, data) {
      event.preventDefault();
      var rootData = $(data.el).data();
      this.transformData(rootData);
      var templ = Hogan.compile(this.attr.rootDisplayTemplate);
      var rootDom = templ.render(rootData);
      this.select('rootDisplaySelector').html(rootDom);
    }

    this.after('initialize', function () {
      this.possibleRootsList = [];
      this.formedRootsList = [];
      this.on(document, 'dataReceived', this.updateRootsDisplay);
      this.on(document, 'uiRootsUpdated', this.updateRootsDisplay);
      this.on(document, 'uiRootsUpdated', this.updateFormedRootsDisplay);
      this.on('keyup', {
        searchBoxSelector: this.handleSearch
      });
      this.on('click', {
        listGroupItemSelector: this.handleRootClicked
      })
    });
  }
});
