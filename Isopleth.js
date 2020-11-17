// [ 1.00088265e-01 -9.15305412e-03  5.70636157e-05 -7.37852968e-05
//     2.82905153e-06]
//     CNOx', 'CVOC', 'NOxVOC', 'NOx2', 'VOC2'
document.getElementById("btn").onclick = function() {
    var latitude = document.getElementById("latitude").value
    var longitude = document.getElementById("longitude").value
        // console.log(latitude);
        // console.log(longitude);
        // plotIsopleth(latitude, longitude)
    plotIsopleth(latitude, longitude)
}


function plotIsopleth(lat, lon) {
    var intercept = 46.22680498
    var coef = [-2.53823584e+02, 6.74258530e+02, -2.52075979e-01, 1.88480123e-01, -2.71951161e-01, 3.35891500e+00, -2.52640385e+01, 1.65392074e-03, -2.48226819e-03, 1.01169298e-02, -3.31047259e+00, 4.10765477e+00, -3.79876620e-03, 2.46427890e-03, -1.67791140e-03, 1.73974471e-01, -1.60388783e-01, -2.25016768e-05, -1.15533532e-04, 6.44045682e-05,
        2.53536151e-01, 9.39121690e-02, -6.24467076e-05, -1.64696567e-04, -3.72954476e-05, 1.10584583e-02, -5.93558246e-03, -1.94229932e-05, -6.21234329e-06, 2.26202297e-06
    ]
    console.log(coef);
    var width = 600;
    var height = 400;
    value = (VOC, NOx) =>
        intercept + coef[0] * NOx + coef[1] * VOC + coef[2] * NOx * VOC + coef[3] * NOx * NOx + coef[4] * VOC * VOC +
        coef[5] * lat * NOx + coef[6] * lat * VOC + coef[7] * lat * NOx * VOC + coef[8] * lat * NOx * NOx + coef[9] * lat * VOC * VOC +
        coef[10] * lon * NOx + coef[11] * lon * VOC + coef[12] * lon * NOx * VOC + coef[13] * lon * NOx * NOx + coef[14] * lon * VOC * VOC +
        coef[15] * lon * lat * NOx + coef[16] * lon * lat * VOC + coef[17] * lon * lat * NOx * VOC + coef[18] * lon * lat * NOx * NOx + coef[19] * lon * lat * VOC * VOC +
        coef[20] * lat * lat * NOx + coef[21] * lat * lat * VOC + coef[22] * lat * lat * NOx * VOC + coef[23] * lat * lat * NOx * NOx + coef[24] * lat * lat * VOC * VOC +
        coef[25] * lon * lon * NOx + coef[26] * lon * lon * VOC + coef[27] * lon * lon * NOx * VOC + coef[28] * lon * lon * NOx * NOx + coef[29] * lon * lon * VOC * VOC

    var svg = d3.select("#Isopleth")
        .append("svg")
        .attr("height", height + 300)
        .attr("width", width + 300)
        .attr("transform", "translate(40,20)")
        .attr("id", "Isosvg");

    thresholds = d3.range(0, 30).map(i => 5 * i);

    // VOC and NOx range
    x = d3.scaleLinear([0, 2500], [0, width + 28])
    y = d3.scaleLinear([0, 1500], [height, 0])

    // Generate Grids
    const q = 4; // The level of detail, e.g., sample every 4 pixels in x and y.
    const x0 = -q / 2,
        x1 = width + 28 + q;
    const y0 = -q / 2,
        y1 = height + q;
    const n = Math.ceil((x1 - x0) / q);
    const m = Math.ceil((y1 - y0) / q);
    const grid = new Array(n * m);
    for (let j = 0; j < m; ++j) {
        for (let i = 0; i < n; ++i) {
            grid[j * n + i] = value(x.invert(i * q + x0), y.invert(j * q + y0));
        }
    }
    // console.log(grid);
    grid.x = -q;
    grid.y = -q;
    grid.k = q;
    grid.n = n;
    grid.m = m;

    // Converts from grid coordinates (indexes) to screen coordinates (pixels).
    transform = ({ type, value, coordinates }) => {
        return {
            type,
            value,
            coordinates: coordinates.map(rings => {
                return rings.map(points => {
                    return points.map(([x, y]) => ([
                        grid.x + grid.k * x,
                        grid.y + grid.k * y
                    ]));
                });
            })
        };
    }

    contours = d3.contours()
        .size([grid.n, grid.m])
        .thresholds(thresholds)
        (grid)
        .map(transform)

    xAxis = g => g
        .attr("transform", `translate(40,${height})`)
        .call(d3.axisBottom(x).ticks(width / height * 10))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick").filter(d => x.domain().includes(d)).remove())

    yAxis = g => g
        .attr("transform", "translate(40,0)")
        .call(d3.axisLeft(y))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick").filter(d => y.domain().includes(d)).remove())

    color = d3.scaleSequential(d3.extent(thresholds), d3.interpolateMagma)

    continuous("#Isopleth", color);



    svg.append("g")
        .attr("fill", "none")
        .attr("stroke", "#fff")
        .attr("stroke-opacity", 0.5)
        .selectAll("path")
        .data(contours)
        .join("path")
        .attr("fill", d => color(d.value))
        .attr("d", d3.geoPath())
        .attr("transform", "translate(40,0)");

    svg.append("g")
        .call(xAxis);

    svg.append("g")
        .call(yAxis);
}


