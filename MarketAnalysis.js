// ==UserScript==
// @name       Aso Market analysis
// @version    0.1
// @description  Does market analysis on Aso
// @match      http://*.minethings.com/?buy
// @copyright  2013+, David Dhuet
// ==/UserScript==

"use strict";

var cities = ["Harmond", "Burbana", "Cissna", "Daigard"];
var city = 0;

var results = {};

/*  changeCities(city, changeBox);
 
	changeBox is basically document.getElementById("sub1"); but doesn't include that so that you can use with iFrames
    
    Note, this is non server-specific. It just matches city names against the string.

*/

function changeCities(city, changeBox) {
    var cities = changeBox.getElementsByTagName("a");
    var i;
    for (i=0; i<cities.length -2; i++) { //-2 because change server and map are both at the end
        if ( (cities[i].innerHTML === city) || (cities[i].innerHTML === (city + " (home)")) ) {
            cities[i].click();
            return true;
        }
    }
    return false;
}

function getCity(changeBox) {
    var cities = changeBox.getElementsByTagName("td");
    for (i=0; i<cities.length -2; i++) { //-2 because change server and map are both at the end
        if (cities[i].getElementsByTagName("a").length === 0) { //Return the city name, but remove the (home) bit if it's there
            return cities[i].childNodes[0].innerHTML.replace("(home)", "", "gi").trim();
        }
    }
}
    
        
        
var cityChangeBox = document.getElementById("sub1"); //I'm rather proud of this bit. Instead of changing cities, I just change city order.
var tempCurrent = getCity(cityChangeBox);
if (cities.indexOf(tempCurrent) > 0) {
	cities.unshift( cities.splice( cities.indexOf(tempCurrent), 1)[0] );
}

console.log(cities);


var parentDiv = document.getElementById("halfcenter"); //Make sure the "main" div actually exists.
if (!parentDiv) {
    return;
}
parentDiv.innerHTML = ""; //We don't want all the notifications and whatnot.

var rightDiv = document.getElementById("right"); //Do the same thing for the "right" div, and then just remove it because we don't need it
if (!rightDiv) {
    return;
}
rightDiv.parentNode.removeChild(rightDiv);

var currentLoadout = []; //The array of individual URL strings that we have chosen, so currentLoadout[0] = URL1
var buttonsDiv = document.createElement("div"); //Add the initial UI


//Yes, this is lazy and non-dynamic, but I am not wasting the time writing 15 setAttributes

buttonsDiv.innerHTML = "<br><button type=\"button\" id=\"NewLoadout\">New Loadout</button> <button type=\"button\" id=\"LoadLoadout\">Load Loadout</button> <button type=\"button\" id=\"DeleteLoadout\">Delete Layout</button>";
buttonsDiv.setAttribute("id", "ButtonsDiv");
parentDiv.appendChild(buttonsDiv); //Add buttonsDiv to the page

if (!GM_getValue("loadoutList")) {//If they have no loadout(s) saved, take some appropriate steps
    document.getElementById("LoadLoadout").setAttribute("disabled", "true"); //Otherwise don't let them click the load or delete buttons
    document.getElementById("DeleteLoadout").setAttribute("disabled", "true");
    GM_setValue("loadoutList", "");
}

document.getElementById("NewLoadout").addEventListener("click", newLoadout, false);
document.getElementById("LoadLoadout").addEventListener("click", loadLoadout, false);
document.getElementById("DeleteLoadout").addEventListener("click", deleteLoadout, false);


/*
 	Only called with event listeners
    
*/

