/* TODO 
- populate header image so don't have to hide / show topbar
- reduce button delay with pagechange */

var DEBUG_MODE = false;

var selectedMealIndex = -1;
var selectedPlaceIndex = -1;
var selectedPlaceID = null;
var nearbyPlaces = null;
var myFriends = null;
var currentlySelectedPlaceElement = null;
var selectedFriends = {};

// DATA

var meals = [
{
	"id" : "cheeseburger",
	"title" : "Cheeseburger",
	"url" : "https://s3.amazonaws.com/trigger-scrumptious/cheeseburger.html"
},
{
	"id" : "chinese",
	"title" : "Chinese",
	"url" : "https://s3.amazonaws.com/trigger-scrumptious/chinese.html"
},
{
	"id" : "french",
	"title" : "French",
	"url" : "https://s3.amazonaws.com/trigger-scrumptious/french.html"
},
{
	"id" : "hotdog",
	"title" : "Hot Dog",
	"url" : "https://s3.amazonaws.com/trigger-scrumptious/hotdog.html"
},
{
	"id" : "indian",
	"title" : "Indian",
	"url" : "https://s3.amazonaws.com/trigger-scrumptious/indian.html"
},
{
	"id" : "italian",
	"title" : "Italian",
	"url" : "https://s3.amazonaws.com/trigger-scrumptious/italian.html"
},
{
	"id" : "pizza",
	"title" : "Pizza",
	"url" : "https://s3.amazonaws.com/trigger-scrumptious/pizza.html"
},
];

// UTILITIES

// For logging responses
function logResponse(response) {
	/* TRIGGER.IO FORGE logging module: 
	
			http://docs.trigger.io/en/v1.4/modules/logging.html
			
	*/
	forge.logging.log('The response was:');
	forge.logging.log(response);
	
}

// DOCUMENT-READY FUNCTIONS
$(function () {
	
	login();

	// Click handlers
	$('#login-button').click(login);
	$('#logout-button').click(logout);
	$('#cancel-logout-button').click(function() {
		window.location.hash = '#menu';
		
		/* TRIGGER.IO FORGE native topbar UI module: 

				http://docs.trigger.io/en/v1.4/modules/topbar.html

		*/
		forge.topbar.show();
		forge.topbar.setTitle('Scrumptious');
		
		addLogout();
	});

	// Announce click handler
	$("#announce").click(function() {
		publishOGAction(null);
	});

	// Meal selection click handler
	$('#meal-list').on('click', 'li', function() {
		selectedMealIndex = $(this).index();
		logResponse("Link in meal listview clicked... " + selectedMealIndex);
		displaySelectedMeal();

	});

	$('#detail-meal-select').click(function() {
		//logResponse("Meal selected");
		$('#announce').removeClass('ui-disabled');
		$('#select-meal').html(meals[selectedMealIndex].title);
	});

	// Place selection click handler
	$('#places-list').on('click', 'li', function() {
		var selectionId = $(this).attr('data-name');
		logResponse("Selected place " + selectionId);

		var selectionStatus = $(this).attr('data-icon');
		if (selectionStatus == "false") {
			// De-select any previously selected place
			if (currentlySelectedPlaceElement) {
				currentlySelectedPlaceElement.buttonMarkup({ icon: false });
			}
			// Place has been selected.
			$(this).buttonMarkup({ icon: "check" });            
			// Set the selected place info
			selectedPlaceID = selectionId;
			selectedPlaceIndex = $(this).index();
			$('#select-location').html(nearbyPlaces[selectedPlaceIndex].name);
			// Set the currently selected place element
			currentlySelectedPlaceElement = $(this);
			
			/* TRIGGER.IO FORGE native topbar UI module: 

					http://docs.trigger.io/en/v1.4/modules/topbar.html

			*/
			forge.topbar.addButton({
				text: 'Done',
				style: 'done',
				position: 'right'
			}, function() {
				window.location.hash = '#menu';
			});
			
		} else {
			// Previously selected place has been deselected
			$(this).buttonMarkup({ icon: false });
			// Reset the selected place info
			selectedPlaceID = null;
			selectedPlaceIndex = -1;
			$('#select-location').html("Select one");
			
			/* TRIGGER.IO FORGE native topbar UI module: 

					http://docs.trigger.io/en/v1.4/modules/topbar.html

			*/
			forge.topbar.removeButtons();
			
			addBack();
		} 
	});

	// Friend selection click handler
	$('#friends-list').on('click', 'li', function() {
		var selectionId = $(this).attr('data-name');
		logResponse("Selected friend " + selectionId);
		var selectedIndex = $(this).index();
		var selectionStatus = $(this).attr('data-icon');
		if (selectionStatus == "false") {
			// Friend has been selected.
			$(this).buttonMarkup({ icon: "check" });
			// Add to friend ID to selectedFriends associative array
			selectedFriends[selectionId] = myFriends[selectedIndex].name;
			
			/* TRIGGER.IO FORGE native topbar UI module: 

					http://docs.trigger.io/en/v1.4/modules/topbar.html

			*/
			forge.topbar.addButton({
				text: 'Done',
				style: 'done',
				position: 'right'
			}, function() {
				window.location.hash = '#menu';
			});
			
		} else {
			// Previously selected friend has been deselected
			$(this).buttonMarkup({ icon: false });
			// Remove the friend id
			delete selectedFriends[selectionId];
		} 
		var friendNameArray = [];
		for (var friendId in selectedFriends) {
			if (selectedFriends.hasOwnProperty(friendId)) {
				friendNameArray.push(selectedFriends[friendId]);
			}
		}

		if (friendNameArray.length > 2) {
			var otherFriends = friendNameArray.length - 1;
			$('#select-friends').html(friendNameArray[0] + " and " + otherFriends + " others");
		} else if (friendNameArray.length == 2) {
			$('#select-friends').html(friendNameArray[0] + " and " + friendNameArray[1]);
		} else if (friendNameArray.length == 1) {
			$('#select-friends').html(friendNameArray[0]);
		} else {
			$('#select-friends').html("Select friends");
			
			/* TRIGGER.IO FORGE native topbar UI module: 

					http://docs.trigger.io/en/v1.4/modules/topbar.html

			*/
			forge.topbar.removeButtons();
			
			addBack();
		}

		logResponse("Current select friends list: " + selectedFriends);
	});

});

