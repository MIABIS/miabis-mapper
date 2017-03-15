// JavaScript Document

//Download standard files in zipped format.
$('#downloadstandardbutton').on('click', function () {
	window.location = "http://"+document.location.hostname+"/mapper/standard/standardfiles.zip"
})



//Ajax parsing of the standard entity file and on success write response to the entity table and the map result table.
$.ajax({
	type: "GET",
	url: "http://"+document.location.hostname+"/mapper/standard/Standard.csv",
	success: function (data) {
		populateSelectOptionsEntityFromStandardFile(Papa.parse(data).data);
		parseStandardFileToEntityTable(Papa.parse(data).data);
		parseStandardFileToEntityMapResultTable(Papa.parse(data).data);
	}
});

//Populate the select entity options from the standard file.
function populateSelectOptionsEntityFromStandardFile(tableData) {
	var selectOption;
	$(tableData).each(function (i, rowData) {
		if(i > 0){
			if(selectOption !== rowData[0] && $.trim(rowData[0]) !== ""){
				selectOption = rowData[0];
				$('#entitypicker').append($('<option>'+selectOption+'</option>'));
			}
		}
			
	});	
	$('#entitypicker').selectpicker('refresh');
}


//Write the parse result of the standard file to an entity table.
function parseStandardFileToEntityTable(tableData) {
	var tablehead = $('<thead></thead>');
	var headerrow = $('<tr></tr>');
	
	$.each( tableData[0], function( index, value ){
		headerrow.append($("<th>" + value + "</th>"));
	});
	tablehead.append(headerrow);
	
	$("#standardtable").append(tablehead);
	
	var tablebody = $('<tbody></tbody>');
	$("#standardtable").append(tablebody);
	
	$(tableData).each(function (i, rowData) {
		if($('#entitypicker').val() === rowData[0]){
			var row = $('<tr></tr>');
			$(rowData).each(function (j, cellData) {
				row.append($('<td>'+cellData+'</td>'));
			});
			$("#standardtable").append(row);
		}
	});
	
	$('#entitypicker').on('changed.bs.select', function (e) {
		$('#standardtable tbody').empty();
		$('#localtable tbody').empty();
		
		$(tableData).each(function (i, rowData) {		
			if($('#entitypicker').val() === rowData[0]){
				var row = $('<tr></tr>');
				$(rowData).each(function (j, cellData) {
					row.append($('<td>'+cellData+'</td>'));
				});
				$("#standardtable").append(row);
			}
		});
	});
	
}


//Write the parse result of the standard file to an entity map result table.
function parseStandardFileToEntityMapResultTable(tableData) {
	var tablehead = $('<thead></thead>');
	var headerrow = $('<tr></tr>');
	
	headerrow.append($("<th>" + "Entity" + "</th>"));
	headerrow.append($("<th>" + "Standard Attribute" + "</th>"));
	headerrow.append($("<th>" + "Local Attribute" + "</th>"));	
	tablehead.append(headerrow);
	
	$("#entitymapresulttable").append(tablehead);
	
	var tablebody = $('<tbody></tbody>');
	$("#entitymapresulttable").append(tablebody);
	
	$(tableData).each(function (i, rowData) {
		if(i > 0){
			var row = $('<tr></tr>');
			$(rowData).each(function (j, cellData) {
				if(j < 2){
					row.append($('<td>'+cellData+'</td>'));
				}
				else{
					row.append($('<td></td>'));
				}
			});
			$("#entitymapresulttable").append(row);
		}
	});
	
}


//Parse the local entity file and write to the local entity table.
$('#files').on('change',function(){
	$('#localtable').empty();
	var tablehead = $('<thead></thead>');
	var headerrow = $('<tr></tr>');
	
	headerrow.append($("<th>" + "Column No." + "</th>"));
	headerrow.append($("<th>" + "Attribute" + "</th>"));
	headerrow.append($("<th>" + "Standard Attribute" + "</th>"));
	tablehead.append(headerrow);
	
	$("#localtable").append(tablehead);
	
	var tablebody = $('<tbody></tbody>');
	$("#localtable").append(tablebody);
						
	var file = $('#files')[0].files[0];
	if(typeof file !== "undefined"){
	//if(file.name != null){
		Papa.parse(file, {
			header: true,
			complete: function(results) {
						var data = results.meta.fields;
						$.each( data, function(index, value){
							var row = $('<tr></tr>');
							row.append($("<td>" + (index+1) + "</td>"));
							row.append($("<td>" + value + "</td>"));
							row.append($("<td></td>"));
							$("#localtable").append(row);
						});
						
					  }
		});
	}
	
});



