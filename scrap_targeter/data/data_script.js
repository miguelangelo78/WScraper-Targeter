var plugin_enabled = true;

var highlight_class = "HIGHLIGHTED_ADDON";
var highlight_hover = "ELEM_HOVER_ADDON";
var highlight_class_added = "HIGLIGHTED_ADDED_ADDON";

$("body").append(
	"<style>\
		."+highlight_class+"{\
			background-color: #E4FF78;\
			border: 1px dashed #BFD177;\
			padding: 5px;\
			margin: 5px;\
			-webkit-transition: all 0.25s ease;\
		    -moz-transition: all 0.25s ease;\
		    -o-transition: all 0.25s ease;\
		    transition: all 0.25s ease;\
		    z-index: 100000000;\
		    opacity: 0.75;\
		    box-shadow: 0px 0px 3px rgb(0, 0, 0);\
		    border-radius: 2px;\
		}\
		#"+highlight_hover+"{\
			position: fixed;\
			padding: 10px;\
			background-color: #E3E3E3;\
			border: 1px solid #3F3F40;\
			border-radius: 2px;\
			vertical-align: text-center;\
			float:none;\
			z-index: 1000000000;\
			font-family: 'Open Sans', sans-serif;\
			box-shadow: 0px 0px 5px rgb(0, 0, 0);\
		}\
		."+highlight_class_added+"{\
			background-color: #64D955;\
			-webkit-transition: all 0.25s ease;\
		    -moz-transition: all 0.25s ease;\
		    -o-transition: all 0.25s ease;\
		    transition: all 0.25s ease;\
		    border: 3px solid #3C7A33;\
		}\
	</style>"
);

function removeFromArray(arr) {
    var what, a = arguments, L = a.length, ax;
    while (L > 1 && arr.length) {
        what = a[--L];
        while ((ax= arr.indexOf(what)) !== -1) {
            arr.splice(ax, 1);
        }
    }
    return arr;
}

function containsJObj(arr, jobj){
	for(var i = 0;i<arr.length;i++)
		if(arr[i].is(jobj)) return true;
	return false;
}

$("body").append("<div id='"+highlight_hover+"'></div><link href='http://fonts.googleapis.com/css?family=Open+Sans' rel='stylesheet' type='text/css'>");

var elements_ignore = "html";

var mouseX, mouseY;
var allow_mouse = false;

var current_selection = $("html");
var current_selecion_undo = current_selection;

var highlight_hover_visible = true;
var highlight_hover_following = false;

var added_list_length = 0;
var added_list = [];

function update_highlight_hover(){
	if(highlight_hover_following)
		$("#"+highlight_hover).css({"top": mouseY+"px", "left": mouseX+"px"});
	else 
		$("#"+highlight_hover).css({"top": 0 , "left": "80%"}); 
	
	if(highlight_hover_visible)
		$("#"+highlight_hover).fadeIn('slow');
}

function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function cleanup_empty_elements(added_list){
	var new_list = [];
	for(var i=0;i<added_list.length;i++){
		added_list[i].removeClass(highlight_class+" "+highlight_class_added);
		
		var element_target = "";
		var has_class = added_list[i].attr("class")!=="";
		var has_id = added_list[i].attr("id")!==undefined;
		
		if(added_list[i].attr("class")==="" && added_list[i].attr("id")===undefined)
			element_target += added_list[i].prop("tagName");	
		else{
			if(has_id){ element_target += "#"+added_list[i].attr("id").split(/\s+/).join(", #"); }
			if(has_class && !has_id) element_target += "."+added_list[i].attr("class").split(/\s+/).join(", .");
		}

		new_list.push(element_target);

		added_list[i].addClass(highlight_class+" "+highlight_class_added);
	}
	
	return new_list;
}

function export_data(){
	var target_template = "target_"; // Key name
	var data_formatted = "{";
	
	var sanitized_list = cleanup_empty_elements(added_list);

	for(var i=0;i<sanitized_list.length;i++)
		data_formatted += "\""+target_template+i+"\":\""+sanitized_list[i]+"\""+ ((i < sanitized_list.length - 1) ? ", " : "");
	
	download("export_targets.json", data_formatted+"}");
}

$(document).mousemove(function(e){
	if(!plugin_enabled) return;
	
	mouseX = e.clientX-10;
	mouseY = e.clientY-200;

	update_highlight_hover();
	
	allow_mouse = true;
});