$(document).bind("mobileinit", function(){
	$.mobile.defaultPageTransition = 'none';
});

$( document ).delegate("#meals", "pageinit", function() {
	displayMealList();
});

$('body').bind('hideOpenMenus', function(){
	$("ul:jqmData(role='menu')").find('li > ul').hide();
}); 
var menuHandler = function(e) {
	$('body').trigger('hideOpenMenus');
	$(this).find('li > ul').show();
	e.stopPropagation();
};
$("ul:jqmData(role='menu') li > ul li").click(function(e) {
	$('body').trigger('hideOpenMenus');
	e.stopPropagation();
});
$('body').delegate("ul:jqmData(role='menu')",'click',menuHandler);
$('body').click(function(e){
	$('body').trigger('hideOpenMenus');
});

// AUTHENTICATION

function login() {
	/* TRIGGER.IO FORGE facebook SDK integration: 

			http://docs.trigger.io/en/v1.4/modules/facebook.html#modules-facebook

	*/
	forge.facebook.authorize(['publish_actions'], function(token_information) {
		logResponse(token_information);
		window.location.hash = '#menu';
		
		/* TRIGGER.IO FORGE native topbar UI module: 

				http://docs.trigger.io/en/v1.4/modules/topbar.html

		*/
		forge.topbar.show();
		forge.topbar.setTitle('Scrumptious');
		
		addLogout();
		
		updateUserInfo();
	}, function(content) {
		/* TRIGGER.IO FORGE notification module: 

				http://docs.trigger.io/en/v1.4/modules/notification.html

		*/
		forge.notification.create("Facebook Login Error", "There was a problem logging into Facebook: "+content.message);
		window.location.hash = '#login';
	});
}

