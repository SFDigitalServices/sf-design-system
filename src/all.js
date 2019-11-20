$(document).ready(function(){
	// File inputs
	$("input[type='file']").change(function() {
	  var file = $(this).val().replace(/C:\\fakepath\\/i, '');

	  $(this).next('.file-custom').attr('data-filename', file);
	});
});