$(document).keypress(function(e){
	if(e.shiftKey){
		var next_iteration = null;

		switch(String.fromCharCode(e.which).toLowerCase()){
			case 'z': if(!plugin_enabled) return; next_iteration =  $(current_selection).prev(); break;
			case 'x': if(!plugin_enabled) return; next_iteration =  $(current_selection).next(); break;
			case 'w': if(!plugin_enabled) return; next_iteration =  $(current_selection).parent(); break;
			case 's': if(!plugin_enabled) return; next_iteration =  $(current_selection).children(); break;
			case 'q': if(!plugin_enabled) return; next_iteration =  current_selection = current_selecion_undo; break;
			case 'c': 
				if(!plugin_enabled) return;
				
				if(!containsJObj(added_list, current_selection)){
					
					$("."+highlight_class).each(function(index){
						added_list.push($(this));
						added_list_length++;
					});
					current_selection.addClass(highlight_class_added);
					
				} 
				break;
			case 'd': 
				if(!plugin_enabled) return;
				// REMOVE This ID/element
				removeFromArray(added_list, current_selection);
				added_list_length--;
				if(added_list_length<0) added_list_length = 0;
				current_selection.removeClass(highlight_class_added);
				
				break;
			case 'h': if(!plugin_enabled) return; $("#"+highlight_hover).hide(); highlight_hover_visible = false; break;
			case 'j': if(!plugin_enabled) return; $("#"+highlight_hover).show(); highlight_hover_visible = true; break;
			case 'k': 
				if(!plugin_enabled) return;

				highlight_hover_following = !highlight_hover_following;

				update_highlight_hover();

				break;
			case 'n': // Disable:
				if(plugin_enabled){
					$("*").removeClass(highlight_class);
					$("*").removeClass(highlight_class_added);
					$("#"+highlight_hover).hide();
					plugin_enabled= false;
				} 
				break;
			case 'b': // Enable:
				if(!plugin_enabled){

					$("#"+highlight_hover).show();
					plugin_enabled = true;
				}
				break;
			case 'g': // Export added_list
				export_data();
				break;
		}

		if(next_iteration != null){
			allow_mouse = false;
			select_element(null, next_iteration, true);
		}
	}
});

function set_elem_hover(text){
	$("#"+highlight_hover).html("<b>Selection:</b><br>"+text+ "<br>Added: <b style='color: green'>"+added_list_length+"</b><br><b>Navigation:</b><br><small>(Shift + <b>C</b> <b style='color:green'>ADD</b> | <b>D</b> <b style='color:red'>REMOVE</b> | <b>Q</b> Undo | <b>W</b> - Parent | <b>S</b> - Children | <b>Z</b> - Prev Sibling | <b>X</b> - Next Sibling)</small>\
		<br><b>Plugin:</b>\
		<br><span style='color:green'>Export: <b>Shift + G</b></span> | Hide this: <b>Shift + H</b> | Show this: <b>Shift + J</b><br>Disable plugin: <b>Shift + N</b> | Enable Plugin: <b>Shift + B</b>\
		| Follow Mouse: <b>Shift + K</b>");
}

function select_element(event, jelem, select){
	if(jelem == undefined) return;

	current_selecion_undo = current_selection;
	current_selection = jelem;
	
	if(event!==null)
		event.stopPropagation();
	
	if(select){
		$("*").removeClass(highlight_class);

		jelem.addClass(highlight_class);

		var this_class = jelem.attr("class").replace(highlight_class,"");
		
		var this_id = jelem.attr("id");
		if(this_id === undefined) this_id = "";

	 	if(highlight_hover_visible)
	 		set_elem_hover("Class: <b style='color:green'>" + this_class + "</b><br>ID: <b style='color:green'>" + this_id + "</b>");
	}else{
		jelem.removeClass(highlight_class);
		if(highlight_hover_visible)
			set_elem_hover("Class: <br>ID: ");	
	}
}

$("*").not(elements_ignore).mouseenter(function(e){
	if(allow_mouse && plugin_enabled)
		select_element(e, $(this), true);
});

$("*").not(elements_ignore).mouseleave(function(){
	if(allow_mouse && plugin_enabled)
		select_element(null, $(this), false);

$("#"+highlight_hover).mouseover(function(){
	$(this).hide();
});

});