function logout() {
	/* TRIGGER.IO FORGE facebook SDK integration: 

			http://docs.trigger.io/en/v1.4/modules/facebook.html#modules-facebook

	*/
	forge.facebook.logout(function() {
		window.location.hash = '#login';
	}, function(content) {
		/* TRIGGER.IO FORGE notification module: 

				http://docs.trigger.io/en/v1.4/modules/notification.html

		*/
		forge.notification.create("Facebook Logout Error", "There was a problem logging into Facebook: "+content.message);
	});
}

function updateUserInfo() {
	/* TRIGGER.IO FORGE facebook SDK integration: 

			http://docs.trigger.io/en/v1.4/modules/facebook.html#modules-facebook

	*/
	forge.facebook.api('/me', { fields: "name,first_name,picture" }, function(response) {
		logResponse(response);
		$('#user-info').remove();
		var output = '';
		output += '<p class="intro" id="user-info"><img src="' + response.picture.data.url + '" width="50" height="50"></img>';
		output += ' ' + response.first_name + '</p>';
		$('#logout-intro').append(output);
	});
}


// GRAPH API (OPEN GRAPH)
function handleOGSuccess() {
	logResponse("[handleOGSuccess] done.");
	showPublishConfirmation();

	// Clear out selections
	selectedMealIndex = -1;
	selectedPlaceIndex = -1;
	selectedPlaceID = null;
	currentlySelectedPlaceElement = null;
	selectedFriends = {};
	// Reset the placeholders
	$('#select-meal').html("Select one");
	$('#select-location').html("Select one");
	$('#select-friends').html("Select friends");
	// Disable the announce button
	$('#announce').addClass('ui-disabled');

}

function handleGenericError(e) {
	logResponse("Error ..."+JSON.stringify(e));
}

function handlePublishOGError(e) {
	logResponse("Error publishing ..."+JSON.stringify(e));
	var errorCode = e.code;
	logResponse("Error code ..."+errorCode);
	/* TRIGGER.IO FORGE notification module: 

			http://docs.trigger.io/en/v1.4/modules/notification.html

	*/
	forge.notification.create("Error posting to Facebook", "Error code: "+errorCode);
}



function publishOGAction(response) {
	var errorHandler = null;
	// Handle if we came in via a reauth.
	// Also avoid loops, set generic error
	// handler if already reauthed.
	if (!response || response.error) {
		errorHandler = handlePublishOGError;
	} else {
		errorHandler = handleGenericError;
	}
	logResponse("Publishing action...");
	var params = {
		"meal" : meals[selectedMealIndex].url
	};
	if (selectedPlaceID) {
		params.place = selectedPlaceID;
	}
	var friendIDArrays = [];
	for (var friendId in selectedFriends) {
		if (selectedFriends.hasOwnProperty(friendId)) {
			friendIDArrays.push(friendId);
		}
	}
	if (friendIDArrays.length > 0) {
		params.tags = friendIDArrays.join();
	}
	logResponse("Publish params " + params);
	/* TRIGGER.IO FORGE facebook SDK integration: 

			http://docs.trigger.io/en/v1.4/modules/facebook.html#modules-facebook

	*/
	forge.facebook.api("/me/trigger-scrumptious:eat",
	"POST",
	params,
	function (response) {
		logResponse(response);
		if (!response || response.error) {
			errorHandler(response.error);
		} else {
			handleOGSuccess(response);
		}
	}
);
}

function showPublishConfirmation() {
	$("#confirmation").append("<p>Publish successful</p>");
	// Fade out the message
	$("#confirmation").fadeOut(3000, function() {
		$("#confirmation").html("");
		$("#confirmation").show();
	});
}

// DATA FETCH AND DISPLAY

// Meals
function displayMealList() {
	// Meal list
	logResponse("[displayMealList] displaying meal list.");
	var tmpl = $("#meal_list_tmpl").html();
	var output = Mustache.to_html(tmpl, meals);
	$("#meal-list").html(output).listview('refresh');
}

function displaySelectedMeal() {
	logResponse("[displaySelectedMeal] displaying selected meal.");
	var meal = meals[selectedMealIndex];
	// Set up meal display
	var tmpl = $("#selected_meal_tmpl").html();
	var output = Mustache.to_html(tmpl, meal);
	$("#selected_meal").html(output);
}

