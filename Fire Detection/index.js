document.getElementById("btn").addEventListener('click', function(params) {
    var timeZone = document.getElementById("Time-Zone").value;
    // console.log(timeZone);
    var threshold = document.getElementById("Threshold").value;
    var siteName = document.getElementById("SiteName").value;
    var content = plotConc(siteName, timeZone, threshold)
        // addTable();
        // Table.innerHTML += content
})

function plotConc(fileName = "1031", timeZone = 0, threshold) {
    console.log(threshold);
    var detectDate = []
    var detectFireDate = []
    var detectFireConc = []
    var tableContent = `<table style="margin-top: 2.5px;">`
        //Create SVG element
    var w = 1500;
    var h = 1200;
    padding = 90;
    var svg = d3.select("#figure")
        .append("svg")
        .attr("width", w)
        .attr("height", h);
    svg.append("text")
        .attr("x", w / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .style("font-size", "25px")
        .attr("font-weight", "bold")
        .text("PM2.5 Concentration");

    // fetch data
    d3.dsv(",", "./Data/" + fileName + ".csv", function(d) {
        return {
            date: new Date(d["Date/Time/GMT"]),
            conc: +d["ConcHr"] * 1000
        };
    }).then(function(data) {
        // console.log(data);
        // console.log(data[0].date)
        for (let i = 0; i < data.length; i++) {
            data[i].date.setHours(data[i].date.getHours() - timeZone);
        }

        for (let i = 0; i < data.length; i++) {
            if (data[i].conc >= threshold) {
                var dateStr = prefixInteger((data[i].date.getMonth() + 1), 2) + "-" + prefixInteger(data[i].date.getDate(), 2) + "-" + data[i].date.getFullYear()
                var hourlyStr = prefixInteger((data[i].date.getMonth() + 1), 2) + "-" + prefixInteger(data[i].date.getDate(), 2) + "-" + data[i].date.getFullYear() + " " +
                    prefixInteger(data[i].date.getHours(), 2) + ":" + prefixInteger(data[i].date.getMinutes(), 2);
                var hourlyConc = data[i].conc
                detectDate.push(dateStr)
                detectFireDate.push(hourlyStr)
                detectFireConc.push(hourlyConc)
                tableContent += `<tr>
                    <td>Conc: </td><td style="text-align: left">` + hourlyStr + `</td>
                    </td><td style="text-align: left">` + hourlyConc + `</td>
                </tr>`
            }
        }
        tableContent += `</table>`;
        console.log(detectDate.filter(unique));
        // console.log(detectFireDate.length);


        // Add Table
        var myTableDiv = document.getElementById("Table");

        var table = document.createElement('TABLE');
        table.border = '1';

        var tableBody = document.createElement('TBODY');
        table.appendChild(tableBody);

        for (var i = 0; i < detectFireDate.length; i++) {
            var tr = document.createElement('TR');
            tableBody.appendChild(tr);

            for (var j = 0; j < 2; j++) {
                var td = document.createElement('TD');
                td.width = '75';
                if (j == 0) {
                    td.appendChild(document.createTextNode(detectFireDate[i]));
                } else {
                    td.appendChild(document.createTextNode(detectFireConc[i]));
                }
                tr.appendChild(td);
            }
        }
        myTableDiv.appendChild(table);

        var xScale = d3.scaleTime()
            .domain([
                d3.min(data, function(d) {
                    return d.date;
                }),
                d3.max(data, function(d) {
                    return d.date
                })
            ])
            .range([padding, w - padding * 2]);

        var yScale = d3.scaleLinear()
            .domain([
                d3.min(data, function(d) {
                    return d.conc
                }),
                d3.max(data, function(d) {
                    return d.conc
                })
            ])
            .range([h / 2 - padding, padding]);

        // create xAxis and yAxis
        var xAxis = d3.axisBottom()
            .scale(xScale)
            .ticks(d3.timeDay.every(1))
            .tickFormat(d3.timeFormat("%m/%d"));

        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + (h / 2 - padding) + ")")
            .call(xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");

        var yAxis = d3.axisLeft()
            .scale(yScale)
            .ticks(12);

        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + padding + ",0)")
            .call(yAxis)

        // Add lines
        svg.append("path")
            .datum(data)
            .attr("class", "south")
            .attr("d", d3.line()
                .x(function(d) {
                    return xScale(d.date)
                })
                .y(function(d) {
                    return yScale(d.conc)
                }));

        var thresholdLine = svg.append("line")
            .attr("x1", xScale(d3.min(data, function(d) {
                return d.date
            })))
            .attr("x2", xScale(d3.max(data, function(d) {
                return d.date
            })))
            .attr("y1", yScale(threshold))
            .attr("y2", yScale(threshold))
            .attr("stroke-width", 3)
            .attr("stroke", "red")
            // .attr("stroke-dasharray", "8,8");


        // Create Tooltips
        var tip = d3.tip().attr('class', 'd3-tip').direction('e').offset([0, 5])
            .html(function(d) {
                // var content = "<span style='margin-left: 2.5px;'><b>" + d.conc + "</b></span><br>";
                var datestring = prefixInteger((d.date.getMonth() + 1), 2) + "-" + prefixInteger(d.date.getDate(), 2) + "-" + d.date.getFullYear() + " " +
                    prefixInteger(d.date.getHours(), 2) + ":" + prefixInteger(d.date.getMinutes(), 2);
                var content = `
                    <table style="margin-top: 2.5px;">
                            <tr><td>Conc: </td><td style="text-align: left">` + d.conc + `</td></tr>
                            <tr><td>Date: </td><td style="text-align: left">` + datestring + `</td></tr>
                    </table>
                    `;
                return content;
            });
        svg.call(tip);

        svg.selectAll("circles")
            .data(data)
            .enter()
            .append("circle")
            .attr("fill", function(d) {
                if (d.conc >= threshold) {
                    return "red"
                } else {
                    return "black"
                }
            })
            .attr('r', 3)
            .attr('cx', function(d) {
                return xScale(d.date)
            })
            .attr('cy', function(d) {
                return yScale(d.conc);
            })
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide)

    });

    return tableContent
}

function prefixInteger(num, length) {
    return ("0000000000000000" + num).substr(-length);
}

const unique = (value, index, self) => {
    return self.indexOf(value) === index
}

// function addTable() {
//     var myTableDiv = document.getElementById("Table");

//     var table = document.createElement('TABLE');
//     table.border = '1';

//     var tableBody = document.createElement('TBODY');
//     table.appendChild(tableBody);

//     for (var i = 0; i < 3; i++) {
//         var tr = document.createElement('TR');
//         tableBody.appendChild(tr);

//         for (var j = 0; j < 4; j++) {
//             var td = document.createElement('TD');
//             td.width = '75';
//             td.appendChild(document.createTextNode("Cell " + i + "," + j));
//             tr.appendChild(td);
//         }
//     }
//     myTableDiv.appendChild(table);
// }

// function generateTable(date, conc) {
//     console.log("hello" + date);
//     var content = `
//     <table style="margin-top: 2.5px;">`
//     for (let i = 0; i < date.length; i++) {
//         thisDate = date[i]
//         thisConc = conc[i]
//         content += `<tr>
//                         <td>Conc: </td><td style="text-align: left">` + thisDate + `</td>
//                         </td><td style="text-align: left">` + thisConc + `</td>
//                     </tr>`
//     }
//     content += `</table>`;
//     console.log(content);
//     return content;
// }