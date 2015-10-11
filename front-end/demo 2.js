fetchData = function(name) {

  $.ajax({
    url: "http://localhost:3015/major?name=" + name,
    dataType: "jsonp",
    success: function (data) {
      console.log("fetched data from server");
      console.log(data);

      var g = new dagreD3.graphlib.Graph().setGraph({
        nodesep: 0,
        ranksep: 100
      });

      var courses = data.courses;
      courses.forEach(function(state) { g.setNode(state, { label: state}); });

      var prereqs = data.prereqs;
      prereqs.forEach(function(edge) {
        g.setEdge(edge[0], edge[1], {label:""});
      })


      // Create a new directed graph
  
      // Set some general styles
      g.nodes().forEach(function(v) {
        var node = g.node(v);
        node.rx = node.ry = 15;
      });
      
      var svg = d3.select("svg"),
          inner = svg.select("g");
      
      // Set up zoom support
      var zoom = d3.behavior.zoom().on("zoom", function() {
            inner.attr("transform", "translate(" + d3.event.translate + ")" +
                                        "scale(" + d3.event.scale + ")");
          });
      svg.call(zoom);
      
      // Create the renderer
      var render = new dagreD3.render();
      
      // Run the renderer. This is what draws the final graph.
      render(inner, g);
      
      // Center the graph
      var initialScale = 0.75;
      zoom
        .translate([(svg.attr("width") - g.graph().width * initialScale) / 2, 20])
        .scale(initialScale)
        .event(svg);
      svg.attr('height', g.graph().height * initialScale + 40);
    }
  });
}

loadMajors = function() {
      $.ajax({
        url: "http://localhost:3015/allmajors",
        dataType: "jsonp",
        success: function( data ) {
          for (var i in data) {
            $("#majors").append('<option value="' + data[i] + '">' + data[i] + '</option>');
          }
        }
      });

    (function( $ ) {
    $.widget( "custom.combobox", {
      _create: function() {
        this.wrapper = $( "<span>" )
          .addClass( "custom-combobox" )
          .insertAfter( this.element );
 
        this.element.hide();
        this._createAutocomplete();
        this._createShowAllButton();
      },
 
      _createAutocomplete: function() {
        var selected = this.element.children( ":selected" ),
          value = selected.val() ? selected.text() : "";


        this.input = $( "<input>" )
          .appendTo( this.wrapper )
          .val( value )
          .attr( "title", "" )
          .addClass( "custom-combobox-input ui-widget ui-widget-content ui-state-default ui-corner-left" )
          .autocomplete({
            delay: 0,
            minLength: 0,
            source: $.proxy( this, "_source" )
          })
          .tooltip({
            tooltipClass: "ui-state-highlight"
          });
 
        this._on( this.input, {
          autocompleteselect: function( event, ui ) {

            ui.item.option.selected = true;
            fetchData(ui.item.option.value);
            this._trigger( "select", event, {
              item: ui.item.option
            });
          },
 
          autocompletechange: "_removeIfInvalid"
        });
      },
 
      _createShowAllButton: function() {
        var input = this.input,
          wasOpen = false;
 
        $( "<a>" )
          .attr( "tabIndex", -1 )
          .attr( "title", "Show All Items" )
          .tooltip()
          .appendTo( this.wrapper )
          .button({
            icons: {
              primary: "ui-icon-triangle-1-s"
            },
            text: false
          })
          .removeClass( "ui-corner-all" )
          .addClass( "custom-combobox-toggle ui-corner-right" )
          .mousedown(function() {
            wasOpen = input.autocomplete( "widget" ).is( ":visible" );
          })
          .click(function() {
            input.focus();
 
            // Close if already visible
            if ( wasOpen ) {
              return;
            }
 
            // Pass empty string as value to search for, displaying all results
            input.autocomplete( "search", "" );
          });
      },
 
      _source: function( request, response ) {
        var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term), "i" );
        response( this.element.children( "option" ).map(function() {
          var text = $( this ).text();
          if ( this.value && ( !request.term || matcher.test(text) ) )
            return {
              label: text,
              value: text,
              option: this
            };
        }) );
      },
 
      _removeIfInvalid: function( event, ui ) {
 
        // Selected an item, nothing to do
        if ( ui.item ) {
          return;
        }
 
        // Search for a match (case-insensitive)
        var value = this.input.val(),
          valueLowerCase = value.toLowerCase(),
          valid = false;
        this.element.children( "option" ).each(function() {
          if ( $( this ).text().toLowerCase() === valueLowerCase ) {
            this.selected = valid = true;
            return false;
          }
        });
 
        // Found a match, nothing to do
        if ( valid ) {
          return;
        }
 
        // Remove invalid value
        this.input
          .val( "" )
          .attr( "title", value + " didn't match any item" )
          .tooltip( "open" );
        this.element.val( "" );
        this._delay(function() {
          this.input.tooltip( "close" ).attr( "title", "" );
        }, 2500 );
        this.input.autocomplete( "instance" ).term = "";
      },
 
      _destroy: function() {
        this.wrapper.remove();
        this.element.show();
      }
    });
  })( jQuery );
 
  $(function() {
    $( "#majors" ).combobox();
  });
}

$(document).ready(function() {
   $('#fetchData').click(fetchData);

   loadMajors();

  // simulate a json network string obtained from a server: 2 nodes, no edges

   //var JSONnetworkString = '{"nodes":[{"data":{"id" : "0"}},{"data" :{"id" : "1"}}]}'

})  // document ready