/*Interactive mapping of attributes from the standard table to the local table. Clicking a row in the standard table followed by clicking a row in the local table, maps the local attribute in the clicked row of the local table against standard attribute from the clicked row in the standard table.*/
$(document).ready(function(){
	$('#standardtable').DataTable({
					//searching: false,
					"scrollY": "500px",
					paging: false,
					info: false
				});
	
	$('#localtable').DataTable({
					//searching: false,
					//"scrollY": "500px",
					/*"columns": [
						{title: "Column No."},
						{title: "Attribute" },
						{title: "Standard Attribute" }
    				],*/
					paging: false,
					info: false
				});
	
	//"scrollY": "500px" messes up the column header alignment with table body, so instead of using the DataTable scroll we use the plain html scroll.
	$('#localtable').wrap("<div class='scrolledTable'></div>");
	
	var cellData;
	
	$('#standardtable').on('click', 'tbody tr', function(){
		if($(this).hasClass('selected')) {
			$(this).removeClass('selected');
			cellData = "";
		}
		else{
			cellData = $(this).find('td').eq(1).text();
			$('#standardtable tbody tr.selected').removeClass('selected');
			$(this).addClass('selected');
		}
	});
	
	$('#entitypicker').on('changed.bs.select', function () {
		cellData = "";
	});
	
	$('#localtable').on('click', 'tbody tr', function(){
		if ( $(this).hasClass('selected') ) {
			$(this).removeClass('selected');
			$(this).find('td').eq(2).empty();
		}
		else {
			$('#localtable > tbody > tr').each(function(index, element) {
				if($(element).find('td').eq(2).text() === cellData){
					$(element).find('td').eq(2).empty();
				}
			});
			$(this).find('td').eq(2).html(cellData);
			$('#localtable tbody tr.selected').removeClass('selected');
			$(this).addClass('selected');
		}
	});	
});



//On click of Save Entity Map button, copy the entity mapping from the local table to the entity map result table.
$('#entitysavebutton').on('click', function () {
	var file = $('#files')[0].files[0];
	if(typeof file === "undefined"){
		$('#modalNoFileSelected').modal('show');
		return;
	}
	
	var datapresent = false;
	$('#localtable > tbody > tr').each(function(index, element) {
		if($(element).find('td').eq(2).text() != ""){
			datapresent = true;
			copyEntityMaptoMapResult($('#entitypicker').val(), $(element).find('td').eq(2).text(), $(element).find('td').eq(1).text());
		}
	});
	
	if (datapresent === true){
		$('#modalFileMapped').find('div.alert').text('Your mapping for the entity '+$('#entitypicker').val()+ ' has been saved in the Map Result tab! You can continue mapping for the same entity or choose a new entity to map!');
		$('#modalFileMapped').modal('show');
	}
	else{
		$('#modalFileNotMapped').find('div.alert').text('You have not selected to map any attributes for the entity '+$('#entitypicker').val()+'! Your local mapping table seems to be empty!');
		$('#modalFileNotMapped').modal('show');
	}
	
	
	var table = $('#localtable').tableToJSON();
	$.ajax({  
		type: 'POST',  
		url: 'mapresultsave.php', 
		data: {entity: $('#entitypicker').val(), data: table, mode: "localfile"},
		success: function(response) {
		},
		error: function(error) {
        }
	});
});


//Helper function to copy the entity mapping from the local entity table to the entity map result table.
function copyEntityMaptoMapResult(standardEntity, standardAttribute, localAttribute){
	$('#entitymapresulttable > tbody > tr').each(function(index, element) {
		if(standardEntity === $(element).find('td').eq(0).text() && standardAttribute === $(element).find('td').eq(1).text()){
			$(element).find('td').eq(2).empty();
			$(element).find('td').eq(2).append(localAttribute);
		}
	});
}

	






//Ajax parsing of the standard list file and on success write response to the list table and the map result table.
$.ajax({
	type: "GET",
	url: "http://"+document.location.hostname+"/mapper/standard/Standard_List_Values.csv",
	success: function (data) {
		populateSelectOptionsListFromStandardFile(Papa.parse(data).data);
		parseStandardFileToListTable(Papa.parse(data).data);
		parseStandardFileToListMapResultTable(Papa.parse(data, {skipEmptyLines: true}).data);
	}
});


//Populate the select list options from the standard file.
function populateSelectOptionsListFromStandardFile(tableData) {
	var selectOption;
	$(tableData).each(function (i, rowData) {
		if(i > 0){
			if(selectOption !== rowData[0] && $.trim(rowData[0]) !== ""){
				selectOption = rowData[0];
				$('#listpicker').append($('<option>'+selectOption+'</option>'));
			}
		}
			
	});	
	$('#listpicker').selectpicker('refresh');
}



