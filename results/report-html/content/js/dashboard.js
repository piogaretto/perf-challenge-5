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

    var data = {"OkPercent": 52.36562067210379, "KoPercent": 47.63437932789621};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.32077626922029806, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.31841477949940405, 500, 1500, "Base64 encode test"], "isController": false}, {"data": [0.32533034450212367, 500, 1500, "POST"], "isController": false}, {"data": [0.31558075318723927, 500, 1500, "GET"], "isController": false}, {"data": [0.32204192822456473, 500, 1500, "PATCH"], "isController": false}, {"data": [0.32252701579384874, 500, 1500, "PUT"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 84481, 40242, 47.63437932789621, 1250.6945940507453, 407, 72694, 542.0, 1621.9000000000015, 2151.850000000002, 5465.19000000029, 2.3850725810948252, 1.0767581327298497, 0.4187381756196408], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Base64 encode test", 16780, 8040, 47.91418355184744, 1230.7854588796124, 408, 70663, 420.0, 1485.0, 2299.0, 20020.0, 0.4740235919112253, 0.13378535935621155, 0.06573374028456444], "isController": false}, {"data": ["POST", 16952, 8060, 47.54601226993865, 1206.653138272771, 408, 72634, 420.0, 1449.0, 2265.0, 21310.0, 0.47883894549224204, 0.25000290191244634, 0.09962166123387463], "isController": false}, {"data": ["GET", 17021, 8074, 47.435520827213445, 1278.2191410610449, 407, 72694, 420.0, 1526.800000000001, 2391.0, 22356.179999999556, 0.48055627416739133, 0.19441855717947715, 0.05349942896004161], "isController": false}, {"data": ["PATCH", 16886, 8050, 47.672628212720596, 1254.0279521497143, 407, 70472, 420.0, 1475.0, 2331.8499999999967, 22348.560000000012, 0.4769825281915713, 0.25000917769777037, 0.10110087689675834], "isController": false}, {"data": ["PUT", 16842, 8018, 47.60717254482841, 1283.7003918774478, 407, 71425, 420.0, 1495.0, 2340.4999999999854, 23521.269999999764, 0.47573741983547657, 0.2490280191000863, 0.09898341615708453], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["503/Service Temporarily Unavailable", 39860, 99.05074300482083, 47.18220665001598], "isController": false}, {"data": ["502/Bad Gateway", 372, 0.9244073356195021, 0.4403356967838922], "isController": false}, {"data": ["504/Gateway Time-out", 10, 0.024849659559664034, 0.011836981096341188], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 84481, 40242, "503/Service Temporarily Unavailable", 39860, "502/Bad Gateway", 372, "504/Gateway Time-out", 10, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Base64 encode test", 16780, 8040, "503/Service Temporarily Unavailable", 7960, "502/Bad Gateway", 76, "504/Gateway Time-out", 4, "", "", "", ""], "isController": false}, {"data": ["POST", 16952, 8060, "503/Service Temporarily Unavailable", 7980, "502/Bad Gateway", 78, "504/Gateway Time-out", 2, "", "", "", ""], "isController": false}, {"data": ["GET", 17021, 8074, "503/Service Temporarily Unavailable", 8004, "502/Bad Gateway", 70, "", "", "", "", "", ""], "isController": false}, {"data": ["PATCH", 16886, 8050, "503/Service Temporarily Unavailable", 7962, "502/Bad Gateway", 86, "504/Gateway Time-out", 2, "", "", "", ""], "isController": false}, {"data": ["PUT", 16842, 8018, "503/Service Temporarily Unavailable", 7954, "502/Bad Gateway", 62, "504/Gateway Time-out", 2, "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
