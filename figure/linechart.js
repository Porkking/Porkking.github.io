var barpadding = 1;
var categorytag = ["LDGV", "HDDV", "SDUST", "BURN", "CFPP", "AMSULF", "AMBSULF", "AMNITR", "SOC", "SS"];

var select = d3.select('#linechart')
    .append('select')
    .attr('class', 'selectCat')
    .on('change', update)

var options = select.selectAll('option')
    .data(categorytag).enter()
    .append('option')
    .attr('id', 'category')
    .text(function(d) { return d; });

plotLine("LDGV")
plotFigure("LDGV")

function update() {
    var selectValue = d3.select('.selectCat').property('value');
    svg3.select('#lgroup').remove();
    plotLine(selectValue);
    plotFigure(selectValue);
}

var svg3 = d3.select("#linechart")
    .append("svg")
    .attr("width", w)
    .attr("height", h);

function plotLine(selectValue) {
    d3.dsv(",", "line.csv", function(d) {
        return {
            date: new Date(d.year, d.month - 1),
            category: d["category"],
            concentration: +d["concentration"]
        };
    }).then(function(data) {
        var lineGroup = svg3.append("g").attr("id", "lgroup");

        lineGroup.append("text")
            .attr("x", w / 2)
            .attr("y", 30)
            .attr("text-anchor", "middle")
            .style("font-size", "25px")
            .attr("font-weight", "bold")
            .text(selectValue)

        var totalconcentration = []
        var filterData = [];
        for (var i = 0; i < data.length; i++) {
            // console.log(data[i]["category"]);
            if (data[i]["category"] == selectValue) {
                filterData.push(data[i]);
            }
        }

        for (var i = 2002; i <= 2010; i++) {
            var temp = 0;
            var obj = {};
            obj["date"] = new Date(i, 5);
            for (var j = 0; j < filterData.length; j++) {
                if (filterData[j]["date"].getFullYear() == i) {
                    temp = temp + filterData[j]["concentration"];
                }
            }
            obj["concentration"] = temp / 12;
            totalconcentration.push(obj);
        }
        // // create Axis and Scale

        var color = d3.scaleOrdinal()
            .range(["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00", "#ffff33", "#a65628", "#f781bf", "#999999"])
            .domain([2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010]);
        // var color = d3.scaleQuantize([2002, 2010], d3.schemeReds[9])

        var xScale = d3.scaleTime()
            .domain([new Date(2002, 0), new Date(2010, 11)])
            .range([padding, w - padding]);

        var yScale = d3.scaleLinear()
            .domain([0, d3.max(filterData, function(d) {
                return d.concentration;
            })])
            .range([h - padding, padding]);

        var xAxis = d3.axisBottom().scale(xScale).ticks(20).tickFormat(d3.time.format("%b %Y"));;
        var yAxis = d3.axisLeft().scale(yScale);

        lineGroup.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + (h - padding) + ")")
            .call(xAxis)
            .selectAll("text")
            .attr("transform", "rotate(45)")
            .style("text-anchor", "start")

        lineGroup.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + padding + ",0)")
            .call(yAxis)
            .append("text")
            .text("Concentration unit: μg/m³")
            .attr('fill', 'black')
            .attr('transform', 'rotate(-90)')
            .attr('x', -210)
            .attr('y', -50)
            .attr('font-size', 15);

        lineGroup.selectAll("rect")
            .data(filterData)
            .enter().append("rect")
            .attr("width", (w - 2 * padding) / filterData.length - barpadding)
            .attr("x", function(d) { return xScale(d["date"]); })
            .attr("y", h - padding)
            .transition().duration(750)
            .attr("y", function(d) { return yScale(d["concentration"]); })
            .attr("height", function(d) { return h - padding - yScale(d["concentration"]) })
            .style("fill", function(d) { return color(d["date"].getFullYear()) });

        var line = d3.line()
            .x(function(d) { return xScale(d.date); })
            .y(function(d) { return yScale(d.concentration); });

        var path = lineGroup.append("path")
            .datum(totalconcentration)
            .attr("fill", "none")
            .attr("stroke", "red")
            .attr("stroke-width", 1.5)
            .attr("class", "line")
            .attr("d", line);

        var totalLength = path.node().getTotalLength()
        path.attr("stroke-dasharray", totalLength + " " + totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition()
            .duration(1000)
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0);

        lineGroup.append('g')
            .selectAll("dot")
            .data(totalconcentration)
            .enter()
            .append("circle")
            .attr("cx", function(d) { return xScale(d.date); })
            .attr("cy", function(d) { return yScale(d.concentration); })
            .attr("r", 3)
            .style("fill", "red")

    })
}


function plotFigure(selectValue) {
    var source = "../MATLAB/" + selectValue + ".jpg";
    var div = document.getElementById("ArcGIS");
    console.dir(div);
    div.innerHTML = "<img src=\"" + source + "\">";
}