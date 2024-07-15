/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget'],
/**
 * @param{serverWidget} serverWidget
 */
function(serverWidget) {
    
    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    function pageInit(scriptContext) {
        // Add custom styles
        document.addEventListener('DOMContentLoaded', function() {
            var style = document.createElement('style');
            style.innerHTML = `
                /* Add your custom CSS styles here */
                .uir-form-row {
                    background-color: #f4f4f4;
                    padding: 10px;
                    margin: 5px 0;
                }
                
                .uir-machine-buttons-row {
                    margin-top: 20px;
                }
                
                #custpage_field1 {
                    border: 1px solid #ccc;
                    border-radius: 5px;
                    padding: 5px;
                }
                
                #custpage_sublist {
                    border-collapse: collapse;
                    width: 100%;
                }
                
                #custpage_sublist td {
                    border: 1px solid #ccc;
                    padding: 8px;
                }
                
                #custpage_sublist th {
                    border: 1px solid #ccc;
                    padding: 8px;
                    background-color: #f2f2f2;
                }
            `;
            document.head.appendChild(style);
        });
    }

    return {
        pageInit: pageInit,
    };
    
});