// Nearby Places
function getNearby() {
	// Check for and use cached data
	if (nearbyPlaces)
	return;

	logResponse("[getNearby] get nearby data.");

	// First use browser's geolocation API to obtain location
	/* TRIGGER.IO FORGE geolocation module: 

			http://docs.trigger.io/en/v1.4/modules/geolocation.html

	*/
	forge.geolocation.getCurrentPosition( { enableHighAccuracy: true }, function(location) {
		//curLocation = location;
		logResponse(location);

		// Use graph API to search nearby places
		var path = '/search?type=place&q=restaurant&center=' + location.coords.latitude + ',' + location.coords.longitude + '&distance=1000&fields=id,name,picture';

		/* TRIGGER.IO FORGE facebook SDK integration: 

				http://docs.trigger.io/en/v1.4/modules/facebook.html#modules-facebook

		*/
		forge.facebook.api(path, function(response) {
			if (!response || response.error) {
				logResponse("Error fetching nearby place data.");
			} else {
				nearbyPlaces = response.data;
				logResponse(nearbyPlaces);
				displayPlaces(nearbyPlaces);
			}
		});
	});
}

function displayPlaces(places) {
	// Places list
	logResponse("[displayPlaces] displaying nearby list.");
	var tmpl = $("#places_list_tmpl").html();
	var output = Mustache.to_html(tmpl, places);
	$("#places-list").html(output).listview('refresh');
}

// Friends
function getFriends() {
	// Check for and use cached data
	if (myFriends)
	return;

	logResponse("[getFriends] get friend data.");
	// Use the Graph API to get friends
	/* TRIGGER.IO FORGE facebook SDK integration: 

			http://docs.trigger.io/en/v1.4/modules/facebook.html#modules-facebook

	*/
	forge.facebook.api('/me/friends', { fields: 'name, picture', limit: '50' }, function(response) {
		if (!response || response.error) {
			logResponse("Error fetching friend data.");
		} else {
			myFriends = response.data;
			logResponse(myFriends);
			displayFriends(myFriends);
		}
	});
}

function displayFriends(friends) {
	// Friends list
	logResponse("[displayFriends] displaying friend list.");
	var tmpl = $("#friends_list_tmpl").html();
	var output = Mustache.to_html(tmpl, friends);
	$("#friends-list").html(output).listview('refresh');
}

//HANDLE TOPBAR

function addLogout() {
	/* TRIGGER.IO FORGE native topbar UI module: 

			http://docs.trigger.io/en/v1.4/modules/topbar.html

	*/
	forge.topbar.removeButtons();
	forge.topbar.addButton({
		text: 'Logout',
		position: 'right'
	}, function() {
		window.location.hash = '#logout';
		forge.topbar.hide();
	});
}

function addBack() {
	/* TRIGGER.IO FORGE native topbar UI module: 

			http://docs.trigger.io/en/v1.4/modules/topbar.html

	*/
	forge.topbar.removeButtons();
	forge.topbar.addButton({
		text: 'Back',
		type: 'back',
		style: 'back',
		position: 'left'
	});
}

$(document).bind('pagechange', function() {
	/* TRIGGER.IO FORGE native topbar UI module: 

			http://docs.trigger.io/en/v1.4/modules/topbar.html

	*/
	forge.topbar.removeButtons();

	if (location.hash == "#logout" || location.hash == "#login") {
		forge.topbar.hide();
	} else {
		forge.topbar.show();
	}
	
	if (location.hash == "#meals") {
		forge.topbar.setTitle('Select a Meal');
	} else if (location.hash == "#meal-details") {
		forge.topbar.setTitle('Meal');
	} else if (location.hash == "#places") {
		forge.topbar.setTitle('Nearby');
	} else if (location.hash == "#friends") {
		forge.topbar.setTitle('Select Friends');
	} else {
		forge.topbar.setTitle('Scrumptious');
	}

	if (location.hash =="#menu") {
		addLogout();
	} else {
		addBack();
	}
});
