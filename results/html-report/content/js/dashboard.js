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

    var data = {"OkPercent": 11.922881785895484, "KoPercent": 88.07711821410452};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.01997441157655571, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.01904761904761905, 500, 1500, "Base64 encode test"], "isController": false}, {"data": [0.021346830985915492, 500, 1500, "POST"], "isController": false}, {"data": [0.019811217209965974, 500, 1500, "GET"], "isController": false}, {"data": [0.019319938176197836, 500, 1500, "PATCH"], "isController": false}, {"data": [0.02034048198098607, 500, 1500, "PUT"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 45333, 39928, 88.07711821410452, 1208.8236825270758, 407, 60418, 419.0, 428.0, 2307.2000000000116, 22970.360000000423, 68.89744033995058, 24.402591217430523, 12.37720963409871], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Base64 encode test", 9030, 7972, 88.28349944629015, 1167.6797342192717, 408, 60410, 418.0, 954.0, 2945.0, 22682.630000000114, 14.525671671562177, 4.572173325204534, 2.0143021263299112], "isController": false}, {"data": ["POST", 9088, 7996, 87.98415492957747, 1207.217649647888, 408, 60418, 418.0, 981.3000000000011, 2981.0999999999985, 23039.510000000082, 14.199400962771882, 5.268768812682902, 3.0506525505955215], "isController": false}, {"data": ["GET", 9111, 8018, 88.00351223795413, 1207.7411919657557, 407, 59810, 418.0, 1075.4000000000087, 3161.0, 23073.0, 13.846967527789683, 4.742887786996678, 1.5415569318047109], "isController": false}, {"data": ["PATCH", 9058, 7976, 88.05475822477368, 1255.2700375358786, 407, 60415, 418.0, 1036.0, 3034.9499999999716, 24276.959999999977, 14.385655636816987, 5.342484177843422, 3.146862170553716], "isController": false}, {"data": ["PUT", 9046, 7966, 88.06102144594296, 1206.0906478001314, 407, 60417, 418.0, 996.3000000000002, 2948.7999999999956, 23967.52000000012, 14.210422966657502, 5.273923806110827, 3.053020559242823], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["503/Service Temporarily Unavailable", 39860, 99.82969344820677, 87.92711711115523], "isController": false}, {"data": ["502/Bad Gateway", 58, 0.1452614706471649, 0.12794211722145016], "isController": false}, {"data": ["504/Gateway Time-out", 10, 0.025045081146062912, 0.022058985727836235], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 45333, 39928, "503/Service Temporarily Unavailable", 39860, "502/Bad Gateway", 58, "504/Gateway Time-out", 10, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Base64 encode test", 9030, 7972, "503/Service Temporarily Unavailable", 7960, "502/Bad Gateway", 8, "504/Gateway Time-out", 4, "", "", "", ""], "isController": false}, {"data": ["POST", 9088, 7996, "503/Service Temporarily Unavailable", 7980, "502/Bad Gateway", 14, "504/Gateway Time-out", 2, "", "", "", ""], "isController": false}, {"data": ["GET", 9111, 8018, "503/Service Temporarily Unavailable", 8004, "502/Bad Gateway", 14, "", "", "", "", "", ""], "isController": false}, {"data": ["PATCH", 9058, 7976, "503/Service Temporarily Unavailable", 7962, "502/Bad Gateway", 12, "504/Gateway Time-out", 2, "", "", "", ""], "isController": false}, {"data": ["PUT", 9046, 7966, "503/Service Temporarily Unavailable", 7954, "502/Bad Gateway", 10, "504/Gateway Time-out", 2, "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