function newLoadout() {
    if (document.getElementById("SaveLoadout")) { //If we are already in New Loadout, don't do anything (i.e. they clicked twice)
        return;
    }
    
    var loadoutDiv = document.getElementById("LoadoutDiv"); //In these few lines, we clear the board if they have delete/load going.
    
    if (loadoutDiv) {
        loadoutDiv.parentNode.removeChild(loadoutDiv);
	}

    var parentDiv = document.getElementById("halfcenter");
    loadoutDiv = document.createElement("div"); //This is the div we create to wrap New, Load, and Delete in. It's how we "clear the board"
    loadoutDiv.setAttribute("id", "LoadoutDiv");
    parentDiv.appendChild(loadoutDiv);
    
	var loadoutName = document.createElement("div");
    loadoutName.innerHTML = "<br><br><span id=\"NameTitle\" style=\"font-weight: bold;\">Loadout Name: </span><input id=\"LoadoutName\" type=\"text\" autocomplete=\"off\" size=\"20\"><br><br><br>"; 
    var inputBox = document.createElement("textarea"); //The box they paste URL's into
    inputBox.setAttribute("id", "LoadoutTextarea");
    inputBox.setAttribute("cols", "75");
    inputBox.setAttribute("rows", "20");
    inputBox.setAttribute("spellcheck", "false");
    inputBox.setAttribute("wrap", "soft");
    inputBox.setAttribute("placeholder", "Paste item URL's here. One per row.");
    var saveLoadoutButton = document.createElement("button"); //The button they "submit" aforementioned box with
   	saveLoadoutButton.setAttribute("id", "SaveLoadout");
    saveLoadoutButton.innerHTML = "Save Loadout";
    saveLoadoutButton.addEventListener("click", saveLoadout, false);
    
    loadoutDiv.appendChild(loadoutName);
    loadoutDiv.appendChild(inputBox);
    loadoutDiv.appendChild(saveLoadoutButton);
    
}

/*
 	Only called with event listeners
    
*/

function saveLoadout() {
    var myTextArea = document.getElementById("LoadoutTextarea");
    var myName = document.getElementById("LoadoutName");
    var myText = myTextArea.value;
    var myArrayElements = myText.split("\n");
    var loadLoadoutButton = document.getElementById("LoadLoadout");
    var deleteLoadoutButton = document.getElementById("DeleteLoadout");
    var loadoutDiv = document.getElementById("LoadoutDiv");
    var cleanedArray = [];
    for (i=0; i<myArrayElements.length; i++) {
        if (cleanedArray.indexOf(myArrayElements[i]) === -1 ) {
            cleanedArray.push(myArrayElements[i]);
    	}
    }
    //This next line looks a bit odd, but you don't want to preface with @ if it's the first one
    GM_setValue("loadoutList", GM_getValue("loadoutList") + (GM_getValue("loadoutList") ? "@" : "") + myName.value );
    GM_setValue(myName.value, cleanedArray.join("@") );
    loadLoadoutButton.removeAttribute("disabled");
    deleteLoadoutButton.removeAttribute("disabled");
    loadoutDiv.parentNode.removeChild(loadoutDiv);
}
    
    
    
