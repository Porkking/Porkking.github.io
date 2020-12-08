// create selections
var tag = ["2002", "2003", "2004", "2005", "2006", "2007", "2008", "2009", "2010"];

var select = d3.select('#piechart')
    .append('select')
    .attr('class', 'select')
    .on('change', onchange)

var options = select.selectAll('option')
    .data(tag).enter()
    .append('option')
    .attr('id', 'year')
    .text(function(d) { return d; });

Plot(2002);

function onchange() {
    var selectValue = d3.select('select').property('value');
    svg2.select('#pieGroup').remove();
    Plot(selectValue);
};

// svg canvas
var svg2 = d3.select("#piechart")
    .append("svg")
    .attr("width", w)
    .attr("height", h);

// svg2.append("text")
//     .attr("x", w / 2)
//     .attr("y", 30)
//     .attr("text-anchor", "middle")
//     .style("font-size", "25px")
//     .attr("font-weight", "bold")
//     .text("Pie Chart");

var radius = Math.min(w, h) / 2 - padding;
// var piegroup = svg2.append("g")
//     .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")")
//     .attr("id", "pieGroup");

// read data
// 'LDGV'; 'HDDV'; 'SDUST'; 'BURN';'CFPP';'AMSULF';'AMBSULF';'AMNITR';'SOC';'SS';'Other'
function Plot(selectYear) {
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
        var piegroup = svg2.append("g")
            .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")")
            .attr("id", "pieGroup");

        var category = ["LDGV", "HDDV", "SDUST", "BURN", "CFPP", "AMSULF", "AMBSULF", "AMNITR", "SOC", "SS", "Other"];
        // create dataset we need
        var selectData = [];
        for (var i = 0; i < data.length; i++) {
            if (data[i]["year"] == selectYear) {
                Object.keys(data[i]).forEach(function(key) {
                    if (key != "year") {
                        selectData.push(data[i][key]);
                    }
                })
            }
        }

        var total = 0;
        for (var i = 0; i < selectData.length; i++) {
            total = total + selectData[i];
        }
        // plot the figure
        piegroup.append("text")
            .attr("x", 0)
            .attr("y", -h / 2 + 50)
            .attr("text-anchor", "middle")
            .style("font-size", "25px")
            .attr("font-weight", "bold")
            .text("Sources Contributions in " + selectYear);

        var color = d3.scaleOrdinal()
            .range(["#c03500", "#ffc0cb", "#f2b447", "#f9feae", "#c8fb75", "#21b10b", "#96d8f1", "#0095f7", "#3957ff", "#df9ceb", "#9108f8"])
            .domain(category);

        var pie = d3.pie().sort(null);
        var piedata = pie(selectData);

        // Generate the arcs
        var arc = d3.arc()
            .innerRadius(0)
            .outerRadius(radius);

        var tip = d3.tip()
            .attr('class', 'd3-tip')
            .html(function(d) {
                var decimal = d3.format(".3f")
                var percentage = decimal((d.data / total) * 100);
                return percentage + "%";
            });

        piegroup.call(tip);
        //Generate groups
        var arcs = piegroup.selectAll("arc")
            .data(piedata)
            .enter()
            .append("g")
            .attr("class", "arc");

        var path = arcs.append("path")
            .attr("fill", function(d, i) { return color(category[i]); })
            .attr("d", arc)
            .attr("stroke", "#fff")
            .attr("stroke-width", 2)
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);

        var legendData = [];
        for (var i = category.length - 1; i >= 0; i--) {
            var obj = {};
            obj["name"] = category[i];
            legendData.push(obj);
        }

        var legend = piegroup.selectAll("legend")
            .data(legendData)
            .enter()
            .append("g")
            .attr("height", 100)
            .attr("width", 100)
            .attr("transform", "translate(350,10)");

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

    })
}