
addNode = function(name){
  setID = name,
  cy.add([{group: "nodes",
           data: {"id": setID,
                  "name": "added",
                  "resources": [],
                  "properties": []
                  }}]); // cy.add
}; // addRandomNode

addEdge = function(src, target){
  nodeCount = cy.nodes().size()
  edgeCount = cy.edges().size()
  idNum = edgeCount
  setID = idNum.toString(),
  cy.add([{group: "edges",
           data: {"id": "e" + setID,
                  "source": src,
                  "target": target
                  }
            }]); // cy.add
}; // addRandomEdge

fitGraph = function() {
  cy.fit();
  cy.forceRender()
  } // fitGraph

    dag = {
      name: 'dagre',
    
      // dagre algo options, uses default value on undefined
      nodeSep: undefined, // the separation between adjacent nodes in the same rank
      edgeSep: undefined, // the separation between adjacent edges in the same rank
      rankSep: undefined, // the separation between adjacent nodes in the same rank
      rankDir: undefined, // 'TB' for top to bottom flow, 'LR' for left to right
      minLen: function( edge ){ return 1; }, // number of ranks to keep between the source and target of the edge
      edgeWeight: function( edge ){ return 1; }, // higher weight edges are generally made shorter and straighter than lower weight edges
    
      // general layout options
      fit: true, // whether to fit to viewport
      padding: 30, // fit padding
      animate: false, // whether to transition the node positions
      animationDuration: 500, // duration of animation in ms if enabled
      boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
      ready: function(){}, // on layoutready
      stop: function(){} // on layoutstop
    };

freshLayout = function(){

    dag = {
      name: 'dagre',
    
      // dagre algo options, uses default value on undefined
      nodeSep: undefined, // the separation between adjacent nodes in the same rank
      edgeSep: undefined, // the separation between adjacent edges in the same rank
      rankSep: undefined, // the separation between adjacent nodes in the same rank
      rankDir: undefined, // 'TB' for top to bottom flow, 'LR' for left to right
      minLen: function( edge ){ return 1; }, // number of ranks to keep between the source and target of the edge
      edgeWeight: function( edge ){ return 1; }, // higher weight edges are generally made shorter and straighter than lower weight edges
    
      // general layout options
      fit: true, // whether to fit to viewport
      padding: 30, // fit padding
      animate: false, // whether to transition the node positions
      animationDuration: 500, // duration of animation in ms if enabled
      boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
      ready: function(){}, // on layoutready
      stop: function(){} // on layoutstop
    };

   cy.layout(dag);
   console.log(cy);
   cy.fit()
   } // freshLayout

// fetchData = function(name) {
//   cy.remove("node");
//   cy.remove("edge");

//   $.ajax({
//     url: "http://10.0.0.46:3015/major?name=" + name,
//     dataType: "jsonp",
//     success: function (data) {
//       console.log("fetched data from server");
//       console.log(data);
//       var courses = data.courses;
//       var prereqs = data.prereqs;
//       for (var i in courses) {
//         console.log(courses[i]);
//         addNode(courses[i]);
//       }
//       for (var i in prereqs) {
//         addEdge(prereqs[i][0], prereqs[i][1]);
//       }      
//     }
//   });

//   cy.layout(dag);
//   //cy.fit()
//   setTimeout(freshLayout, 200);

// }
fetchData = function(name) {

  $.ajax({
    url: "http://ec2-52-24-8-168.us-west-2.compute.amazonaws.com:3015/major?name=" + name,
    dataType: "jsonp",
    success: function (data) {
      console.log("fetched data from server");
      console.log(data);

      var g = new dagreD3.graphlib.Graph().setGraph({
        nodesep: 0,
        ranksep: 100
      });

      var courses = data.courses;
      courses.forEach(function(state) { g.setNode(state, { shape: 'circle', label: state}); });

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
      
      var svg = d3.select("svg#sky"),
          inner = svg.select("g");
      // console.log(svg);
      
      // Set up zoom support
      // var zoom = d3.behavior.zoom().on("zoom", function() {
      //       inner.attr("transform", "translate(" + d3.event.translate + ")" +
      //                                   "scale(" + d3.event.scale + ")");
      //     });
      // svg.call(zoom);
      
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
        url: "http://ec2-52-24-8-168.us-west-2.compute.amazonaws.com:3015/allmajors",
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

      _create_box: function(value) {

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
          autocompleteselect: function(event, ui) {

            ui.item.option.selected = true;
            fetchData(ui.item.option.value);

            this._trigger( "select", event, {
              item: ui.item.option
            });
          },
 
          autocompletechange: "_removeIfInvalid"
        });
      },
 
      // _createShowAllButton: function() {
      //   var input = this.input,
      //     wasOpen = false;
 
      //   $( "<a>" )
      //     .attr( "tabIndex", -1 )
      //     .attr( "title", "Show All Items" )
      //     .tooltip()
      //     .appendTo( this.wrapper )
      //     .button({
      //       icons: {
      //         primary: "ui-icon-triangle-1-s"
      //       },
      //       text: false
      //     })
      //     .removeClass( "ui-corner-all" )
      //     .addClass( "custom-combobox-toggle ui-corner-right" )
      //     .mousedown(function() {
      //       wasOpen = input.autocomplete( "widget" ).is( ":visible" );
      //     })
      //     .click(function() {
      //       input.focus();
 
      //       // Close if already visible
      //       if ( wasOpen ) {
      //         return;
      //       }
 
      //       // Pass empty string as value to search for, displaying all results
      //       input.autocomplete( "search", "" );
      //     });
      // },
 
      _source: function(request, response) {
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
   var network = null
   var simpleStyle =  cytoscape.stylesheet().selector('node').css({
           'content': 'data(id)',
           'text-valign': 'center',
           'color': 'white',
           'text-outline-width': 2,
           'text-outline-color': '#888'
       }).selector('edge').css({
           'target-arrow-shape': 'triangle',
           'content': 'data(type)',
           'text-outline-color': '#FFFFFF',
           'text-outline-opacity': '1',
           'text-outline-width': 2,
           'text-valign': 'center',
           'color': '#777777',
           'width': '2px'
       }).selector(':selected').css({
           'background-color': 'black',
           'line-color': 'black',
           'target-arrow-color': 'black',
           'source-arrow-color': 'black',
           'color': 'black'
       })
   var $cy = $("#cy");
   $cy.cytoscape({
       elements: network,
       style: simpleStyle,
       showOverlay: false,
       minZoom: 0.1,
       maxZoom: 4.0,
       layout: "grid",
       ready: function() {
          cy = this;
          } // ready

       }); // cy initializer: cytoscape


   })  // document ready