//Write the parse result of the standard file to a list table.
function parseStandardFileToListTable(tableData) {
	var tablehead = $('<thead></thead>');
	var headerrow = $('<tr></tr>');
	
	$.each( tableData[0], function( index, value ){
		headerrow.append($("<th>" + value + "</th>"));
	});
	tablehead.append(headerrow);
	
	$("#standardlisttable").append(tablehead);
	
	var tablebody = $('<tbody></tbody>');
	$("#standardlisttable").append(tablebody);
	
	$(tableData).each(function (i, rowData) {
		if($('#listpicker').val() === rowData[0]){
			var row = $('<tr></tr>');
			$(rowData).each(function (j, cellData) {
				row.append($('<td>'+cellData+'</td>'));
			});
			$("#standardlisttable").append(row);
		}
	});
	
	$('#listpicker').on('changed.bs.select', function (e) {
		$('#standardlisttable tbody').empty();
		
		$(tableData).each(function (i, rowData) {		
			if($('#listpicker').val() === rowData[0]){
				var row = $('<tr></tr>');
				$(rowData).each(function (j, cellData) {
					row.append($('<td>'+cellData+'</td>'));
				});
				$("#standardlisttable").append(row);
			}
		});
	});
	
}


//Write the parse result of the standard file to a list map result table.
function parseStandardFileToListMapResultTable(tableData) {
	var tablehead = $('<thead></thead>');
	var headerrow = $('<tr></tr>');
	
	headerrow.append($("<th>" + "Attribute" + "</th>"));
	headerrow.append($("<th>" + "Standard Value" + "</th>"));
	headerrow.append($("<th>" + "Local Value" + "</th>"));	
	tablehead.append(headerrow);
	
	$("#listvaluesmapresulttable").append(tablehead);
	
	var tablebody = $('<tbody></tbody>');
	$("#listvaluesmapresulttable").append(tablebody);
	
	$(tableData).each(function (i, rowData) {
		if(i > 0){
			var row = $('<tr></tr>');
			$(rowData).each(function (j, cellData) {
				if(j < 2){
					row.append($('<td>'+cellData+'</td>'));
				}
			});
			row.append($('<td></td>'));
			$("#listvaluesmapresulttable").append(row);
		}
	});
	
}


//Parse the local list file and write to the local list table.
$('#listfiles').on('change',function(){
	$('#locallisttable').empty();
	var tablehead = $('<thead></thead>');
	var headerrow = $('<tr></tr>');
	
	headerrow.append($("<th>" + "List" + "</th>"));
	headerrow.append($("<th>" + "Local Value" + "</th>"));
	headerrow.append($("<th>" + "Standard Value" + "</th>"));
	tablehead.append(headerrow);
	
	$("#locallisttable").append(tablehead);
	
	var tablebody = $('<tbody></tbody>');
	$("#locallisttable").append(tablebody);
						
	var file = $('#listfiles')[0].files[0];
	if(typeof file !== "undefined"){
		Papa.parse(file, {
			skipEmptyLines: true,
			complete: function(results) {
						var data = results.data;
						$(data).each(function (i, rowData) {
							if(i > 0){
								var row = $('<tr></tr>');
								$(rowData).each(function (j, cellData) {
									row.append($('<td>'+cellData+'</td>'));
									if(j == 1){
										row.append($('<td></td>'));
									}
								});
								$("#locallisttable").append(row);
							}
						});
						
					  }
		});
	}
	
});



/*Interactive mapping of values from the standard list table to the local list table. Clicking a row in the standard list table followed by clicking a row in the local list table, maps the local value in the clicked row of the local list table against standard value from the clicked row in the standard list table.*/
$(document).ready(function(){
	$('#standardlisttable').DataTable({
					//searching: false,
					paging: false,
					info: false
				});
	
	$('#locallisttable').DataTable({
					//searching: false,
					paging: false,
					info: false
				});
	
	
	var cellData;
	
	$('#standardlisttable').on('click', 'tbody tr', function(){
		if($(this).hasClass('selected')) {
			$(this).removeClass('selected');
			cellData = "";
		}
		else{
			cellData = $(this).find('td').eq(1).text();
			$('#standardlisttable tbody tr.selected').removeClass('selected');
			$(this).addClass('selected');
		}
	});
	
	$('#listpicker').on('changed.bs.select', function () {
		cellData = "";
	});
	
	$('#locallisttable').on('click', 'tbody tr', function(){
		if ( $(this).hasClass('selected') ) {
			$(this).removeClass('selected');
			$(this).find('td').eq(2).empty();
		}
		else {
			$('#locallisttable > tbody > tr').each(function(index, element) {
				if($(element).find('td').eq(2).text() === cellData){
					$(element).find('td').eq(2).empty();
				}
			});
			$(this).find('td').eq(2).html(cellData);
			$('#locallisttable tbody tr.selected').removeClass('selected');
			$(this).addClass('selected');
		}
	});	
});