function loadLoadout() {
    var loadoutDiv = document.getElementById("LoadoutDiv"); //Clear board if new/delete is going
    if (loadoutDiv) {
        loadoutDiv.parentNode.removeChild(loadoutDiv);
    }
    
    if (!GM_getValue("loadoutList") ) { //This should never happen, but never say never
        alert("This should not happen. You have no loadouts saved, yet you clicked the load button.");
        return;
    }
    
    var parentDiv = document.getElementById("halfcenter");
    loadoutDiv = document.createElement("div");
    loadoutDiv.setAttribute("id", "LoadoutDiv");
    parentDiv.appendChild(loadoutDiv);
    var myBr = document.createElement("br");
    loadoutDiv.appendChild(myBr);
    var mySelect = document.createElement("select");
    var opt;

    var loadoutNames = GM_getValue("loadoutList").split("@"); //Little fancy here. Makes a named pair of Name-URLlist and purges bad names from it and GM + adds it to select
    for (i=0; i<loadoutNames.length; i++) {
        if (GM_getValue(loadoutNames[i]) ) {
            opt = document.createElement("option");
            opt.setAttribute("value", loadoutNames[i]);
            opt.innerHTML = loadoutNames[i];
            mySelect.appendChild(opt);
    	}
    }
    
    loadoutDiv.appendChild(mySelect);
    var runLoadout = document.createElement("button");
    runLoadout.setAttribute("type", "button");
    runLoadout.setAttribute("id", "RunLoadout");
    runLoadout.innerHTML = "Run";
    myBr = document.createElement("br");
    loadoutDiv.appendChild(myBr);
    loadoutDiv.appendChild(runLoadout);
    runLoadout.addEventListener("click", function() {
        
        if (!mySelect) { //Obvious error checking as usual
            alert("mySelect doesn't exist. How does this button exist?");
        	return;
        }
        
        var kiddies = mySelect.getElementsByTagName("option");
        if (!kiddies.length || (mySelect.selectedIndex === null) || !kiddies[mySelect.selectedIndex] ) {
            alert("Something went wrong with finding that option");
            return;
        }
   	 	var myChoice = kiddies[mySelect.selectedIndex].value;
    
		if (!myChoice) {
			alert("Your choice doesn't seem to exist...");
			return;
		}	
    
		myChoice = GM_getValue(myChoice);
    
		if (!myChoice) {
        	alert("There was a problem loading your choice from GM storage");
   			return;
   		}
    
    	myChoice = myChoice.split("@");
        
        if (!myChoice.length || myChoice.length <= 0) {
            alert("A problem with the split loadout");
            return;
        }
        
        loadIframes(myChoice);
        
    } , false);
    
}

function deleteLoadout() {
    
    var loadoutDiv = document.getElementById("LoadoutDiv"); //As usual, clear the board if they were doing something else
    if (loadoutDiv) {
        loadoutDiv.parentNode.removeChild(loadoutDiv);
    }
    
    if (!GM_getValue("loadoutList") ) { //This should never happen, but never say never
        alert("This should not happen. You have no loadouts saved, yet you clicked the load button.");
        return;
    }
    
    var parentDiv = document.getElementById("halfcenter");
    loadoutDiv = document.createElement("div");
    loadoutDiv.setAttribute("id", "LoadoutDiv");
    var myTable = document.createElement("table");
    myTable.setAttribute("id", "MyTable");
    parentDiv.appendChild(loadoutDiv);
    loadoutDiv.appendChild(myTable);
    
    var loadoutNames = GM_getValue("loadoutList").split("@");
    
    for(i=0; i<loadoutNames.length; i++) {
        var newTR = document.createElement("tr");
        newTR.innerHTML = "<td>" + loadoutNames[i] + "</td> <td><button type=\"button\" myTarget=\"" + loadoutNames[i] + "\">X</button></td>"
        myTable.appendChild(newTR);
    }
    
    myTable.addEventListener("click", deleteRow, false);
    
}

function deleteRow(e) {
    if (!e.target || !e.target.getAttribute("myTarget") ) { //Not one of our buttons
        return;
    }
    var myTable = document.getElementById("MyTable");
    var myButton = e.target;
    var loadoutName = e.target.getAttribute("myTarget");
    var loadoutList = GM_getValue("loadoutList").split("@");
    if (loadoutList.indexOf(loadoutName) !== -1) { //Just more error testing. Don't splice unless it exists
    	loadoutList.splice(loadoutList.indexOf(loadoutName), 1);
    }
    
    if (loadoutList.length <= 0) {
        GM_setValue("loadoutList", "");
        document.getElementById("LoadLoadout").setAttribute("disabled", "true");
   		document.getElementById("DeleteLoadout").setAttribute("disabled", "true");
    }
    
    else {
    	GM_setValue("loadoutList", loadoutList.join("@") );
    }
    
    GM_deleteValue(loadoutName);
    myTable.removeChild(e.target.parentNode.parentNode);
   
}

   
function loadIframes(loadout) {
    
    console.log(loadout);
    
    var loadoutDiv = document.getElementById("LoadoutDiv"); //Clear board if new/delete is going
    if (loadoutDiv) {
        loadoutDiv.parentNode.removeChild(loadoutDiv);
    }
    
    var buttonsDiv = document.getElementById("ButtonsDiv");
    var parentDiv = document.getElementById("halfcenter");
    parentDiv.removeChild(buttonsDiv);

    createIframe(parentDiv, "MarketIframe_0", loadout[0], function(){runIframe(loadout, 0);});
}
    
