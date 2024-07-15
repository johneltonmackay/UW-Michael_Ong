/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/record', 'N/search', 'N/ui/serverWidget'],
    /**
 * @param{record} record
 * @param{search} search
 * @param{serverWidget} serverWidget
 */
(record, search, serverWidget) => {
    /**
     * Defines the Suitelet script trigger point.
     * @param {Object} scriptContext
     * @param {ServerRequest} scriptContext.request - Incoming request
     * @param {ServerResponse} scriptContext.response - Suitelet response
     * @since 2015.2
     */
    const onRequest = (scriptContext) => {
        const response = scriptContext.response;
        const form = serverWidget.createForm({
            title: 'Google Charts'
        });
        let chartData = getSORecords();

        // Add a field to hold the combined chart
        const combinedChartField = form.addField({
            id: 'custpage_combined_chart',
            type: serverWidget.FieldType.INLINEHTML,
            label: 'Combined Chart'
        });
    
        // Set up the combined chart HTML with dynamic data
        combinedChartField.defaultValue = `
            <div id="chart_div" style="width: auto; height: auto;"></div>
            <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
            <script type="text/javascript">
                google.charts.load('current', {'packages':['corechart']});
                google.charts.setOnLoadCallback(drawVisualization);
        
                function drawVisualization() {
                // Some raw data (not necessarily accurate)
                var data = google.visualization.arrayToDataTable(${JSON.stringify(chartData)});
        
                var options = {
                    title : 'Sales Order: Previous Year vs Current Year',
                    vAxis: {title: 'Sales Amount'},
                    hAxis: {title: 'Month'},
                    seriesType: 'bars',
                    series: {0: {type: 'line'}}
                };
        
                var chart = new google.visualization.ComboChart(document.getElementById('chart_div'));
                chart.draw(data, options);
                }
            </script>
      `;
    
        response.writePage(form);
    };
    
    
    const getSORecords = () => {
        let arrTransaction = [
            ['Month', '2023', '2024'],
            ['Jan', 400000000, 300000000],
            ['Feb', 500000000, 400000000],
            ['Mar', 0, 0],
            ['Apr', 0, 0],
            ['May', 0, 0],
            ['June', 0, 0],
            ['July', 0, 0],
            ['Aug', 0, 0],
            ['Sep', 0, 0],
            ['Oct', 0, 0],
            ['Nov', 0, 0],
            ['Dec', 0, 0]
        ];
        try {
            let objTransactionSearch = search.create({
                type: 'transaction',
                filters: [
                    ['type', 'anyof', 'SalesOrd'],
                    'AND',
                    ['mainline', 'is', 'T'],
                ],
                columns: [
                    search.createColumn({name: 'amount'}),
                    search.createColumn({ name: 'trandate' }),
                    search.createColumn({ name: 'internalid' })
                ],

            });
            var searchResultCount = objTransactionSearch.runPaged().count;
            if (searchResultCount != 0) {
                var pagedData = objTransactionSearch.runPaged({pageSize: 1000});
                for (var i = 0; i < pagedData.pageRanges.length; i++) {
                    var currentPage = pagedData.fetch(i);
                    var pageData = currentPage.data;
                    if (pageData.length > 0) {
                        for (var pageResultIndex = 0; pageResultIndex < pageData.length; pageResultIndex++) {
                            var intAmount = parseFloat(pageData[pageResultIndex].getValue({ name: 'amount' }));
                            var strDate = pageData[pageResultIndex].getValue({ name: 'trandate' });
                            let dtDate = new Date(strDate);
                            let month = dtDate.getMonth() + 1; // JavaScript months are 0-indexed
                            let year = dtDate.getFullYear();
                
                            // Determine the column based on the year (2023 or 2024)
                            let yearColumnIndex = year === 2023 ? 1 : 2;
                
                            // The row index is the same as the month since our array starts with ['Month', '2023', '2024']
                            let rowIndex = month; // Assuming month is 1-indexed, adjust if necessary
                
                            if (rowIndex === 10) {
                                rowIndex = 1;
                            } else if (rowIndex === 11) {
                                rowIndex = 2;
                            }
                
                            // Add the amount to the existing value
                            arrTransaction[rowIndex][yearColumnIndex] += intAmount;
                        }
                    }
                }
                
            }
            log.debug(`getInputData: arrTransaction ${Object.keys(arrTransaction).length}`, arrTransaction);
            return arrTransaction;
        } catch (err) {
            log.error('getInputData error', err.message);
        }
    }


    return {onRequest};
});
