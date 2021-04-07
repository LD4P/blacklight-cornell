if ( $('body').prop('className').indexOf("browse-info") >= 0 ) {
var margin = {
      top: 30,
      right: 10,
      bottom: 10,
      left: 10
  },
  width = 960,// - margin.left - margin.right,
  halfWidth = width / 2,
  height = 500 - margin.top - margin.bottom,
  i = 0,
  duration = 500,
  root;

var getChildren = function(d) {
    var a = [];
    if (d.influencers)
        for (var i = 0; i < d.influencers.length; i++) {
            d.influencers[i].isRight = false;
            d.influencers[i].parent = d;
            a.push(d.influencers[i]);
        }
    if (d.influenced)
        for (var i = 0; i < d.influenced.length; i++) {
            d.influenced[i].isRight = true;
            d.influenced[i].parent = d;
            a.push(d.influenced[i]);
        }
    return a.length ? a : null;
};

var tree = d3.layout.tree().size([height, width]);
//  var tree = d3.layout.tree()  
//    .separation(function(d) { return (d.root == true) ? 1 : 560; })
//    .size([height, width - 160]);
    
//var diagonal = d3.svg.diagonal().projection(function(d) { return [d.y, d.x]; });
var elbow = function(d, i) {
    if (d.source == d.target) return;
    diagonal = d3.svg.diagonal().projection(function(d) {
        return [d.y, d.x];
    });

    if (!d.target.isRight) {
        d = {
            source: calcLeft(d.source),
            target: calcLeft(d.target)
        };
        return diagonal(d, i);
    }
    return diagonal(d, i);
};
var connector = elbow;

var calcLeft = function(d) {
    var l = d.y;
    if (!d.isRight) {
        l = d.y - halfWidth;
        l = halfWidth - l;
    }
    return {
        x: d.x,
        y: l
    };
};

var vis = d3.select("#influence-chart").append("svg")
    .attr("width", width)// + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
function generateChart(influenceData) {
    infCount = Math.max(influenceData['influencers'].length, influenceData['influenced'].length);
    if ( infCount > 5 ) {
        height = infCount * 76;
        $('#influence-chart').children('svg').attr("height",height)
    }
    root = influenceData;
    root.x0 = height / 2;
    root.y0 = width / 2;

    var t1 = d3.layout.tree().size([height-50, halfWidth]).children(function(d) {
            return d.influencers;
        }),
        t2 = d3.layout.tree().size([height-50, halfWidth]).children(function(d) {
            return d.influenced;
        });
    t1.nodes(root);
    t2.nodes(root);

    var rebuildChildren = function(node) {
        node.children = getChildren(node);
        if (node.children) node.children.forEach(rebuildChildren);
    }
    rebuildChildren(root);
    root.isRight = false;
    update(root);
};

 function toArray(item, arr) {
    arr = arr || [];
    var i = 0,
        l = item.children ? item.children.length : 0;
    arr.push(item);
    for (; i < l; i++) {
        toArray(item.children[i], arr);
    }
    return arr;
};

function isOdd(num) { 
    return num % 2;
};

function update(source) {
    // Compute the new tree layout.
    var nodes = toArray(source);

    // Normalize for fixed-depth.
    nodes.forEach(function(d) {
        d.y = d.depth * 180 + halfWidth;
    });

    // Update the nodes…
    var node = vis.selectAll("g.node")
        .data(nodes, function(d) {
            return d.id || (d.id = ++i);
        });

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) {
            return "translate(" + source.y0 + "," + source.x0 + ")";
        })
        .on("click", click);
        
        nodeEnter.append("image")
        .attr("xlink:href", function(d) { return d.image; })
        .attr("x", function(d) {
            if ( d.root == true ) {
                return "-30";
            }
            else {
                return d.isRight ? "0" : "-48";
            }
        })
        .attr("y", function(d) {
            if ( d.root == true ) {
                return "-35";
            }
            else {
                return d.isRight ? "-30" : "-35";
            }
        })
        .attr("width", "62px")
        .attr("height", "68px")
        .attr("preserveAspectRatio", "xMinYMin meet");

        nodeEnter.filter(function(d) {
                    return ( d.image == "" );
        })
        .append("rect")
        .style('fill', '#fff')
        .style('stroke', "steelblue")
        .attr("x", function(d) { return d.isRight ? 0 : -40; })
        .attr("width", "40")
        .attr("height", "40")
        .attr("y", "-20");

    nodeEnter.append("text")
        .attr("dy", function(d) {
            return d.root == true ? 50 : 3;
        })
        .attr("dx", function(d) {
            if ( d.root == true ) {
                return 0;
            }
            else {
                return d.isRight ? 70 : -55; 
            }
        })
        .attr("text-anchor", function(d) {
            if ( d.root == true ) {
                return "middle";
            }
            else {
                return d.isRight ? "start" : "end"
            }
        })
        .text(function(d) {
            return d.name;
        })
        .style("fill-opacity", 1e-6);


    // Transition nodes to their new position.
    var nodeUpdate = node.transition()
        .duration(duration)
        .attr("transform", function(d) {
            p = calcLeft(d);
            return "translate(" + p.y + "," + p.x + ")";
        });

    nodeUpdate.select("circle")
        .attr("r", 18)
        .style("fill", function(d) {
            return d._children ? "lightsteelblue" : "#fff";
        });

    nodeUpdate.select("text")
        .style("fill-opacity", 1);

    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function(d) {
            p = calcLeft(d.parent || source);
            return "translate(" + p.y + "," + p.x + ")";
        })
        .remove();

    nodeExit.select("circle")
        .attr("r", 1e-6);

    nodeExit.select("text")
        .style("fill-opacity", 1e-6);

    // Update the links...
    var link = vis.selectAll("path.link")
        .data(tree.links(nodes), function(d) {
            return d.target.id;
        });


    // Enter any new links at the parent's previous position.
    link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("d", function(d) {
            var o = {
                x: source.x0,
                y: source.y0
            };
            return connector({
                source: o,
                target: o
            });
        });

    // Transition links to their new position.
    link.transition()
        .duration(duration)
        .attr("d", connector); /**/

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
        .duration(duration)
        .attr("d", function(d) {
            var o = calcLeft(d.source || source);
            if (d.source.isRight) o.y -= halfWidth - (d.target.y - d.source.y);
            else o.y += halfWidth - (d.target.y - d.source.y);
            return connector({
                source: o,
                target: o
            });
        })
        .remove();

    // Stash the old positions for transition.
    nodes.forEach(function(d) {
        var p = calcLeft(d);
        d.x0 = p.x;
        d.y0 = p.y;
    });

    // Toggle children on click.
    function click(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
        update(source);
    }
}

}