function createIframe(parentDiv, id, src, manager) { //Manager is the onload function you want it to run.
		var iframe = document.createElement("iframe");
		iframe.setAttribute("id", id);
		iframe.setAttribute("src", src);
		iframe.setAttribute("width", "300");
		iframe.setAttribute("height", "300");
		iframe.setAttribute("frameborder", "0");
		if(manager) {
			iframe.addEventListener("load", manager, true);
		}
		parentDiv.appendChild(iframe);
}

function nextCity() { //creates or reloads an iframe that immediately changes the city to the city var and then reloads the first item iframe
    city++;
    var reloader;
    if (!document.getElementById("reloader")) {
        reloader = document.createElement("iframe");
        reloader.src = "http://aso.minethings.com";
        reloader.addEventListener("load", function() {
            var changeBox = this.contentDocument.getElementById("sub1");
            if (getCity(changeBox) === cities[city]) { //If this just loaded, and we're at the right city, it means we just changed and need to reload frame0
                var frame0 = document.getElementById("MarketIframe_0");
                frame0.src = frame0.src;
            }
            else {
            	changeCities(cities[city], changeBox);
            }
            
            
            
        }, false);
        parentDiv.appendChild(reloader);
    }
    
    else {
        reloader = document.getElementById("reloader");
        reloader.src = reloader.src;
    }
}

function analysisComplete() {
    alert("Done!");
}
        
        

function runIframe(loadout, frameNumber) { //This is the func each iFrame calls
    var thisFrame = document.getElementById("MarketIframe_" + frameNumber.toString());
    var nextFrame = frameNumber + 1;
    var frameDoc = thisFrame.contentDocument;
    var itemName = frameDoc.getElementsByClassName("things-table")[0].getElementsByTagName("td")[0].getElementsByTagName("b")[0].innerHTML;
    var parentDiv = document.getElementById("halfcenter");
    var tables = frameDoc.body.getElementsByClassName("itemview-table");
    var listingRows = tables[1].getElementsByTagName("tr");
    var bidRows = tables[2].getElementsByTagName("tr");
    var saleRows = tables[3].getElementsByTagName("tr");
    
    if (city === 0) { //This gets confusing. Basically each item URL needs an object for each city. Too long to make statically.
    	results[loadout[frameNumber]] = [];
        for (i=0; i<cities.length; i++) {
        	results[loadout[frameNumber]][i] = {};
        }
    }
    var result = results[loadout[frameNumber]][city];
    result.listings = [];
    result.bids = [];
    result.sales = [];
    
    if (listingRows[1].innerHTML) {
        for (i=1; i<listingRows.length; i++) {
            result.listings.push(listingRows[i].getElementsByTagName("td")[1].innerHTML);
        }
    }
    
    if (bidRows[1].innerHTML) {
        for (i=1; i<bidRows.length; i++) {
            result.bids.push(bidRows[i].getElementsByTagName("td")[1].innerHTML);
        }
    }
    
    if (saleRows[1].innerHTML) {
        for (i=1; i<saleRows.length; i++) {
            var tempButt = saleRows[i].getElementsByTagName("td");
            result.sales.push([tempButt[0].innerHTML, tempButt[1].innerHTML]);
        }
	}
   
    result.name = itemName;
    
    result.city = cities[city];
        
    console.log(result);
    
    /*Move on*/
    
    if (nextFrame !== loadout.length) { //If we have more frames in the current city
        createIframe(parentDiv, ("MarketIframe_" + nextFrame.toString()), loadout[nextFrame], function(){runIframe(loadout, nextFrame);});
    }
    
    else if ( (city + 1) !== cities.length)	{ //If we reached the last frame of this city
        nextCity();
    }
    
    else { //We just did the last of everything
        analysisComplete();
        return;
    }
}
    