function continuous(selector_id, colorscale) {
    var legendheight = 200,
        legendwidth = 80,
        margin = {
            top: 10,
            right: 60,
            bottom: 10,
            left: 2
        };

    var globalWidth = 600;
    var globalHeight = 400;

    var canvas = d3.select(selector_id)
        .append("canvas")
        .attr("height", legendheight - margin.top - margin.bottom)
        .attr("width", 1)
        .style("height", (legendheight - margin.top - margin.bottom) + "px")
        .style("width", (legendwidth - margin.left - margin.right) + "px")
        .style("border", "1px solid #000")
        .style("position", "absolute")
        .style("top", "150px")
        .style("left", "300px")
        .node();

    var ctx = canvas.getContext("2d");

    var legendscale = d3.scaleLinear()
        .range([legendheight - margin.top - margin.bottom, 1])
        .domain(colorscale.domain());

    // image data hackery based on http://bl.ocks.org/mbostock/048d21cf747371b11884f75ad896e5a5
    var image = ctx.createImageData(1, legendheight);
    d3.range(legendheight).forEach(function(i) {
        var c = d3.rgb(colorscale(legendscale.invert(i)));
        image.data[4 * i] = c.r;
        image.data[4 * i + 1] = c.g;
        image.data[4 * i + 2] = c.b;
        image.data[4 * i + 3] = 255;
    });
    ctx.putImageData(image, 0, 0);

    // A simpler way to do the above, but possibly slower. keep in mind the legend width is stretched because the width attr of the canvas is 1
    // See http://stackoverflow.com/questions/4899799/whats-the-best-way-to-set-a-single-pixel-in-an-html5-canvas
    /*
    d3.range(legendheight).forEach(function(i) {
      ctx.fillStyle = colorscale(legendscale.invert(i));
      ctx.fillRect(0,i,1,1);
    });
    */

    var legendaxis = d3.axisRight()
        .scale(legendscale)
        .tickSize(6)
        .ticks(8);

    var svg = d3.select(selector_id)
        .append("svg")
        .attr("height", (legendheight) + "px")
        .attr("width", (legendwidth) + "px")
        .style("position", "absolute")
        .style("left", "298px")
        .style("top", "140px")

    svg
        .append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + (legendwidth - margin.left - margin.right + 3) + "," + (margin.top) + ")")
        .call(legendaxis);
};