/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget'],
    /**
 * @param{serverWidget} serverWidget
 */
    (serverWidget) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            var stFormName = 'Purchase Order';

            var form = ui.createForm({
                title: stFormName
            });

            if(scriptContext.request.method === 'GET') {

                try{

                    var htmlField = form.addField( { id: 'custpage_field_html', type: serverWidget.FieldType.INLINEHTML, label: 'HTML' } );				
			
                    htmlField.defaultValue = generateForm();	

                    form.addSubmitButton({
                        label: 'Save'
                    });

                    context.response.writePage(form);

                }
                catch(ex) {
                    log.debug({title: 'Error in GET', details: ex});
                    context.response.write('Error: ' + ex.message);
                }

            }
        }

        const generateForm = () => {
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

        return {onRequest}

    });
