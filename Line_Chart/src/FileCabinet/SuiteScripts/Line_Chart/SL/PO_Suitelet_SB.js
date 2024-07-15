/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */

define(['N/file', 'N/record', 'N/search', 'N/ui/serverWidget', 'N/url', 'N/redirect', 'N/log', 'N/runtime'],

    function(file, record, search, ui, url, redirect, log, runtime) {

        function onRequest(context) {

            var stFormName = 'Purchase Order';

            var form = ui.createForm({
                title: stFormName
            });

            if(context.request.method === 'GET') {

                try{

                    designHTML(form);

                    // form.addSubmitButton({
                    //     label: 'Save'
                    // });

                    // finally show content
                    context.response.writePage(form);

                }
                catch(ex) {
                    log.debug({title: 'Error in GET', details: ex});
                    context.response.write('Error: ' + ex.message);
                }

            } else if (context.request.method == 'POST') {

                const params = context.request.parameters;

                var poDate = new Date(params['custpage_date']);
                var vendorId =  params['custpage_vendor'];
                var locationId = params['custpage_location'];
                var employeeId = params['custpage_employee'];
                var lineCount = context.request.getLineCount('itemsublist');
                log.debug('lineCount', lineCount);

                var items = [];
                var itemQuantity = [];
                var itemRate = [];
                var itemAmount;
                var quantity;
                var itemId;
                var amount;
                var rate;

                if (lineCount > 0) {

                    for (var x = 0; x < lineCount; x++) {

                        quantity = context.request.getSublistValue({
                            group : 'itemsublist',
                            name : 'custpage_po_quantity',
                            line : x
                        });

                        itemQuantity.push(quantity);

                        itemId = context.request.getSublistValue({
                            group : 'itemsublist',
                            name : 'custpage_po_item',
                            line : x
                        });

                        items.push(itemId);

                        // amount = context.request.getSublistValue({
                        //     group : 'itemsublist',
                        //     name : 'custpage_po_amount',
                        //     line : x
                        // });

                        // itemAmount.push(amount);

                        rate = context.request.getSublistValue({
                            group : 'itemsublist',
                            name : 'custpage_po_rate',
                            line : x
                        });

                        itemRate.push(rate);

                    }
                }

                itemAmount = computeAmount(itemRate, itemQuantity);
                log.debug('itemAmount', JSON.stringify(itemAmount));

                var id = createPurchaseOrder(poDate, vendorId, locationId, employeeId, lineCount, items, itemQuantity, itemAmount, itemRate);

                if (id) {
                    context.response.write('<div style="text-align:center;margin-top:10%; font-size: 20px;"><p style="color: green;">Purchcase Order&nbsp;' + id + ' successfully saved!</p>');
                } else {
                    context.response.write('<div style="text-align:center;margin-top:10%; font-size: 20px;"><p style="color: red;">No Data Saved</p>');
                }

            }
        }

        const designHTML = (form) => {
            return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Background and Main Content Divs</title>
            <style>
                body {
                    margin: 0;
                    padding: 0;
                }
                .background {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: #f0f0f0; /* Set your desired background color */
                    z-index: -1; /* Ensures the background stays behind other content */
                }
                .content {
                    padding: 20px;
                    margin: 20px;
                    background-color: white;
                    border-radius: 5px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
            </style>
            </head>
            <body>
                <div class="background"></div>
                <div class="content" id="suitelet-content">
                    <!-- Suitelet content will be inserted here -->
                </div>
                

            </body>
            </html>
            `;
        }

        function designForm(form) {

            form.addFieldGroup({id: 'mainOrder', label: ' '});
            form.addFieldGroup({id: 'purchaseOrder', label: 'Primary Information'});
            form.addFieldGroup({id: 'classification', label: 'Classification'});

           var htmlImage = form.addField({
                id: 'custpage_htmlfield',
                type: ui.FieldType.INLINEHTML,
                label: 'HTML Image',
                container: 'mainOrder'
            });

            htmlImage.defaultValue = "<img src='https://tstdrv1537306.app.netsuite.com/core/media/media.nl?id=16123&c=TSTDRV1537306&h=KV0DlEZjIPePjWuRssvzTe1E2dLCJ3SAZqmBH5dEViybyTaT' alt='Company logo' style=\"width:150px;height:130px;\">";
           
            var poDate = form.addField({
                id: 'custpage_date',
                type: ui.FieldType.DATE,
                label: 'Date',
                container: 'purchaseOrder'
            });

            var poEmployee = form.addField({
                id: 'custpage_employee',
                type: ui.FieldType.SELECT,
                label: 'Employee',
                source: 'employee',
                container: 'purchaseOrder'
            });

            var poVendor = form.addField({
                id: 'custpage_vendor',
                type: ui.FieldType.SELECT,
                label: 'Vendor',
                source: 'vendor',
                container: 'classification'
            });

            var poLocation = form.addField({
                id: 'custpage_location',
                type: ui.FieldType.SELECT,
                label: 'Location',
                source: 'location',
                container: 'classification'
            });

            const itemsinputtab = form.addTab({
                id: 'itemsinputtab',
                label: 'Items'
            });

            const itemsublist = form.addSublist({
                id: 'itemsublist',
                label: 'Items',
                tab: null,
                type: ui.SublistType.INLINEEDITOR
            });

            // COLUMNS
            addSublistField(itemsublist, 'custpage_po_item', 'select', 'Item Name', 'item', 'entry');
            addSublistField(itemsublist, 'custpage_po_quantity', 'integer', 'Quantity', '', 'entry');
            addSublistField(itemsublist, 'custpage_po_rate', 'currency', 'Rate', '', 'entry');
            // addSublistField(itemsublist, 'custpage_po_amount', 'currency', 'Amount', '', 'entry');

        }

        function addSublistField(sublist, id, type, label, source, displayType) {
            const sublistField = sublist.addField({
                id: id,
                type: type,
                label: label,
                source: source,
            });

            sublistField.updateDisplayType({
                displayType: displayType || ui.FieldDisplayType.NORMAL
            });

            sublistField.updateDisplaySize({
                height : 1,
                width : 20
            });

            return sublistField;
        }

        function createPurchaseOrder(date, vendorId, locationId, employeeId, lineCount, items, itemQuantity, itemAmount, itemRate) {

            try {

                var rec = record.create({
                    type: 'purchaseorder',
                    isDynamic: true
                });

                rec.setValue({
                    fieldId: 'trandate',
                    value: date
                });

                rec.setValue({
                    fieldId: 'entity',
                    value: vendorId// 514
                });

                rec.setValue({
                    fieldId: 'location',
                    value: locationId // 1
                });

                rec.setValue({
                    fieldId: 'employee',
                    value: employeeId // 1
                });

                if (lineCount > 0) {

                    for (var x = 0; x < lineCount; x++) {

                        rec.selectNewLine({
                            sublistId: 'item'
                        });

                        rec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'item',
                            value: items[x]// 345
                        });

                        rec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'quantity',
                            value: parseInt(itemQuantity[x])// 2
                        });

                        rec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'amount',
                            value: parseInt(itemAmount[x])// 2
                        });

                        rec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'rate',
                            value: parseInt(itemRate[x])// 2
                        });

                        rec.commitLine({
                            sublistId: 'item'
                        });

                    }

                }

                var recordId = rec.save();
                log.debug('recordId', recordId);
                return recordId

            } catch (e) {

                log.error('CREATE_PURCHASE_ORDER', JSON.stringify(e));
                return '';
            }

        }

        function computeAmount(itemRate, itemQuantity) {

            var amounts = [];

            if(itemRate.length > 0) {

                for (var i = 0; i < itemRate.length; i++) {

                    var total = itemRate[i] * itemQuantity[i];
                    amounts.push(total);
                }
            }

            return amounts;

        }

        return {
            onRequest: onRequest
        };

    });
