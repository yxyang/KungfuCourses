
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
   // console.log(cy);
   cy.fit()
} // freshLayout



// Helper function for generating course descrp
courseDescrp = function(course) {
  return "<table class='pure-table pure-table-horizontal'><tbody><tr><th>Title</th><th>" + course.title 
  + "</th></tr><tr><th>Units</th><th>" + course.units
  + "</th></tr><tr><th>Description</th><th>" + course.descrp
  + "</th></tr>"
  + "</tbody></table>";
}



fetchData = function(name) {

  $.ajax({
    // url: "http://ec2-52-24-8-168.us-west-2.compute.amazonaws.com:3015/major?name=" + name,
    url: "http://localhost:3015/major?name=" + name,
    dataType: "jsonp",
    success: function (data) {
      console.log("fetched data from server");

      var g = new dagreD3.graphlib.Graph().setGraph({
        nodesep: 0,
        ranksep: 100
      });

      var courses = data.courses;
      courses.forEach(function(state) { g.setNode(state.name, { shape: 'rect', label: state.name, title: state.title, units: state.units, descrp: state.descrp, raw_name: state.raw_name }); });

      var prereqs = data.prereqs;
      prereqs.forEach(function(edge) {
        g.setEdge(edge[0], edge[1], {label:""});
      })

  
      // Set some general styles
      g.nodes().forEach(function(v) {
        var node = g.node(v);
        node.rx = node.ry = 15;
      });
      
      var svg = d3.select("svg#sky"),
          inner = svg.select("g");
      var render = new dagreD3.render();
      
      // Run the renderer. This is what draws the final graph.
      render(inner, g);

      svg.attr('height', g.graph().height)
         .attr('width', g.graph().width);

      // Configure 
      svg.selectAll("g.node")
      .on("mouseover", function(id) {
        d3.select(this).style("fill", "#FFFFFF");

      })
      .on("mouseout", function(id) {
        d3.select(this).style("fill", "#000000");
      })
      .on("mousedown", function(id) {
        // Set course name, descro, units
        d3.select("#course-table").style({"visibility": "visible"});
        d3.select("th#course-name").text(g.node(id).label + " - " + g.node(id).title);
        d3.select("th#course-units").text("Units : " + g.node(id).units);
        d3.select("#course-descrp").text("Description : " + g.node(id).descrp);
        $.ajax({
          url: 'http://localhost:3015/course?name=' + g.node(id).raw_name,
          dataType: "jsonp",
          success: function (data) {
            google.charts.setOnLoadCallback(function() {
              // Draw Grades
              drawGrades(data);
              // Set Average Grade
              var _grade = data['course_letter'];
              var _gpa = data['section_gpa'];
              d3.selectAll("#average-grade > div").remove();
              d3.select("#grade-dist > no-data").remove();
              d3.select("#average-grade").text("Average Grade : ");
              var grade = d3.select("#average-grade").append("div").attr("class", "rating-number").text(_grade);
              var gpa = d3.select("#average-grade").append("div").attr("class", "rating-number").text(_gpa);
              if (_gpa >= 3.35) {
                grade.classed("rating-high", true);
                gpa.classed("rating-high", true);
              } else if (_gpa >= 2.35) {
                grade.classed("rating-mid", true);
                gpa.classed("rating-mid", true);
              } else {
                grade.classed("rating-low", true);
                gpa.classed("rating-low", true);
              }
            });
          },
          error: function(error) {
            d3.selectAll("#average-grade > div").remove();
            d3.select("#grade-dist").remove();
            d3.select("#grade-dist-cell").append("div").attr("id", "grade-dist");
            d3.select("#average-grade").text("Average Grade : ");
            d3.select("#average-grade").append("div").attr("class", "rating-number").text("?");
            d3.select("#grade-dist").append("p").attr("class", "no-data").style({"font-size": "28px", "font-color": "#E57B7B"}).text("The grade data of this class is currently unavailable");
          }
        })
      })
      .attr("title", function(v) { return courseDescrp(g.node(v)); })
      .each(function(v) { $(this).tipsy({ gravity: "s", opacity: 1, html: true, fade: true }); });

      svg.selectAll("g.label").selectAll("text").classed("unselectable", true);

    }
  });
}


drawGrades = function(data) {
  var chartData = [];
  var gradeOptions = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"];
  chartData.push(['Grade', 'Students', { role: 'style' }]);
  for (var i in gradeOptions) {
    chartData.push([gradeOptions[i], data[gradeOptions[i]]['numerator'], "opacity: 0.5"]);
  }
  chartData = google.visualization.arrayToDataTable(chartData);
  var view = new google.visualization.DataView(chartData);
  view.setColumns([0, 1,
                       { calc: "stringify",
                         sourceColumn: 1,
                         type: "string",
                         role: "annotation" },
                  2]);
  var options = {
        title: "Grade Distribution of " + data['title'],
        width: 350,
        bar: {groupWidth: "95%"},
        legend: { position: "none" },
        backgroundColor: '#EEE',
        fontName: 'Verdana'
  };
  var chart = new google.visualization.ColumnChart(document.getElementById("grade-dist"));
  chart.draw(view, options);
} 



loadMajors = function() {
      $.ajax({
        // url: "http://ec2-52-24-8-168.us-west-2.compute.amazonaws.com/allmajors",
        url: "http://localhost/allmajors",
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
        this.wrapper = $("<span>")
          .addClass( "custom-combobox" )
          .insertAfter( this.element );
 
        this.element.hide();
        this._createAutocomplete();
        this._createShowAllButton();
      },

      _create_box: function(value) {

      },
 
      _createAutocomplete: function() {
        var selected = this.element.children(":selected"),
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
