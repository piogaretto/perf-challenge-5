/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 50.293228110873834, "KoPercent": 49.706771889126166};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.29995447105117673, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.2979339746392654, 500, 1500, "Base64 encode test"], "isController": false}, {"data": [0.30462003454231434, 500, 1500, "POST"], "isController": false}, {"data": [0.2943784597194604, 500, 1500, "GET"], "isController": false}, {"data": [0.30066139000325276, 500, 1500, "PATCH"], "isController": false}, {"data": [0.30219899847594167, 500, 1500, "PUT"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 92249, 45854, 49.706771889126166, 1431.5713991479715, 407, 72694, 434.0, 1924.9000000000015, 4623.700000000019, 43425.19000000077, 1.0640369033452195, 0.4750250530961612, 0.18640474163744725], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Base64 encode test", 18296, 9150, 50.010931351115, 1424.5613248797495, 408, 70663, 420.0, 1535.0, 2540.0, 28103.23999999964, 0.21109297993888665, 0.059935764114013426, 0.0292726593274628], "isController": false}, {"data": ["POST", 18528, 9182, 49.55742659758204, 1422.0739421416263, 408, 72634, 420.0, 1521.1000000000022, 2536.649999999998, 29835.0, 0.2137568426157677, 0.1099763436240809, 0.04433573598847144], "isController": false}, {"data": ["GET", 18607, 9198, 49.43300908260332, 1462.4949750094079, 407, 72694, 420.0, 1606.0, 2696.7999999999956, 28279.67999999982, 0.2146338035517367, 0.08617125288895404, 0.02389477891103319], "isController": false}, {"data": ["PATCH", 18446, 9178, 49.75604467093137, 1451.141494090864, 407, 70472, 420.0, 1554.2999999999993, 2538.5999999999913, 28943.839999999967, 0.2128133847551202, 0.10984650639935939, 0.04497311106748548], "isController": false}, {"data": ["PUT", 18372, 9146, 49.78227737861964, 1397.1625299368563, 407, 71425, 420.0, 1556.0, 2486.0, 28007.0, 0.2119560078452796, 0.1091912571313644, 0.04396811163135243], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["503/Service Temporarily Unavailable", 45458, 99.1363894098661, 49.27749894307797], "isController": false}, {"data": ["502/Bad Gateway", 384, 0.8374405722510577, 0.4162646749558261], "isController": false}, {"data": ["504/Gateway Time-out", 12, 0.026170017882845554, 0.013008271092369565], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 92249, 45854, "503/Service Temporarily Unavailable", 45458, "502/Bad Gateway", 384, "504/Gateway Time-out", 12, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Base64 encode test", 18296, 9150, "503/Service Temporarily Unavailable", 9068, "502/Bad Gateway", 76, "504/Gateway Time-out", 6, "", "", "", ""], "isController": false}, {"data": ["POST", 18528, 9182, "503/Service Temporarily Unavailable", 9102, "502/Bad Gateway", 78, "504/Gateway Time-out", 2, "", "", "", ""], "isController": false}, {"data": ["GET", 18607, 9198, "503/Service Temporarily Unavailable", 9120, "502/Bad Gateway", 78, "", "", "", "", "", ""], "isController": false}, {"data": ["PATCH", 18446, 9178, "503/Service Temporarily Unavailable", 9088, "502/Bad Gateway", 88, "504/Gateway Time-out", 2, "", "", "", ""], "isController": false}, {"data": ["PUT", 18372, 9146, "503/Service Temporarily Unavailable", 9080, "502/Bad Gateway", 64, "504/Gateway Time-out", 2, "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