//On click of Save List Map button, copy the list values mapping from the local list table to the list map result table.
$('#listsavebutton').on('click', function () {
	var file = $('#listfiles')[0].files[0];
	if(typeof file === "undefined"){
		$('#modalNoListFileSelected').modal('show');
		return;
	}
	
	var datapresent = false;
	$('#locallisttable > tbody > tr').each(function(index, element) {
		if($(element).find('td').eq(2).text() != ""){
			datapresent = true;
			copyListValuesMaptoListValuesMapResult($('#listpicker').val(), $(element).find('td').eq(2).text(), $(element).find('td').eq(1).text());
		}
	});
	
	if (datapresent === true){
		$('#modalListFileMapped').find('div.alert').text('Your mapping for the list '+$('#listpicker').val()+ ' has been saved in the Map Result tab! You can continue mapping for the same list or choose a new list to map!');
		$('#modalListFileMapped').modal('show');
	}
	else{
		$('#modalListFileNotMapped').find('div.alert').text('You have not selected to map any values for the list! Your local mapping table seems to be empty!');
		$('#modalListFileNotMapped').modal('show');
	}
});


//Helper function to copy the list values mapping from the local list table to the list map result table.
function copyListValuesMaptoListValuesMapResult(list, standardValue, localValue){
	$('#listvaluesmapresulttable > tbody > tr').each(function(index, element) {
		if(list === $(element).find('td').eq(0).text() && standardValue === $(element).find('td').eq(1).text()){
			$(element).find('td').eq(2).empty();
			$(element).find('td').eq(2).append(localValue);
		}
	});
}

//Individual deleting of the map result in the entity map result table and the list map result table.
$(document).ready(function(){
	$('#entitymapresulttable').DataTable({
					paging: false,
					info: false,
					"order": []
				});
	
	$('#listvaluesmapresulttable').DataTable({
					paging: false,
					info: false,
					"order": []
				});
				
	$('#entitymapresulttable').on('click', 'tbody tr', function(){
		if($(this).hasClass('selected')) {
			$(this).removeClass('selected');
			$(this).find('td').eq(2).empty();
		}
		else{
			$('#entitymapresulttable tbody tr.selected').removeClass('selected');
			$(this).addClass('selected');
		}
	});
	
	$('#listvaluesmapresulttable').on('click', 'tbody tr', function(){
		if($(this).hasClass('selected')) {
			$(this).removeClass('selected');
			$(this).find('td').eq(2).empty();
		}
		else{
			$('#listvaluesmapresulttable tbody tr.selected').removeClass('selected');
			$(this).addClass('selected');
		}
	});
	
});

//On click of Clear Entity Map button, show the modal for confirm.
$('#entityclearbutton').on('click', function(){
	$('#modalClearEntityMap').modal('show');
	
});	

//Delete the mapping from the entity map result table on confirm of the modal dialog
$('#yesEntityMapClear').on('click', function(){
	$('#entitymapresulttable > tbody > tr').each(function(index, element) {
		$(element).find('td').eq(2).empty();
	});
	$('#modalClearEntityMapSuccess').modal('show');
});


//On click of Clear List Values Map button, show the modal for confirm.
$('#listvaluesclearbutton').on('click', function(){
	$('#modalClearListValuesMap').modal('show');
	
});	

//Delete the mapping from the list map result table on confirm of the modal dialog
$('#yesListValuesMapClear').on('click', function(){
	$('#listvaluesmapresulttable > tbody > tr').each(function(index, element) {
		$(element).find('td').eq(2).empty();
	});
	$('#modalClearListValuesMapSuccess').modal('show');
});


//On click of Save Map Result button, send the data to php.
$('#mapresultsavebutton').on('click', function(){
	var entitymapresulttable = $('#entitymapresulttable').tableToJSON();
	var listvaluesmapresulttable = $('#listvaluesmapresulttable').tableToJSON();
	
	$.ajax({  
		type: 'POST',  
		url: 'mapresultsave.php', 
		data: {dataentity: entitymapresulttable, mode: "mapfile", type: "entitymapping"},
		success: function(response) {
		},
		error: function(error) {
        }
	});
	
	
	$.ajax({  
		type: 'POST',  
		url: 'mapresultsave.php', 
		data: {datalistvalues: listvaluesmapresulttable, mode: "mapfile", type: "listvaluesmapping"},
		success: function(response) {
				$('#modalSaveMapResult').modal('show');
				$('#yesSaveMapResult').off().on('click', function(){
					window.location = JSON.parse(response).download;
					//window.open(JSON.parse(response).download);
					$('#modalSaveMapResultSuccess').modal('show');
					$('#modalSaveMapResultSuccess').on('hidden.bs.modal', function () {
    					$.ajax({
							url : 'sessionclear.php',
							success: function(result){
								location.reload(true);
							}
						});
					})
					
				});
				
				
		},
		error: function(error) {
        }
	});
	

	
});