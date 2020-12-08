//Create SVG element
var w = 1000;
var h = 600;
padding = 100;
var svg1 = d3.select("#stackbarchart")
    .append("svg")
    .attr("width", w)
    .attr("height", h);

svg1.append("text")
    .attr("x", w / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .style("font-size", "25px")
    .attr("font-weight", "bold")
    .text("Sources Contributions in 2002 - 2010");

// 'LDGV'; 'HDDV'; 'SDUST'; 'BURN';'CFPP';'AMSULF';'AMBSULF';'AMNITR';'SOC';'SS';'Other'
d3.dsv(",", "stack.csv", function(d) {
    return {
        year: +d["year"],
        LDGV: +d["LDGV"],
        HDDV: +d["HDDV"],
        SDUST: +d["SDUST"],
        BURN: +d["BURN"],
        CFPP: +d["CFPP"],
        AMSULF: +d["AMSULF"],
        AMBSULF: +d["AMBSULF"],
        AMNITR: +d["AMNITR"],
        SOC: +d["SOC"],
        SS: +d["SS"],
        Other: +d["Other"]
    };
}).then(function(data) {
    var dataset = [];
    var category = ["LDGV", "HDDV", "SDUST", "BURN", "CFPP", "AMSULF", "AMBSULF", "AMNITR", "SOC", "SS", "Other"];
    // create dataset we need
    for (var i = 0; i < data.length; i++) {
        var subLength = [data[i]["LDGV"], data[i]["HDDV"], data[i]["SDUST"], data[i]["BURN"], data[i]["CFPP"], data[i]["AMSULF"], data[i]["AMBSULF"], data[i]["AMNITR"],
            data[i]["SOC"], data[i]["SS"], data[i]["Other"]
        ];
        var end = [];
        var start = [0];
        var year = data[i]["year"];
        for (var j = 0; j < subLength.length; j++) {
            var temp = 0;
            for (var k = 0; k <= j; k++) {
                temp = temp + subLength[k];
            }
            end.push(temp);
        }
        for (var j = 0; j < end.length - 1; j++) {
            start.push(end[j]);
        }

        for (var j = 0; j < start.length; j++) {
            var obj = {};
            obj["name"] = category[j % 11];
            obj["year"] = year;
            obj["start"] = start[j];
            obj["end"] = end[j];
            dataset.push(obj);
        }
    }

    // create Axis and Scale
    var xScale = d3.scaleBand()
        .domain([2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010])
        .range([padding, w - padding])
        .paddingInner(0.2)
        .paddingOuter(0.2);

    var yScale = d3.scaleLinear()
        .domain([0, d3.max(dataset, function(d) {
            return d.end;
        })])
        .range([h - padding, padding]);

    var xAxis = d3.axisBottom().scale(xScale);
    var yAxis = d3.axisLeft().scale(yScale);

    var group = svg1.append("g").attr("id", "stack");

    group.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + (h - padding) + ")")
        .call(xAxis)
        .append("text")
        .text("Year")
        .attr('fill', 'black')
        .attr('x', w / 2)
        .attr('y', padding / 2)
        .attr('font-size', 15);

    group.append("g")
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

    var color = d3.scaleOrdinal()
        .range(["#c03500", "#ffc0cb", "#f2b447", "#f9feae", "#c8fb75", "#21b10b", "#96d8f1", "#0095f7", "#3957ff", "#df9ceb", "#9108f8"])
        .domain(category);

    // // add rect
    // add tips
    // Add Map
    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(function(d) {
            var decimal = d3.format(".3f")
            var concentration = decimal(d.end - d.start);
            return concentration + " μg/m³";
        });

    group.call(tip);

    group.selectAll("rect")
        .data(dataset)
        .enter().append("rect")
        .attr("width", xScale.bandwidth())
        .attr("x", function(d) {
            return xScale(d["year"]);
        })
        .attr("y", function(d) {
            return yScale(d["end"]);
        })
        .attr("height", function(d) {
            return yScale(d.start) - yScale(d.end);
        })
        .style("fill", function(d) {
            return color(d.name);
        })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);

    var legendData = [];
    for (var i = category.length - 1; i >= 0; i--) {
        var obj = {};
        obj["name"] = category[i];
        legendData.push(obj);
    }

    var legend = group.selectAll("legend")
        .data(legendData)
        .enter()
        .append("g")
        .attr("height", 100)
        .attr("width", 100)
        .attr("transform", "translate(910,100)");

    legend.append("circle")
        .attr('r', 5)
        .attr('cy', function(d, i) {
            return 20 * i;
        })
        .attr("fill", function(d) {
            return color(d.name)
        });

    legend.append("text")
        .text(function(d) {
            return d.name;
        })
        .attr('text-anchor', 'start')
        .attr('y', function(d, i) {
            return 20 * i + 5;
        })
        .attr('x', 10);

});