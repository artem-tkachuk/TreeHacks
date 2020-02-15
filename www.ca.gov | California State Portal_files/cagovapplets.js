var apiLocation = "https://api.stateentityprofile.ca.gov/";

//var imageUrlPrefix = "https://california.azureedge.net/cdt/CAgovPortal/images/Uploads";
var imageUrlPrefix = "https://stateentityprofile.ca.gov/Uploads";

// Holders of API Data - Home page
//var homepageImageResults = [];
var homepageServiceResults = [];

// Holders of API Data - Service Details page
var serviceDetailsResults = [];
var relatedServicesResults = [];
var serviceLocationsResults = [];
var serviceFaqResults = [];

// Holders of API Data - Agency Details page
var agencyDetailsResults = [];
var agencyServicesResults = [];
var agencyFaqResults = [];

// Holders of API Data - Google Embed on Service and Agency Detail Pages
var serviceRelatedLinks = [];

// Holders of API Data - Agency Alphabetic Listing Page
var alphaListingResults = [];

// Holders of API Data - Service Search Page
var serviceSearchResults = [];

// Holders of API Data - Agency Search Page
var agencySearchResults = [];

// Holders for Agencies Ids to Process Services - Sitemap Page
var sitemapAgencyListForServices = [];

var processJsonData = {
    //####################################################################################################
    //    General Functions
    //####################################################################################################

    //--- Change Title On Service Or Agency Page ---------------------------------------------------------
    setTitleOfPageForItem: function (textToAddToTitle) {
        var newTitle = textToAddToTitle + " " + document.title;
        document.title = newTitle;
    },

    //--- Create SEO Friendly Name To Pass To Details Page -----------------------------------------------
    processPassedItem: function (linkOutgoingOrIncomming, nameAgencyOrService) {
        var passedName = nameAgencyOrService.toLowerCase();
        if (linkOutgoingOrIncomming === 'Out') {
            passedName = passedName.replace(/^[ ]+|[ ]+$/g, '');
            passedName = passedName.replace("-", "dashline");
            passedName = encodeURIComponent(passedName);
            var i = 0, strPassedNameLengthOut = passedName.length;
            for (i; i < strPassedNameLengthOut; i++) {
                passedName = passedName.replace("%20", "-");
            }

			if (passedName.indexOf("'") !== -1) {
				passedName = passedName.replace("'", "%27");
			}
			
            //--- BEGIN --- Code Mod to support stange proccesing of job training links  ----
            passedName = passedName.replace("get-job-training-in-", "job-training-in-");
            //--- END --- Code Mod to support stange proccesing of job training links  ----
        }
        else {
            passedName = decodeURIComponent(passedName);
            var j = 0, strPassedNameLength = passedName.length;
            for (j; j < strPassedNameLength; j++) {
                passedName = passedName.replace("-", " ");
            }
            passedName = passedName.replace("dashline", "-");
        }
        return passedName;
    },

    //--- Get Location And Time Variables For Homepage Image ---------------------------------------------
    provideImageNameDetails: function (userLong, userLat, userTime) {

        var builtApiUrl = apiLocation + "api/Geospatial/GetTemporalContext?longitude=" + userLong + "&latitude=" + userLat + "&dateTime=" + userTime;

        var loadFlag = false;
        var loadCount = 0;
        var homepageImageResult = "";

        function loadResults() {
            if (loadCount === 0) {
                var putApiRequest = new XMLHttpRequest();
                putApiRequest.open("POST", builtApiUrl, true);
                putApiRequest.onreadystatechange = function () {
                    if (this.readyState === 4 && this.status === 200) {
                        homepageImageResults = this.responseText;
                    }
                    if (this.readyState === 4 && this.status === 404) {
                        homepageImageResults = "NONEXISTS";
                    }
                };
                putApiRequest.setRequestHeader('Content-Type', 'application/json');
                putApiRequest.withCredentials = false;
                putApiRequest.send();
            }
            loadCount += 1;
            if (loadFlag === false) {
                if (typeof homepageImageResults !== "undefined") {
                    if (homepageImageResults.length > 9) {
                        loadFlag = true;
                        loadcount = 500;
                    }
                }
                if (loadCount >= 500) {
                    loadFlag = true;
                }
                window.setTimeout(loadResults, 100); /* this checks the flag every 100 milliseconds*/
            }
            else {
                if (loadCount < 500) {

                    var locationDetails = "";

                    var dataToProcess = JSON.parse(homepageImageResults);
                    homepageImageResults = 0;

                    var getTimeOfDay = "";
                    var getSeason = "";

                    switch (dataToProcess.Sun) {
                        case 1:
                            getTimeOfDay = "DAY";
                            break;
                        default:
                            getTimeOfDay = "NIGHT";
                    }

                    switch (dataToProcess.Season) {
                        case 0:
                            getSeason = "SPRING";
                            break;
                        case 1:
                            getSeason = "SUMMER";
                            break;
                        case 2:
                            getSeason = "FALL";
                            break;
                        case 3:
                            getSeason = "WINTER";
                            break;
                        default:
                            getSeason = "SUMMER";
                    }
                    locationDetails = dataToProcess.Region.toUpperCase() + "|" + getSeason + "|" + getTimeOfDay;
                    console.log(locationDetails);
                    computedBackgroundLocationValues = locationDetails;
                }
            }
        }
        loadResults();
    },

    //####################################################################################################
    //    Display Service Functions
    //####################################################################################################

    showHomePageServices: function (howManyDivHolders, theTilesParent, selectedService1, selectedService2, selectedService3, selectedService4, lang, serviceLandingPage, agencyLandingPage) {

        if (lang === "") { lang = "en"; }

        var selectedHomepageServices = [selectedService1, selectedService2, selectedService3, selectedService4];

        for (var i = 0; i < selectedHomepageServices.length; i++) {
            processJsonData.populateHomepageServicesArray(selectedHomepageServices.length - 1, i, 'serviceDataHolder', selectedHomepageServices[i], lang);
        }

        var loadFlag = false;
        var loadCount = 0;

        function loadList() {
            if (loadFlag === false) {
                var serviceText = document.getElementById("serviceDataHolder").innerHTML;
                var count = (serviceText.match(/<!-- END -->/g) || []).length;

                if (count > selectedHomepageServices.length - 1) {
                    loadFlag = true;
                }
                loadCount += 1;
                if (loadCount >= 1000) {
                    loadFlag = true;
                }
                window.setTimeout(loadList, 100); /* this checks the flag every 100 milliseconds*/
            }
            else {
                if (loadCount < 1000) {

                    var str = document.getElementById("serviceDataHolder").innerHTML;
                    document.getElementById("serviceDataHolder").innerHTML = "";
                    var dataElement = document.getElementById("serviceDataHolder");
                    dataElement.parentNode.removeChild(dataElement);

                    var serviceItem = str.split('<!-- END -->');

                    if (serviceItem.length > 0) {

                        var textToDisplayTiles = "";
                        var tabbackground = "";
                        var panelTextToPass = "";
                        var serviceCounter = 0;

                        for (var j = 0; j < serviceItem.length - 1; j++) {

                            textToDisplayTiles = "";
                            tabbackground = "";

                            if (serviceItem[j] !== "0") {

                                var serviceItemParts = serviceItem[j].split('[|]');

                                serviceCounter = serviceCounter + 1;

                                var agencyNameToPass = processJsonData.processPassedItem('Out', serviceItemParts[4]);
                                var serviceNameToPass = processJsonData.processPassedItem('Out', serviceItemParts[2]);

                                if (serviceItemParts[1]) {
                                    tabbackground += serviceItemParts[1];
                                }
                                else {
                                    tabbackground += "service-general.jpg";
                                }
								textToDisplayTiles += "<div class=\"teaser\">";
                                textToDisplayTiles += "<h4 class=\"title\" aria-label=\"" + serviceItemParts[2] + " Service Tile. Hit Enter to toggle between displaying and hiding details about this service.\">" + serviceItemParts[2] + "</h4>";
                                textToDisplayTiles += "</div>";

                                idbuilder = "featured-service-tab-" + serviceCounter;
                                document.getElementById(idbuilder).innerHTML = textToDisplayTiles;
								document.getElementById(idbuilder).setAttribute("aria-label", serviceItemParts[2] + " Service Tile. Hit Enter to toggle between displaying and hiding details about this service."); 
                                document.getElementById(idbuilder).style.backgroundImage = "url('" + imageUrlPrefix + "/" + tabbackground + "')";

                                holderDescription = serviceItemParts[5];
                                holderDescription = holderDescription.slice(0, 200) + "...";

                                panelTextToPass = "";
                                panelTextToPass += "<div class=\"section section-default\">";
                                panelTextToPass += "<div class=\"container\" style=\"padding-top: 5px;\">";
                                panelTextToPass += "<div class=\"card card-block\">";
                                panelTextToPass += "<button type=\"button\" class=\"close btn\" data-dismiss=\"modal\" aria-label=\"Hit Enter to close details.\" style=\"font-size: 1.5em;\">X</button>";
                                panelTextToPass += "<div class=\"group\">";
                                panelTextToPass += "<div class=\"two-thirds\">";
                                panelTextToPass += "<h1 class=\"m-y-0 \">" + serviceItemParts[2] + "</h1>";
                                panelTextToPass += "<p class=\"lead\"><a href=\"" + agencyLandingPage + "?item=" + agencyNameToPass + "\"  aria-label=\"View " + serviceItemParts[4] + " Agency Details.\">" + serviceItemParts[4] + "</a></p>";
                                panelTextToPass += "<p>" + holderDescription + "</p><br>";
                                panelTextToPass += "<div class=\"btn-row m-b\">";
                                panelTextToPass += "<a href=\"javascript:externalConfirmation('redirectConfirm','" + serviceItemParts[3] + "', 'launch-" + serviceNameToPass + "');\" id=\"launch-" + serviceNameToPass + "\" class=\"btn btn-default btn-block-xs\" aria-label=\"Launch the " + serviceItemParts[2] + " service. \"><span class=\"ca-gov-icon-computer\"></span> Launch Service</a>";
                                panelTextToPass += "<a href=\"" + serviceLandingPage + "?item=" + serviceNameToPass + "\" class=\"btn btn-default btn-block-xs\" aria-label=\"View additional details about the " + serviceItemParts[2] + " service.\"><span class=\"ca-gov-icon-info\"></span> See Details</a>";
                                panelTextToPass += "                            </div>";
                                panelTextToPass += "<div class=\"location\" itemscope itemtype=\"http://schema.org/Organization\">";
                                panelTextToPass += "<meta itemprop=\"name\" content=\"" + serviceItemParts[2] + "\">";
                                panelTextToPass += "<div class=\"contact\">";
                                panelTextToPass += "<p class=\"other\">";

                                if (serviceItemParts[7]) {

                                    panelTextToPass += "General Information: <span itemprop=\"telephone\">" + serviceItemParts[7] + "</span><br>";
                                }

                                panelTextToPass += "</p>";
                                panelTextToPass += "</div>";

                                panelTextToPass += "</div>";
                                panelTextToPass += "</div>";
                                panelTextToPass += "<div class=\"third text-center\">";

                                panelTextToPass += "<img src=\"" + imageUrlPrefix + "/";

                                if (serviceItemParts[6]) {
                                    panelTextToPass += serviceItemParts[6];
                                }
                                else {
                                    panelTextToPass += "logo-CAGeneral.png";
                                }

                                panelTextToPass += "\" class=\"img-responsive m-t-md\" alt=\"\">";
                                panelTextToPass += "</div>";
                                panelTextToPass += "</div>";
                                panelTextToPass += "</div>";
                                panelTextToPass += "</div>";
                                panelTextToPass += "</div>";

                                idbuilder = "featured-service-panel-" + serviceCounter;
                                document.getElementById(idbuilder).innerHTML = panelTextToPass;
                            }
                        }

                        if (serviceCounter > 0) {
                            var elt = document.getElementById(theTilesParent);
                            elt.style.cssText = "background-color:#000000;";
                        }


                        if (!(serviceCounter === howManyDivHolders)) {
                            var element = "";
                            setTimeout(function () {
                                for (var i = serviceCounter; i < howManyDivHolders; i++) {
                                    var num = i + 1;
                                    element = "featured-service-tab-" + num;
                                    element = document.getElementById(element);
                                    element.parentNode.removeChild(element);
                                    element = "featured-service-panel-" + num;
                                    element = document.getElementById(element);
                                    element.parentNode.removeChild(element);
                                }
                            }, 100);
                        }
                    }
                    else {
                        var elementToRemove = document.getElementById(theTilesParent);
                        elementToRemove.parentNode.removeChild(elementToRemove);
                    }
                }
            }
        }
        loadList();
    },

    populateHomepageServicesArray: function (arraymax, currentitem, idOfDivToFill, selectedService, lang) {

        var builtApiUrl = apiLocation + "api/Services/GetServiceById/" + selectedService + "/" + lang;

        var loadFlag = false;
        var loadCount = 0;

        function loadResults() {
            if (loadCount === 0) {
                var getApiRequest = new XMLHttpRequest();
                getApiRequest.open("GET", builtApiUrl, true);
                getApiRequest.onreadystatechange = function () {
                    if (this.readyState === 4 && this.status === 200) {
                        homepageServiceResults.push(this.responseText);
                    }
                    if (this.readyState === 4 && this.status === 404) {
                        homepageServiceResults.push("NONEXISTS");
                    }
                };
                getApiRequest.setRequestHeader('Content-Type', 'application/json');
                getApiRequest.withCredentials = false;
                getApiRequest.send();
            }
            loadCount += 1;
            if (loadFlag === false) {
                if (typeof homepageServiceResults[currentitem] !== "undefined") {
                    if (homepageServiceResults[currentitem].length > 5) {
                        loadFlag = true;
                    }
                }
                if (loadCount >= 50) {
                    loadFlag = true;
                }
                window.setTimeout(loadResults, 100); /* this checks the flag every 100 milliseconds*/
            }
            else {
                if (loadCount < 50) {
                    var textToPass = "";
                    if (homepageServiceResults[currentitem] === "NONEXISTS") {
                        textToPass = "0<!-- END -->";
                    }
                    else {
                        var dataToProcess = JSON.parse(homepageServiceResults[currentitem]);

                        textToPass = dataToProcess.ServiceId + "[|]" + dataToProcess.ImageUrl + "[|]" + dataToProcess.ServiceName + "[|]" + dataToProcess.ServiceUrl + "[|]" + dataToProcess.FriendlyName + "[|]" + dataToProcess.Description + "[|]" + dataToProcess.LogoUrl + "[|]" + dataToProcess.ContactPhone + "[|]" + dataToProcess.AgencyId + "<!-- END -->";
                    }
                    var text = document.getElementById(idOfDivToFill).innerHTML;
                    document.getElementById(idOfDivToFill).innerHTML = text + textToPass;
                }
            }
        }
        loadResults();
    },

    showServiceDetails: function (idOfDivToFill, searchvalue, lang, serviceLandingPage, agencyLandingPage) {

        var serviceNameToPass = processJsonData.processPassedItem('In', searchvalue);

        if (lang === "") { lang = "en"; }
        var builtApiUrl = apiLocation + "api/Services/FindServicesByName/" + serviceNameToPass + "/" + lang;

        var loadFlag = false;
        var loadCount = 0;

        function loadResults() {
            if (loadCount === 0) {
                var getApiRequest = new XMLHttpRequest();
                getApiRequest.open("GET", builtApiUrl, true);
                getApiRequest.onreadystatechange = function () {
                    if (this.readyState === 4 && this.status === 200) {
                        serviceDetailsResults.push(this.responseText);
                    }
                    if (this.readyState === 4 && this.status === 404) {
                        serviceDetailsResults.push("NONEXISTS");
                    }
                };
                getApiRequest.setRequestHeader('Content-Type', 'application/json');
                getApiRequest.withCredentials = false;
                getApiRequest.send();
            }
            loadCount += 1;
            if (loadFlag === false) {
                if (typeof serviceDetailsResults[0] !== "undefined") {
                    if (serviceDetailsResults[0].length > 10) {
                        loadFlag = true;
                    }
                }
                if (loadCount >= 1000) {
                    loadFlag = true;
                }
                window.setTimeout(loadResults, 100); /* this checks the flag every 100 milliseconds*/
            }
            else {
                if (loadCount < 1000) {
                    var dataToProcess = JSON.parse(serviceDetailsResults[0]);
                    var textToDisplay = "";

                    processJsonData.setTitleOfPageForItem(dataToProcess[0].ServiceName);

                    textToDisplay += "<div class=\"group\">";
                    textToDisplay += "<div class=\"third\">";
                    textToDisplay += "<img src=\"" + imageUrlPrefix + "/";
                    if (dataToProcess[0].ImageUrl) {
                        textToDisplay += dataToProcess[0].ImageUrl;
                    }
                    else {
                        textToDisplay += "service-general.jpg";
                    }
                    textToDisplay += "\" alt=\"" + dataToProcess[0].ServiceName + "\" class=\"img-responsive img-thumbnail\">";
                    textToDisplay += "</div>";
                    textToDisplay += "<div class=\"two-thirds\">";
                    textToDisplay += "<h1 class=\"m-y-0 text-accent-p1\">" + dataToProcess[0].ServiceName + "</h1>";

                    var agencyNameToPass = processJsonData.processPassedItem('Out', dataToProcess[0].FriendlyName);
					var serviceNameToPass = processJsonData.processPassedItem('Out', dataToProcess[0].ServiceName);

                    textToDisplay += "<p class=\"lead\"><a aria-label=\"View Details page for " + dataToProcess[0].ServiceName + "\" href=\"" + agencyLandingPage + "?item=" + agencyNameToPass + "\">";
                    textToDisplay += dataToProcess[0].FriendlyName + " (" + dataToProcess[0].Acronym + ")";
                    textToDisplay += "</a></p>";
                    textToDisplay += "<p>" + dataToProcess[0].Description + "</p>";
                    textToDisplay += "<div class=\"btn-row m-y\">";
                    textToDisplay += "<a aria-label=\"Launch " + dataToProcess[0].ServiceName + " Service\" href=\"javascript:externalConfirmation('redirectConfirm','" + dataToProcess[0].ServiceUrl + "', 'launch-" + serviceNameToPass + "');\" id=\"launch-" + serviceNameToPass + "\" class=\"btn btn-primary btn-block-xs\"><span class=\"ca-gov-icon-computer\"></span>";
                    textToDisplay += " &nbsp; <span>Launch Service</span>";
                    textToDisplay += "</a>&nbsp;";

                    textToDisplay += "<a aria-label=\"View Contact page for " + dataToProcess[0].ServiceName + "\" href=\"javascript:externalConfirmation('redirectConfirm','" + dataToProcess[0].ContactUrl + "', 'service-" + serviceNameToPass + "');\" id=\"service-" + serviceNameToPass + "\"   class=\"btn btn-primary btn-block-xs\">";
                    textToDisplay += "<span class=\"ca-gov-icon-contact-us\"></span>";
                    textToDisplay += " &nbsp; <span>Contact Us</span>";
                    textToDisplay += "</a>";
                    textToDisplay += "</div>";
                    textToDisplay += "<div class=\"location\" itemscope itemtype=\"http://schema.org/Organization\">";
                    textToDisplay += "<meta itemprop=\"name\" content=\"" + dataToProcess[0].FriendlyName + "\">";
                    textToDisplay += "<p class=\"other\">General Information: <span itemprop=\"telephone\">" + dataToProcess[0].ContactPhone + "</span><br>";
                    textToDisplay += "</p>";
                    textToDisplay += "</div>";
                    textToDisplay += "<div class=\"btn-row m-t\" id=\"relatedServices\">";

                    textToDisplay += "</div>";
                    textToDisplay += "</div>";
                    document.getElementById(idOfDivToFill).innerHTML = textToDisplay + "<!-- DONE -->";

                    processJsonData.showRelatedServicesButtons('relatedServices', dataToProcess[0].ServiceName, dataToProcess[0].AgencyId, lang, serviceLandingPage);
                    pageServiceId = dataToProcess[0].ServiceId;
                    pageAgencyId = dataToProcess[0].AgencyId;
                    pageServiceSearchTerms = dataToProcess[0].Keywords;
                }
            }
        }
        loadResults();
    },

    showRelatedServicesButtons: function (idOfDivToFill, currentService, searchvalue, lang, serviceLandingPage) {

        var data = JSON.stringify([
            searchvalue
        ]);

        if (lang === "") { lang = "en"; }

        var builtApiUrl = apiLocation + "api/Services/GetServicesByAgencyIds?lang=" + lang;

        var loadFlag = false;
        var loadCount = 0;

        function loadResults() {
            if (loadCount === 0) {
                var putApiRequest = new XMLHttpRequest();
                putApiRequest.open("POST", builtApiUrl, true);
                putApiRequest.onreadystatechange = function () {
                    if (this.readyState === 4 && this.status === 200) {
                        relatedServicesResults.push(this.responseText);
                    }
                    if (this.readyState === 4 && this.status === 404) {
                        relatedServicesResults.push("NONEXISTS");
                    }
                };
                putApiRequest.setRequestHeader('Content-Type', 'application/json');
                putApiRequest.withCredentials = false;
                putApiRequest.send(data);
            }
            loadCount += 1;
            if (loadFlag === false) {
                if (typeof relatedServicesResults[0] !== "undefined") {
                    if (relatedServicesResults[0].length > 10) {
                        loadFlag = true;
                    }
                }
                if (loadCount >= 5000) {
                    loadFlag = true;
                }
                window.setTimeout(loadResults, 100); /* this checks the flag every 100 milliseconds*/
            }
            else {
                if (loadCount < 5000) {
                    var result = JSON.parse(relatedServicesResults[0]);
                    this.apiData = result;
                    var arrayLength = this.apiData.length;

                    var texttopass = "";

                    if (arrayLength > 1) {
                        for (var i = 0; i < arrayLength; i++) {
                            if (!(this.apiData[i].ServiceName === currentService)) {
                                var serviceNameToPass = processJsonData.processPassedItem('Out', this.apiData[i].ServiceName);

                                texttopass += "<a aria-label=\"View Details page for " + this.apiData[i].ServiceName + " Service\" href=\"" + serviceLandingPage + "?item=" + serviceNameToPass + "\" class=\"btn btn-default btn-xs\">" + this.apiData[i].ServiceName + "</a>";
                            }
                        }
                    }

                    if (texttopass.length > 0) {
                        texttopass = "<span>Related Services: </span>" + texttopass;
                    }

                    document.getElementById(idOfDivToFill).innerHTML = texttopass;


                }
            }
        }
        loadResults();
    },

    showFilteredServiceMap: function (idOfTextDivFill, idOfMapDivFill, containingSection, thisLong, thisLat, thisAgencyId, thisServiceId, returnCount, lang) {

        if (lang === "") { lang = "en"; }
        var builtApiUrl = apiLocation + "GetNearestLocations?lang=" + lang + "&agencyId=" + thisAgencyId + "&longitude=" + thisLong + "&latitude=" + thisLat + "&maxReturn=" + returnCount;
        var loadFlag = false;
        var loadCount = 0;
        serviceLocationsResults = [];
        var element = document.getElementById(containingSection);
        var closestLocationFlag = true;

        function loadResults() {
            if (loadCount === 0) {
                var putApiRequest = new XMLHttpRequest();
                putApiRequest.open("POST", builtApiUrl, true);
                putApiRequest.onreadystatechange = function () {
                    if (this.readyState === 4 && this.status === 200) {
                        serviceLocationsResults.push(this.responseText);
                    }
                    if (this.readyState === 4 && this.status === 404) {
                        serviceLocationsResults.push("NONEXISTS");
                    }
                };
                putApiRequest.setRequestHeader('Content-Type', 'application/json');
                putApiRequest.withCredentials = false;
                putApiRequest.send(null);
            }
            loadCount += 1;
            if (loadFlag === false) {
                if (typeof serviceLocationsResults[0] !== "undefined") {
                    if (serviceLocationsResults[0].length > 10 || serviceLocationsResults[0] === "[]") {
                        loadFlag = true;
                    }
                }
                if (loadCount >= 500) {
                    loadFlag = true;
                }
                window.setTimeout(loadResults, 100); /* this checks the flag every 100 milliseconds*/
            }
            else {
                if (loadCount < 500) {
                    var dataToProcess = JSON.parse(serviceLocationsResults[0]);
                    var arrayLength = dataToProcess.QueryResults.length;
                    var textToDisplay = "";
                    var mapDataToDisplay = "";
                    if (arrayLength > 1) {
                        for (var i = 0; i < arrayLength; i++) {
                            var latlng = dataToProcess.QueryResults[i].PointLocation.Geography.WellKnownText;

                            var isCurrentServiceFlag = false;
                            for (var j = 0; j < dataToProcess.QueryResults[i].AgencyServiceIds.length; j++) {
                                if (dataToProcess.QueryResults[i].AgencyServiceIds[j] === thisServiceId) {
                                    isCurrentServiceFlag = true;
                                }
                            }
                            if (isCurrentServiceFlag === true) {
                                latlng = latlng.replace("POINT (", "");
                                latlng = latlng.replace(")", "");
                                var latlngArray = latlng.split(" ");
                                var latValue = latlngArray[0];
                                var lngValue = latlngArray[1];
                                if (closestLocationFlag === true) {
                                    closestLocationLat = latValue;
                                    closestLocationLong = lngValue;
                                    closestLocationFlag = false;
                                }
                                mapDataToDisplay += "^" + latValue;
                                mapDataToDisplay += "|" + lngValue;
                                mapDataToDisplay += "|" + dataToProcess.QueryResults[i].LocationName;
                                mapDataToDisplay += "|" + dataToProcess.QueryResults[i].Id;
                                mapDataToDisplay += "|" + dataToProcess.QueryResults[i].StreetAddress;
                                mapDataToDisplay += "|" + dataToProcess.QueryResults[i].City;
                                mapDataToDisplay += "|" + dataToProcess.QueryResults[i].State;
                                mapDataToDisplay += "|" + dataToProcess.QueryResults[i].ZipCode;
																
								textToDisplay += "<div class=\"location-list\" onMouseOver=\"this.style.backgroundColor = '#F3F3F3'\" onMouseOut=\"this.style.backgroundColor = '#FFFFFF'\"><a href=\"javascript:centerIt(" + dataToProcess.QueryResults[i].Id + "," + lngValue + "," + latValue + ");\" class=\"location-list-item\">" + dataToProcess.QueryResults[i].LocationName + "</a><span role=\"status\" aria-atomic=\"true\" aria-live=\"polite\"><div class=\"location-details\" id=\"locationItem" +dataToProcess.QueryResults[i].Id + "\">" + dataToProcess.QueryResults[i].StreetAddress + "<br />" + dataToProcess.QueryResults[i].City + ", " + dataToProcess.QueryResults[i].State + " " + dataToProcess.QueryResults[i].ZipCode + "<br /><a class=\"btn btn-default btn-xs direction-button\" href=\"http://maps.google.com/?daddr=" + lngValue + "," + latValue  + "\" target=\"_blank\" aria-label=\"Get Google Maps Directions to " + dataToProcess.QueryResults[i].StreetAddress + " " + dataToProcess.QueryResults[i].City + ", " + dataToProcess.QueryResults[i].State + " " + dataToProcess.QueryResults[i].ZipCode + "\" >Get directions</a></div></span></div>";

                            }
                        }

                        if (mapDataToDisplay.length > 0) {
                            document.getElementById(idOfTextDivFill).innerHTML = textToDisplay + "<!-- DONE -->";
                            document.getElementById(idOfMapDivFill).innerHTML = mapDataToDisplay;
                        }
                        else {
                            element.parentNode.removeChild(element);
                        }
                    }
                    else {
                        element.parentNode.removeChild(element);
                    }
                }
            }
        }
        loadResults();
    },

    showServiceFaq: function (idOfDivToFill, containingSection, searchvalue, lang) {

        var data = JSON.stringify([
            searchvalue
        ]);

        if (lang === "") { lang = "en"; }

        var builtApiUrl = apiLocation + "GetFaqsByServiceIds?lang=" + lang;

        var loadFlag = false;
        var loadCount = 0;
        function loadResults() {
            if (loadCount === 0) {
                var putApiRequest = new XMLHttpRequest();
                putApiRequest.open("POST", builtApiUrl, true);
                putApiRequest.onreadystatechange = function () {
                    if (this.readyState === 4 && this.status === 200) {
                        serviceFaqResults.push(this.responseText);
                    }
                    if (this.readyState === 4 && this.status === 404) {
                        serviceFaqResults.push("NONEXISTS");
                    }
                };
                putApiRequest.setRequestHeader('Content-Type', 'application/json');
                putApiRequest.withCredentials = false;
                putApiRequest.send(data);
            }
            loadCount += 1;
            if (loadFlag === false) {
                if (typeof serviceFaqResults[0] !== "undefined") {
                    if (serviceFaqResults[0].length > 10 || serviceFaqResults[0] === "[]") {
                        loadFlag = true;
                    }
                }
                if (loadCount >= 50) {
                    loadFlag = true;
                }
                window.setTimeout(loadResults, 100); /* this checks the flag every 100 milliseconds*/
            }
            else {
                if (loadCount < 50) {
                    var dataToProcess = JSON.parse(serviceFaqResults[0]);
                    var arrayLength = dataToProcess.length;
                    var textToDisplay = "";
                    if (arrayLength > 1) {

                        textToDisplay += "<div class=\"panel-group accordion\" id=\"faq-accordion\" role=\"tablist\" aria-multiselectable=\"true\">";

                        for (var i = 0; i < arrayLength; i++) {
                            textToDisplay += "<div class=\"panel panel-default\"  role=\"presentation\">";
                            textToDisplay += "  <div class=\"panel-heading\" role=\"presentation\" id=\"faq-" + i + "\">";
                            textToDisplay += "    <h4 class=\"panel-title\" role=\"presentation\">";
                            textToDisplay += "<a class=\"collapsed\" role=\"tab\" data-toggle=\"collapse\" data-parent=\"#faq-accordion\" href=\"#collapse-" + i + "\" aria-expanded=\"false\" aria-controls=\"collapse-" + i + "\">";
                            textToDisplay += dataToProcess[i].Question;
                            textToDisplay += "</a></h4></div>";
                            textToDisplay += "  <div id=\"collapse-" + i + "\" class=\"panel-collapse collapse\" role=\"tabpanel\" aria-labelledby=\"faq-collapse-" + dataToProcess[i].Id + "\">";

                            textToDisplay += "      <div class=\"panel-body\" id=\"faq-collapse-" + dataToProcess[i].Id + "\">";
                            textToDisplay += dataToProcess[i].Answer;
                            textToDisplay += "       </div>";
                            textToDisplay += "    </div>";
                            textToDisplay += "</div>";
                        }

                        textToDisplay += "</div>";

                        document.getElementById(idOfDivToFill).innerHTML = textToDisplay + "<!-- DONE -->";
                    }
                    else {
                        var element = document.getElementById(containingSection);
                        element.parentNode.removeChild(element);
                    }
                }
            }
        }
        loadResults();
    },

    showServiceRelatedLinks: function (agencyid, lang) {

        if (lang === "") { lang = "en"; }

        var builtApiUrl = apiLocation + "api/Agencies/GetAgencyById/" + agencyid + "/" + lang;

        var loadFlag = false;
        var loadCount = 0;

        function loadResults() {

            if (loadCount === 0) {
                var getApiRequest = new XMLHttpRequest();
                getApiRequest.open("GET", builtApiUrl, true);
                getApiRequest.onreadystatechange = function () {
                    if (this.readyState === 4 && this.status === 200) {
                        serviceRelatedLinks.push(this.responseText);
                    }
                    if (this.readyState === 4 && this.status === 404) {
                        serviceRelatedLinks.push("NONEXISTS");
                    }
                };
                getApiRequest.setRequestHeader('Content-Type', 'application/json');
                getApiRequest.withCredentials = false;
                getApiRequest.send();
            }

            loadCount += 1;

            if (loadFlag === false) {
                if (typeof serviceRelatedLinks[0] !== "undefined") {
                    if (serviceRelatedLinks[0].length > 10) {
                        loadFlag = true;
                    }
                }
                if (loadCount >= 5000) {
                    loadFlag = true;
                }
                window.setTimeout(loadResults, 100); /* this checks the flag every 100 milliseconds*/
            }
            else {
                if (loadCount < 5000) {
                    var dataToProcess = JSON.parse(serviceRelatedLinks[0]);
                    pageServiceSearchCollection = dataToProcess.GssSearchEngineID;
                }
            }
        }
        loadResults();
    },

    buildServiceCard: function (serviceId, serviceImage, serviceAgencyFriendlyName, serviceAgencyAcronym, serviceName, serviceUrl, serviceDescription, serviceContactPhone, lang, serviceLandingPage, agencyLandingPage) {
        var descriptionHolder = "";
        descriptionHolder = serviceDescription;
        descriptionHolder = descriptionHolder.slice(0, 95) + "...";

        var agencyNameToPass = processJsonData.processPassedItem('Out', serviceAgencyFriendlyName);
        var serviceNameToPass = processJsonData.processPassedItem('Out', serviceName);

        var cardToBuild = "";
        cardToBuild += "<div class=\"card card-default\">";
        cardToBuild += "<div class=\"card-body\">";
        cardToBuild += "<div class=\"card-block card-body\" id=\"collapse" + serviceId + "\" itemscope itemtype=\"http://schema.org/Organization\">";
        cardToBuild += "<div class=\"row\">";
        cardToBuild += "<div class=\"col-lg-3\">";
        cardToBuild += "<img src=\"" + imageUrlPrefix + "/";
        if (serviceImage) {
            cardToBuild += serviceImage;
        }
        else {
            cardToBuild += "service-general.jpg";
        }
        cardToBuild += "\" alt=\"" + serviceName + " Service Icon\" class=\"img-responsive\">";
        cardToBuild += "</div>";
        cardToBuild += "<div class=\"col-lg-9\">";
        cardToBuild += "<a aria-label=\"View Details about " + serviceName + " Service\" href=\"" + serviceLandingPage + "?item=" + serviceNameToPass + "\" class=\"lead\">" + serviceName + "</a>";

        cardToBuild += "<div class=\"row\">";
        cardToBuild += "<div class=\"col-lg-7\">";
        cardToBuild += "<p itemprop=\"name\"><a  aria-label=\"View Agency Details for " + serviceAgencyFriendlyName + "\" href=\"" + agencyLandingPage + "?item=" + agencyNameToPass + "\">" + serviceAgencyFriendlyName + "</a></p>";
        cardToBuild += "<div class=\"collapse collapse" + serviceId + "\">";
        cardToBuild += "<p itemprop=\"description\">" + descriptionHolder + "</p>";
        cardToBuild += "<div class=\"location\" itemscope itemtype=\"http://schema.org/Organization\">";
        cardToBuild += "<meta itemprop=\"name\" content=\"" + serviceAgencyFriendlyName + "\">";
        cardToBuild += "<p class=\"other\">";
        cardToBuild += "General Information: <span itemprop=\"telephone\">" + serviceContactPhone + "</span><br>";
        cardToBuild += "</p>";
        cardToBuild += "</div>";
        cardToBuild += "</div>";
        cardToBuild += "</div>";
        cardToBuild += "<div class=\"col-lg-5\">";

        cardToBuild += "<a  aria-label=\"View Details about " + serviceName + " Service\" href=\"" + serviceLandingPage + "?item=" + serviceNameToPass + "\" class=\"btn btn-secondary btn-block btn-sm m-t-md\">Service Detail</a>";
        cardToBuild += "<div class=\"collapse collapse" + serviceId + "\">";
        cardToBuild += "</div>";
        cardToBuild += "</div>";
        cardToBuild += "</div>";
        cardToBuild += "</div>";
        cardToBuild += "</div>";
        cardToBuild += "</div>";
        cardToBuild += "<div class=\"card-block text-center\">";
        cardToBuild += "<a aria-label=\"Toggle between Expanding and Shrinking Services card for " + serviceName + " Service\" style=\"padding: 10px 5px 5px 5px;text-decoration: none;\" href=\"javascript:toggleCollapseSwapper('toggle-" + serviceId + "-" + serviceAgencyAcronym.replace( ' ', '') + "');\" role=\"button\" data-toggle=\"collapse\" data-parent=\"#collapse" + serviceId + "\" aria-expanded=\"false\" aria-controls=\"collapse" + serviceId + "\" data-target=\".collapse" + serviceId + "\">";
        cardToBuild += "<span id=\"toggle-" + serviceId + "-" + serviceAgencyAcronym.replace( ' ', '') + "\" style=\"color: #666666; font-size: 24px;\" class=\"ca-gov-icon-plus-fill\"></span><span class=\"sr-only\">Open</span>";
        cardToBuild += "</a>";
        cardToBuild += "</div>";
        cardToBuild += "</div>";
        cardToBuild += "</div>";

        return cardToBuild;
    },

    showFeaturedServices: function (selectedService1, selectedService2, selectedService3, selectedService4, lang, serviceLandingPage, agencyLandingPage) {

        if (lang === "") { lang = "en"; }

        var selectedServices = [selectedService1, selectedService2, selectedService3, selectedService4];
        var idBuilder = "";
        var itemNumber = 0;

        for (var i = 0; i < selectedServices.length; i++) {
            var currentServiceId = selectedServices[i];
            if (currentServiceId > 0) {
                itemNumber = itemNumber + 1;
                idBuilder = "serviceTile" + itemNumber;
                processJsonData.populateFeaturedService(selectedServices[i], itemNumber, idBuilder, lang, serviceLandingPage, agencyLandingPage);
            }
        }
    },

    populateFeaturedService: function (selectedService, currentCountItem, selectedServiceLocation, lang, serviceLandingPage, agencyLandingPage) {

        var builtApiUrl = "";
        switch (currentCountItem) {
            case 1:
                builtApiUrl = apiLocation + "api/Services/GetServiceById/" + selectedService + "/" + lang;
                var getApiRequest = new XMLHttpRequest();
                getApiRequest.open("GET", builtApiUrl, true);
                getApiRequest.onreadystatechange = function () {
                    if (this.readyState === 4 && this.status === 200) {
                        var result1 = JSON.parse(this.responseText);
                        document.getElementById(selectedServiceLocation).innerHTML = processJsonData.buildServiceCard(result1.ServiceId, result1.ImageUrl, result1.FriendlyName, result1.Acronym, result1.ServiceName, result1.ServiceUrl, result1.Description, result1.ContactPhone, lang, serviceLandingPage, agencyLandingPage);
                    }
                };
                getApiRequest.setRequestHeader('Content-Type', 'application/json');
                getApiRequest.withCredentials = false;
                getApiRequest.send();
                break;
            case 2:
                builtApiUrl = apiLocation + "api/Services/GetServiceById/" + selectedService + "/" + lang;
                var getApiRequest2 = new XMLHttpRequest();
                getApiRequest2.open("GET", builtApiUrl, true);
                getApiRequest2.onreadystatechange = function () {
                    if (this.readyState === 4 && this.status === 200) {
                        var result2 = JSON.parse(this.responseText);
                        document.getElementById(selectedServiceLocation).innerHTML = processJsonData.buildServiceCard(result2.ServiceId, result2.ImageUrl, result2.FriendlyName, result2.Acronym, result2.ServiceName, result2.ServiceUrl, result2.Description, result2.ContactPhone, lang, serviceLandingPage, agencyLandingPage);
                    }
                };
                getApiRequest2.setRequestHeader('Content-Type', 'application/json');
                getApiRequest2.withCredentials = false;
                getApiRequest2.send();
                break;
            case 3:
                builtApiUrl = apiLocation + "api/Services/GetServiceById/" + selectedService + "/" + lang;
                var getApiRequest3 = new XMLHttpRequest();
                getApiRequest3.open("GET", builtApiUrl, true);
                getApiRequest3.onreadystatechange = function () {
                    if (this.readyState === 4 && this.status === 200) {
                        var result3 = JSON.parse(this.responseText);
                        document.getElementById(selectedServiceLocation).innerHTML = processJsonData.buildServiceCard(result3.ServiceId, result3.ImageUrl, result3.FriendlyName, result3.Acronym, result3.ServiceName, result3.ServiceUrl, result3.Description, result3.ContactPhone, lang, serviceLandingPage, agencyLandingPage);
                    }
                };
                getApiRequest3.setRequestHeader('Content-Type', 'application/json');
                getApiRequest3.withCredentials = false;
                getApiRequest3.send();
                break;
            default:
                builtApiUrl = apiLocation + "api/Services/GetServiceById/" + selectedService + "/" + lang;
                var getApiRequestd = new XMLHttpRequest();
                getApiRequestd.open("GET", builtApiUrl, true);
                getApiRequestd.onreadystatechange = function () {
                    if (this.readyState === 4 && this.status === 200) {
                        var resultd = JSON.parse(this.responseText);
                        document.getElementById(selectedServiceLocation).innerHTML = processJsonData.buildServiceCard(resultd.ServiceId, resultd.ImageUrl, resultd.FriendlyName, resultd.Acronym, resultd.ServiceName, resultd.ServiceUrl, resultd.Description, resultd.ContactPhone, lang, serviceLandingPage, agencyLandingPage);
                    }
                };
                getApiRequestd.setRequestHeader('Content-Type', 'application/json');
                getApiRequestd.withCredentials = false;
                getApiRequestd.send();
        }
    },

    //####################################################################################################
    //    Display Agency Functions
    //####################################################################################################

    showAgencyDetails: function (idOfDivToFill, searchvalue, lang) {

        var agencyNamePassed = processJsonData.processPassedItem('In', searchvalue);

        if (lang === "") { lang = "en"; }

        var builtApiUrl = apiLocation + "api/Agencies/FindAgenciesByName/" + agencyNamePassed + "/" + lang;

        var loadFlag = false;
        var loadCount = 0;

        function loadResults() {
            if (loadCount === 0) {
                var getApiRequest = new XMLHttpRequest();
                getApiRequest.open("GET", builtApiUrl, true);
                getApiRequest.onreadystatechange = function () {
                    if (this.readyState === 4 && this.status === 200) {
                        agencyDetailsResults.push(this.responseText);
                    }
                    if (this.readyState === 4 && this.status === 404) {
                        agencyDetailsResults.push("NONEXISTS");
                    }
                };
                getApiRequest.setRequestHeader('Content-Type', 'application/json');
                getApiRequest.withCredentials = false;
                getApiRequest.send();
            }
            loadCount += 1;
            if (loadFlag === false) {
                if (typeof agencyDetailsResults[0] !== "undefined") {
                    if (agencyDetailsResults[0].length > 10) {
                        loadFlag = true;
                    }
                }
                if (loadCount >= 1000) {
                    loadFlag = true;
                }
                window.setTimeout(loadResults, 100); /* this checks the flag every 100 milliseconds*/
            }
            else {
                if (loadCount < 1000) {

                    var result = JSON.parse(agencyDetailsResults[0]);

                    this.apiData = result;

                    var r = 0;
                    var agencyArrayLength = this.apiData.length;
                    if (agencyArrayLength > 0) {
                        var t = 0;
                        var fromAPI = "";
                        for (t = 0; t < agencyArrayLength; t++) {
                            fromAPI = this.apiData[t].FriendlyName.toLowerCase();
                            if (agencyNamePassed === fromAPI) {
                                r = t;
                            }
                        }
                    }

                    pageAgencyId = this.apiData[r].AgencyId;
                    pageServiceSearchTerms = this.apiData[r].FriendlyName;
                    pageServiceSearchCollection = this.apiData[r].GssSearchEngineID;
                    pageMobileAppsText = this.apiData[r].MobileApps;
                    processJsonData.setTitleOfPageForItem(this.apiData[r].FriendlyName);


                    var textToDisplay = "";
					var friendlyNameId = processJsonData.processPassedItem('Out', this.apiData[r].FriendlyName);
					friendlyNameId = friendlyNameId.replace( '%27', '');
					
                    textToDisplay += "";
                    textToDisplay += "<div class=\"quarter text-center\">";
                    textToDisplay += "<img src=\"" + imageUrlPrefix + "/";
                    if (this.apiData[r].LogoUrl) {
                        textToDisplay += this.apiData[r].LogoUrl;
                    } else {
                        textToDisplay += "logo-CAGeneral.png";
                    }
                    textToDisplay += "\" class=\"img-responsive m-b\" alt=\"" + this.apiData[r].FriendlyName + "\">";
                    textToDisplay += "</div>";
                    textToDisplay += "<div class=\"three-quarters\">";
                    textToDisplay += "<h1 class=\"text-accent-p7 m-t-0\">" +
                        this.apiData[r].FriendlyName +
                        " (" +
                        this.apiData[r].Acronym +
                        ")</h1>";
                    textToDisplay += "<p>" + this.apiData[r].Description + "</p>";
                    textToDisplay += "<div class=\"btn-row\">";
                    textToDisplay += "<a aria-label=\"Open website for " + this.apiData[r].FriendlyName + "\"  href=\"javascript:externalConfirmation('redirectConfirm','" + this.apiData[r].WebsiteURL + "', 'website-" + friendlyNameId + "');\" id=\"website-" + friendlyNameId + "\"  class=\"btn btn-default\"><span class=\"ca-gov-icon-computer\"></span> &nbsp;<span> Website</span></a>";
                    textToDisplay += "<a aria-label=\"View Contact page for " + this.apiData[r].FriendlyName + "\" href=\"javascript:externalConfirmation('redirectConfirm','" + this.apiData[r].ContactURL + "', 'contactpage-" + friendlyNameId + "');\" id=\"contactpage-" + friendlyNameId + "\" class=\"btn btn-default\"><span class=\"ca-gov-icon-contact-us\"></span> &nbsp;<span> Contact</span></a>";
                    textToDisplay += "</div>";
                    textToDisplay +=
                        "<div class=\"location contact\" itemscope=\"\" itemtype=\"http://schema.org/Organization\">";
                    textToDisplay += "<meta itemprop=\"name\" content=\"" + this.apiData[r].FriendlyName + "\">";
                    textToDisplay += "<div class=\"contact\">";
                    textToDisplay += "<p class=\"other\">";
                    if (this.apiData[r].ContactPhone) {
                        textToDisplay += "General Information: <span itemprop=\"telephone\">" +
                            this.apiData[r].ContactPhone +
                            "</span><br>";
                    }
                    if (this.apiData[r].HearingImpairedPhone) {
                        textToDisplay += "Hearing Impaired: <span itemprop=\"telephone\">" +
                            this.apiData[r].HearingImpairedPhone +
                            "</span><br>";
                    }
                    if (this.apiData[r].FaxNumber) {
                        textToDisplay += "Fax Number: <span itemprop=\"faxNumber\">" +
                            this.apiData[r].FaxNumber +
                            "</span><br>";
                    }
                    if (this.apiData[r].PhoneHours) {
                        textToDisplay += "Phone Hours of Availability: <span itemprop=\"PhoneHoursOfAvailability\">" +
                            this.apiData[r].PhoneHours +
                            "</span><br>";
                    }
                    textToDisplay += "</p>";
                    textToDisplay += "</div>";
                    textToDisplay += "</div>";
                    textToDisplay += "<ul class=\"list-inline list-unstyled details-page-social-icons\">";
                    if (this.apiData[r].TwitterAccount) {
                        var twitterItem = this.apiData[r].TwitterAccount;
                        twitterItem = twitterItem.replace("https://", "");
                        twitterItem = twitterItem.replace("http://", "");
                        twitterItem = twitterItem.replace("www.twitter.com/", "");
                        textToDisplay += "<li style=\"margin-right:8px;margin-left: 8px;margin-top: 10px;\">";
                        textToDisplay += "<a aria-label=\"Twitter Information  for " + this.apiData[r].FriendlyName + "\" href=\"javascript:externalConfirmation('redirectConfirm','https://twitter.com/" +
                            twitterItem + "', 'twitter-" + friendlyNameId + "');\" id=\"twitter-" + friendlyNameId + "\"><span class=\"ca-gov-icon-twitter\" aria-hidden=\"true\"><span class=\"sr-only\">Twitter for " + this.apiData[r].FriendlyName + "</span></span></a>";
                        textToDisplay += "</li>";
                    }
                    if (this.apiData[r].Facebook) {
                        var facebookItem = this.apiData[r].Facebook;
                        facebookItem = facebookItem.replace("https://", "");
                        facebookItem = facebookItem.replace("http://", "");
                        facebookItem = facebookItem.replace("www.facebook.com/", "");
                        textToDisplay += "<li style=\"margin-right:8px;margin-left: 8px;margin-top: 10px;\">";
                        textToDisplay += "<a aria-label=\"Facebook Information  for " + this.apiData[r].FriendlyName + "\" href=\"javascript:externalConfirmation('redirectConfirm','https://www.facebook.com/" +
                            facebookItem + "', 'facebook-" + friendlyNameId + "');\" id=\"facebook-" + friendlyNameId + "\"><span class=\"ca-gov-icon-facebook\" aria-hidden=\"true\"><span class=\"sr-only\">Facebook for " + this.apiData[r].FriendlyName + "</span></span></a>";
                        textToDisplay += "</li>";
                    }
                    if (this.apiData[r].YouTube) {
                        var youTubeItem = this.apiData[r].YouTube;
                        youTubeItem = youTubeItem.replace("https://", "");
                        youTubeItem = youTubeItem.replace("http://", "");
                        youTubeItem = youTubeItem.replace("www.youtube.com/", "");
                        textToDisplay += "<li style=\"margin-right:8px;margin-left: 8px;margin-top: 10px;\">";
                        textToDisplay += "<a  aria-label=\"YouTube Information  for " + this.apiData[r].FriendlyName + "\" href=\"javascript:externalConfirmation('redirectConfirm','https://www.youtube.com/" +
                            youTubeItem + "', 'youtube-" + friendlyNameId + "');\" id=\"youtube-" + friendlyNameId + "\"><span class=\"ca-gov-icon-youtube\" aria-hidden=\"true\"><span class=\"sr-only\">YouTube for " + this.apiData[r].FriendlyName + "</span></span></a>";
                        textToDisplay += "</li>";
                    }
                    textToDisplay += "</ul>";
                    textToDisplay += "</div>";

                    document.getElementById(idOfDivToFill).innerHTML = textToDisplay + "<!-- DONE -->";
                }
            }
        }
        loadResults();
    },

    showAgencyServicesTilesAndPanels: function (howManyDivHolders, parentContainer, currentSection, currentAgency, searchvalue, lang, serviceLandingPage, agencyLandingPage) {

        var data = JSON.stringify([
            currentAgency
        ]);

        if (lang === "") { lang = "en"; }

        var builtApiUrl = apiLocation + "api/Services/GetServicesByAgencyIds?lang=" + lang;

        var loadFlag = false;
        var loadCount = 0;
        var textToDisplayTiles = "";
        var tabbackground = "";
        var panelTextToPass = "";
        var serviceCounter = 0;
        var holderDescription = "";

        function loadResults() {
            if (loadCount === 0) {
                var putApiRequest = new XMLHttpRequest();
                putApiRequest.open("POST", builtApiUrl, true);
                putApiRequest.onreadystatechange = function () {
                    if (this.readyState === 4 && this.status === 200) {
                        agencyServicesResults.push(this.responseText);
                    }
                    if (this.readyState === 4 && this.status === 404) {
                        agencyServicesResults.push("NONEXISTS");
                    }
                };
                putApiRequest.setRequestHeader('Content-Type', 'application/json');
                putApiRequest.withCredentials = false;
                putApiRequest.send(data);
            }
            loadCount += 1;
            if (loadFlag === false) {
                if (typeof agencyServicesResults[0] !== "undefined") {
                    if (agencyServicesResults[0].length > 10) {
                        loadFlag = true;
                    }
                }
                if (loadCount >= 50) {
                    loadFlag = true;
                }
                window.setTimeout(loadResults, 10); /* this checks the flag every 100 milliseconds*/
            }
            else {
                if (loadCount < 50) {
                    var result = JSON.parse(agencyServicesResults[0]);
                    this.apiData = result;
                    var arrayLength = this.apiData.length;

                    if (arrayLength > 0) {

                        for (var i = 0; i < arrayLength; i++) {
                            serviceCounter = serviceCounter + 1;
                            var agencyNameToPass = processJsonData.processPassedItem('Out', this.apiData[i].FriendlyName);
                            var serviceNameToPass = processJsonData.processPassedItem('Out', this.apiData[i].ServiceName);

                            if (this.apiData[i].ImageUrl) {
                                tabbackground = this.apiData[i].ImageUrl;
                            }
                            else {
                                tabbackground = "service-general.jpg";
                            }
							textToDisplayTiles += "<div class=\"teaser\">";
							textToDisplayTiles += "<h4 class=\"title\" aria-label=\"" + this.apiData[i].ServiceName + " Service Tile. Hit Enter to toggle between displaying and hiding details about this service.\">" + this.apiData[i].ServiceName + "</h4>";
							textToDisplayTiles += "</div>";

							idbuilder = "featured-service-tab-" + serviceCounter;
							document.getElementById(idbuilder).innerHTML = textToDisplayTiles;
							document.getElementById(idbuilder).setAttribute("aria-label", this.apiData[i].ServiceName + " Service Tile. Hit Enter to toggle between displaying and hiding details about this service."); 
                            textToDisplayTiles = "";
                            document.getElementById(idbuilder).style.backgroundImage = "url('" + imageUrlPrefix + "/" + tabbackground + "')";

                            holderDescription = this.apiData[i].Description;
                            holderDescription = holderDescription.slice(0, 200) + "...";

                            panelTextToPass = "";
                            panelTextToPass += "<div class=\"section section-default\">";
                            panelTextToPass += "<div class=\"container\" style=\"padding-top: 5px;\">";
                            panelTextToPass += "<div class=\"card card-block\">";
                            panelTextToPass += "<button type=\"button\" class=\"close btn\" data-dismiss=\"modal\" aria-label=\"Hit Enter to close details.\" style=\"font-size: 1.5em;\">X</button>";
                            panelTextToPass += "<div class=\"group\">";
                            panelTextToPass += "<div class=\"two-thirds\">";
                            panelTextToPass += "<h1 class=\"m-y-0 \">" + this.apiData[i].ServiceName + "</h1>";
                            panelTextToPass += "<p class=\"lead\"><a href=\"" + agencyLandingPage + "?item=" + agencyNameToPass + "\"  aria-label=\"View " + this.apiData[i].FriendlyName + " Agency Details.\">" + this.apiData[i].FriendlyName + "</a></p>";
                            panelTextToPass += "<p>" + holderDescription + "</p><br>";
                            panelTextToPass += "<div class=\"btn-row m-b\">";
                            panelTextToPass += "<a href=\"javascript:externalConfirmation('redirectConfirm','" + this.apiData[i].ServiceUrl + "', 'launch-" + serviceNameToPass + "');\" id=\"launch-" + serviceNameToPass  + "\" class=\"btn btn-default btn-block-xs\" aria-label=\"Launch the " + this.apiData[i].ServiceName + " service. \"><span class=\"ca-gov-icon-computer\"></span> Launch Service</a>";
                            panelTextToPass += "<a href=\"" + serviceLandingPage + "?item=" + serviceNameToPass + "\" class=\"btn btn-default btn-block-xs\" aria-label=\"View additional details about the " + this.apiData[i].ServiceName + " service.\"><span class=\"ca-gov-icon-info\"></span> See Details</a>";
                            panelTextToPass += "                            </div>";
                            panelTextToPass += "<div class=\"location\" itemscope itemtype=\"http://schema.org/Organization\">";
                            panelTextToPass += "<meta itemprop=\"name\" content=\"" + this.apiData[i].ServiceName + "\">";
                            panelTextToPass += "<div class=\"contact\">";
                            panelTextToPass += "<p class=\"other\">";


                            if (this.apiData[i].ContactPhone) {
                                panelTextToPass += "General Information: <span itemprop=\"telephone\">" + this.apiData[i].ContactPhone + "</span><br>";
                            }

                            panelTextToPass += "</p>";
                            panelTextToPass += "</div>";

                            panelTextToPass += "</div>";
                            panelTextToPass += "</div>";
                            panelTextToPass += "<div class=\"third text-center\">";

                            panelTextToPass += "<img src=\"" + imageUrlPrefix + "/";

                            if (this.apiData[i].LogoUrl) {
                                panelTextToPass += this.apiData[i].LogoUrl;
                            }
                            else {
                                panelTextToPass += "logo-CAGeneral.png";
                            }

                            panelTextToPass += "\" class=\"img-responsive m-t-md\" alt=\"" + this.apiData[i].FriendlyName + "\">";
                            panelTextToPass += "</div>";
                            panelTextToPass += "</div>";
                            panelTextToPass += "</div>";
                            panelTextToPass += "</div>";
                            panelTextToPass += "</div>";

                            idbuilder = "featured-service-panel-" + serviceCounter;
                            document.getElementById(idbuilder).innerHTML = panelTextToPass;
                        }

                        var elt = document.getElementById(parentContainer);
                        elt.style.cssText = "background-color: #161616";


                        if (!(serviceCounter === howManyDivHolders)) {
                            var element = "";
                            setTimeout(function () {
                                for (var i = serviceCounter; i < howManyDivHolders; i++) {
                                    var num = i + 1;
                                    element = "featured-service-tab-" + num;
                                    element = document.getElementById(element);
                                    element.parentNode.removeChild(element);
                                    element = "featured-service-panel-" + num;
                                    element = document.getElementById(element);
                                    element.parentNode.removeChild(element);
                                }
                            }, 100);
                        }
                    }
                    else {
                        var elementToRemove = document.getElementById(currentSection);
                        elementToRemove.parentNode.removeChild(elementToRemove);
                    }
                }
                else {
                    var elementToRemoveAfterTimeout = document.getElementById(currentSection);
                    elementToRemoveAfterTimeout.parentNode.removeChild(elementToRemoveAfterTimeout);
                }
            }
        }
        loadResults();
    },

    showFilteredAgencyMap: function (idOfTextDivFill, idOfMapDivFill, containingSection, thisLong, thisLat, thisAgencyId, returnCount, lang) {

        if (lang === "") { lang = "en"; }
        var builtApiUrl = apiLocation + "GetNearestLocations?lang=" + lang + "&agencyId=" + thisAgencyId + "&longitude=" + thisLong + "&latitude=" + thisLat + "&maxReturn=" + returnCount;
        var loadFlag = false;
        var loadCount = 0;
        serviceLocationsResults = [];
        var element = document.getElementById(containingSection);
        var closestLocationFlag = true;

        function loadResults() {
            if (loadCount === 0) {
                var putApiRequest = new XMLHttpRequest();
                putApiRequest.open("POST", builtApiUrl, true);
                putApiRequest.onreadystatechange = function () {
                    if (this.readyState === 4 && this.status === 200) {
                        serviceLocationsResults.push(this.responseText);
                    }
                    if (this.readyState === 4 && this.status === 404) {
                        serviceLocationsResults.push("NONEXISTS");
                    }
                };
                putApiRequest.setRequestHeader('Content-Type', 'application/json');
                putApiRequest.withCredentials = false;
                putApiRequest.send(null);
            }
            loadCount += 1;
            if (loadFlag === false) {
                if (typeof serviceLocationsResults[0] !== "undefined") {
                    if (serviceLocationsResults[0].length > 10 || serviceLocationsResults[0] === "[]") {
                        loadFlag = true;
                    }
                }
                if (loadCount >= 500) {
                    loadFlag = true;
                }
                window.setTimeout(loadResults, 100); /* this checks the flag every 100 milliseconds*/
            }
            else {
                if (loadCount < 500) {
                    var dataToProcess = JSON.parse(serviceLocationsResults[0]);
                    var arrayLength = dataToProcess.QueryResults.length;
                    var textToDisplay = "";
                    var mapDataToDisplay = "";
                    if (arrayLength > 1) {
                        for (var i = 0; i < arrayLength; i++) {
                            var latlng = dataToProcess.QueryResults[i].PointLocation.Geography.WellKnownText;

                            latlng = latlng.replace("POINT (", "");
                            latlng = latlng.replace(")", "");
                            var latlngArray = latlng.split(" ");
                            var latValue = latlngArray[0];
                            var lngValue = latlngArray[1];
                            if (closestLocationFlag === true) {
                                closestLocationLat = latValue;
                                closestLocationLong = lngValue;
                                closestLocationFlag = false;
                            }
                            mapDataToDisplay += "^" + latValue;
                            mapDataToDisplay += "|" + lngValue;
                            mapDataToDisplay += "|" + dataToProcess.QueryResults[i].LocationName;
                            mapDataToDisplay += "|" + dataToProcess.QueryResults[i].Id;
                            mapDataToDisplay += "|" + dataToProcess.QueryResults[i].StreetAddress;
                            mapDataToDisplay += "|" + dataToProcess.QueryResults[i].City;
                            mapDataToDisplay += "|" + dataToProcess.QueryResults[i].State;
                            mapDataToDisplay += "|" + dataToProcess.QueryResults[i].ZipCode;
							
							textToDisplay += "<div class=\"location-list\" onMouseOver=\"this.style.backgroundColor = '#F3F3F3'\" onMouseOut=\"this.style.backgroundColor = '#FFFFFF'\"><a href=\"javascript:centerIt(" + dataToProcess.QueryResults[i].Id + "," + lngValue + "," + latValue + ");\" class=\"location-list-item\">" + dataToProcess.QueryResults[i].LocationName + "</a><span role=\"status\" aria-atomic=\"true\" aria-live=\"polite\"><div class=\"location-details\" id=\"locationItem" +dataToProcess.QueryResults[i].Id + "\">" + dataToProcess.QueryResults[i].StreetAddress + "<br />" + dataToProcess.QueryResults[i].City + ", " + dataToProcess.QueryResults[i].State + " " + dataToProcess.QueryResults[i].ZipCode + "<br /><a class=\"btn btn-default btn-xs direction-button\" href=\"http://maps.google.com/?daddr=" + lngValue + "," + latValue  + "\" target=\"_blank\" aria-label=\"Get Google Maps Directions to " + dataToProcess.QueryResults[i].StreetAddress + " " + dataToProcess.QueryResults[i].City + ", " + dataToProcess.QueryResults[i].State + " " + dataToProcess.QueryResults[i].ZipCode + "\" >Get directions</a></div></span></div>";

                        }

                        if (mapDataToDisplay.length > 0) {
                            document.getElementById(idOfTextDivFill).innerHTML = textToDisplay + "<!-- DONE -->";
                            document.getElementById(idOfMapDivFill).innerHTML = mapDataToDisplay;
                        }
                        else {
                            element.parentNode.removeChild(element);
                        }
                    }
                    else {
                        element.parentNode.removeChild(element);
                    }
                }
            }
        }
        loadResults();
    },

    showAgencyFeaturedFaq: function (idOfDivToFill, containingSection, searchvalue, lang) {

        var data = JSON.stringify([
            searchvalue
        ]);

        if (lang === "") { lang = "en"; }

        var builtApiUrl = apiLocation + "GetFaqsByAgencyProfileIds?lang=" + lang;

        var loadFlag = false;
        var loadCount = 0;

        function loadResults() {
            if (loadCount === 0) {
                var putApiRequest = new XMLHttpRequest();
                putApiRequest.open("POST", builtApiUrl, true);
                putApiRequest.onreadystatechange = function () {
                    if (this.readyState === 4 && this.status === 200) {
                        agencyFaqResults.push(this.responseText);
                    }
                    if (this.readyState === 4 && this.status === 404) {
                        agencyFaqResults.push("NONEXISTS");
                    }
                };
                putApiRequest.setRequestHeader('Content-Type', 'application/json');
                putApiRequest.withCredentials = false;
                putApiRequest.send(data);
            }
            loadCount += 1;
            if (loadFlag === false) {
                if (typeof agencyFaqResults[0] !== "undefined") {
                    if (agencyFaqResults[0].length > 10 || agencyFaqResults[0] === "[]") {
                        loadFlag = true;
                    }
                }
                if (loadCount >= 50) {
                    loadFlag = true;
                }
                window.setTimeout(loadResults, 100); /* this checks the flag every 100 milliseconds*/
            }
            else {
                if (loadCount < 50) {
                    var dataToProcess = JSON.parse(agencyFaqResults[0]);
                    var arrayLength = dataToProcess.length;
                    var featuredcount = 0;
                    var textToDisplay = "";
                    console.log(arrayLength);

                    if (arrayLength > 1) {

                        textToDisplay += "<div class=\"panel-group accordion\" id=\"faq-accordion\" role=\"tablist\" aria-multiselectable=\"true\">";

                        for (var i = 0; i < arrayLength; i++) {
                            featuredcount += 1;
                            if (featuredcount < 5) {
                                textToDisplay += "<div class=\"panel panel-default\"  role=\"presentation\">";
                                textToDisplay += "  <div class=\"panel-heading\" role=\"presentation\" id=\"faq-" + i + "\">";
                                textToDisplay += "    <h4 class=\"panel-title\" role=\"presentation\">";
                                textToDisplay += "<a class=\"collapsed\" role=\"tab\" data-toggle=\"collapse\" data-parent=\"#faq-accordion\" href=\"#collapse-" + i + "\" aria-expanded=\"false\" aria-controls=\"collapse-" + i + "\">";
                                console.log(dataToProcess[i].Question);
                                console.log(dataToProcess[i].Answer);
                                textToDisplay += dataToProcess[i].Question;
                                textToDisplay += "</a></h4></div>";
                                textToDisplay += "  <div id=\"collapse-" + i + "\" class=\"panel-collapse collapse\" role=\"tabpanel\" aria-labelledby=\"faq-collapse-" + dataToProcess[i].Id + "\">";

                                textToDisplay += "      <div class=\"panel-body\" id=\"faq-collapse-" + dataToProcess[i].Id + "\">";
                                textToDisplay += dataToProcess[i].Answer;
                                textToDisplay += "       </div>";
                                textToDisplay += "    </div>";
                                textToDisplay += "</div>";
                            }
                        }

                        textToDisplay += "</div>";

                        document.getElementById(idOfDivToFill).innerHTML = textToDisplay + "<!-- DONE -->";

                        if (featuredcount === 0) {
                            var noFeaturedElements = document.getElementById(containingSection);
                            noFeaturedElements.parentNode.removeChild(noFeaturedElements);
                        }
                    }
                    else {
                        var noFaqElement = document.getElementById(containingSection);
                        noFaqElement.parentNode.removeChild(noFaqElement);
                    }
                }
            }
        }
        loadResults();
    },

    buildAgencyCard: function (agencyId, agencyLogo, agencyFriendlyName, agencyName, agencyAcronym, agencyUrl, agencyDescription, agencyContactPhone, agencyHearingImpairedPhone, agencyFaxNumber, PhoneHours, agencyContactUrl, agencyTwitterAccount, agencyFacebook, agencyYouTube, agencyContactEmail, agencyLiveChat, lang, agencyLandingPage) {
        var descriptionHolder = "";
        descriptionHolder = agencyDescription;
        descriptionHolder = descriptionHolder.slice(0, 95) + "...";

        var agencyNameToPass = processJsonData.processPassedItem('Out', agencyFriendlyName);

        var cardToBuild = "";

        cardToBuild += "<div class=\"card card-default\">";
        cardToBuild += "<div class=\"card-body\">";
        cardToBuild += "<div class=\"card-block card-body\" id=\"collapse-" + agencyId + "-" + agencyAcronym.replace( ' ', '') + "\" itemscope itemtype=\"http://schema.org/Organization\">";
        cardToBuild += "<div class=\"row\">";
        cardToBuild += "<div class=\"col-lg-3\">";
        cardToBuild += "<img class=\"img-responsive\" src=\"" + imageUrlPrefix + "/";
        if (agencyLogo) {
            cardToBuild += agencyLogo;
        }
        else {
            cardToBuild += "logo-CAGeneral.png";
        }
        cardToBuild += "\" alt=\"" + agencyFriendlyName + " Agency Icon\">";
        cardToBuild += "</div>";
        cardToBuild += "<div class=\"col-lg-9\">";
        cardToBuild += "<a aria-label=\"View Agency Details for " + agencyFriendlyName + "\" href=\"" + agencyLandingPage + "?item=" + agencyNameToPass + "\" class=\"lead\" itemprop=\"name\">" + agencyFriendlyName + "</a>";
        cardToBuild += "<div class=\"row\">";
        cardToBuild += "<div class=\"col-lg-7\">";
        cardToBuild += "<p itemprop=\"description\">" + descriptionHolder + "</p>";
        cardToBuild += "<div class=\"collapse collapse-" + agencyId + "-" + agencyAcronym.replace( ' ', '') + "\">";
        cardToBuild += "<p class=\"other\">";
        if (agencyContactPhone) {
            cardToBuild += "General Information: <span itemprop=\"telephone\">" +
                agencyContactPhone +
                "</span><br>";
        }
        if (agencyHearingImpairedPhone) {
            cardToBuild += "Hearing Impaired: <span itemprop=\"telephone\">" +
                agencyHearingImpairedPhone +
                "</span><br>";
        }
        if (agencyFaxNumber) {
            cardToBuild += "Fax Number: <span itemprop=\"faxNumber\">" +
                agencyFaxNumber +
                "</span><br>";
        }
        if (PhoneHours) {
            cardToBuild += "Phone Hours of Availability: <span itemprop=\"PhoneHoursOfAvailability\">" +
                PhoneHours +
                "</span><br>";
        }
        cardToBuild += "</p>";
        cardToBuild += "</div>";
        cardToBuild += "</div>";
        cardToBuild += "<div class=\"col-lg-5\">";
        cardToBuild += "<a aria-label=\"View Agency Profile for " + agencyFriendlyName + "\" href=\"" + agencyLandingPage + "?item=" + agencyNameToPass + "\" class=\"btn btn-secondary btn-block btn-sm m-t-md\">Agency Profile</a>";
        cardToBuild += "<div class=\"collapse collapse-" + agencyId + "-" + agencyAcronym.replace( ' ', '') + "\">";
        cardToBuild += "<a aria-label=\"View Contact page for " + agencyFriendlyName + "\" href=\"javascript:externalConfirmation('redirectConfirm','" + agencyContactUrl + "', 'contact-" + agencyId + "-" + agencyAcronym.replace( ' ', '') + "');\" id=\"contact-" + agencyId + "-" + agencyAcronym.replace( ' ', '') + "\" class=\"btn btn-secondary btn-block btn-sm\">Contact Agency</a>";
        if (agencyLiveChat) {
            cardToBuild += "<a aria-label=\"Live Chat Information for " + agencyFriendlyName + " \" href=\"javascript:externalConfirmation('redirectConfirm','" + agencyLiveChat + "', 'livechat-" + agencyId + "-" + agencyAcronym.replace( ' ', '') + "');\" id=\"livechat-" + agencyId + "-" + agencyAcronym.replace( ' ', '') + "\" class=\"btn btn-secondary btn-block btn-sm\">Live Chat</a>";
        }
        cardToBuild += "<ul class=\"list-inline list-unstyled details-page-social-icons\">";
        if (agencyTwitterAccount) {
            var thisitem1 = agencyTwitterAccount;
            thisitem1 = thisitem1.replace("https://", "");
            thisitem1 = thisitem1.replace("http://", "");
            thisitem1 = thisitem1.replace("www.twitter.com/", "");
            cardToBuild += "<li style=\"margin-right:8px;margin-left: 8px;margin-top: 10px;\">";
            cardToBuild += "<a aria-label=\"Twitter Information  for " + agencyFriendlyName + "\" href=\"javascript:externalConfirmation('redirectConfirm','https://twitter.com/" + thisitem1 + "', 'twitter-" + agencyId + "-" + agencyAcronym.replace( ' ', '') + "');\" id=\"twitter-" + agencyId + "-" + agencyAcronym.replace( ' ', '') + "\"><span class=\"ca-gov-icon-twitter\" aria-hidden=\"true\"><span class=\"sr-only\">Twitter for " + agencyFriendlyName + "</span></span></a>";
            cardToBuild += "</li>";
        }
        if (agencyFacebook) {
            var thisitem2 = agencyFacebook;
            thisitem2 = thisitem2.replace("https://", "");
            thisitem2 = thisitem2.replace("http://", "");
            thisitem2 = thisitem2.replace("www.facebook.com/", "");
            cardToBuild += "<li style=\"margin-right:8px;margin-left: 8px;margin-top: 10px;\">";
            cardToBuild += "<a aria-label=\"Facebook Information for " + agencyFriendlyName + "\" href=\"javascript:externalConfirmation('redirectConfirm','https://www.facebook.com/" + thisitem2 + "', 'facebook-" + agencyId + "-" + agencyAcronym.replace( ' ', '') + "');\" id=\"facebook-" + agencyId + "-" + agencyAcronym.replace( ' ', '') + "\"><span class=\"ca-gov-icon-facebook\" aria-hidden=\"true\"><span class=\"sr-only\">Facebook for " + agencyFriendlyName + "</span></span></a>";
            cardToBuild += "</li>";
        }
        if (agencyYouTube) {
            var thisitem3 = agencyYouTube;
            thisitem3 = thisitem3.replace("https://", "");
            thisitem3 = thisitem3.replace("http://", "");
            thisitem3 = thisitem3.replace("www.youtube.com/", "");
            cardToBuild += "<li style=\"margin-right:8px;margin-left: 8px;margin-top: 10px;\">";
            cardToBuild += "<a aria-label=\"YouTube Information for " + agencyFriendlyName + " \" href=\"javascript:externalConfirmation('redirectConfirm','https://www.youtube.com/" + thisitem3 + "', 'youtube-" + agencyId + "-" + agencyAcronym.replace( ' ', '') + "');\" id=\"youtube-" + agencyId + "-" + agencyAcronym.replace( ' ', '') + "\"><span class=\"ca-gov-icon-youtube\" aria-hidden=\"true\"><span class=\"sr-only\">YouTube for " + agencyFriendlyName + "</span></span></a>";
            cardToBuild += "</li>";
        }
        if (agencyContactEmail) {
            cardToBuild += "<li style=\"margin-right:8px;margin-left: 8px;margin-top: 10px;\">";
            cardToBuild += "<a aria-label=\"Mail To Link (which includes and email address) for " + agencyFriendlyName + "\" href=\"mailto:" + agencyContactEmail + "\"><span class=\"ca-gov-icon-share-email\" aria-hidden=\"true\"><span class=\"sr-only\">Email</span></span></a>";
            cardToBuild += "</li>";
        }
        cardToBuild += "</ul>";
        cardToBuild += "</div>";
        cardToBuild += "</div>";
        cardToBuild += "</div>";
        cardToBuild += "</div>";
        cardToBuild += "</div>";
        cardToBuild += "</div>";
        cardToBuild += "<div class=\"card-block text-center\">";
        cardToBuild += "<a aria-label=\"Toggle between Expanding and Shrinking Agency card for " + agencyFriendlyName + "\" href=\"javascript:toggleCollapseSwapper('toggle-" + agencyId + "-" + agencyAcronym + "');\" role=\"button\" data-toggle=\"collapse\" data-parent=\"#collapse-" + agencyId + "-" + agencyAcronym.replace( ' ', '') + "\" aria-expanded=\"false\" aria-controls=\"collapse-" + agencyId + "-" + agencyAcronym.replace( ' ', '') + "\" data-target=\".collapse-" + agencyId + "-" + agencyAcronym.replace( ' ', '') + "\">";
        cardToBuild += "<span class=\"toggle-more\"></span><span class=\"sr-only\">Open</span></a> ";
        cardToBuild += "</div>";
        cardToBuild += "</div>";
        cardToBuild += "</div>";

        return cardToBuild;
    },

    buildAlphaUlList: function (idOfDivToFill, lang, agencyLandingPage) {

        if (lang === "") { lang = "en"; }

        var builtApiUrl = apiLocation + "api/Agencies/Get?page=0&pageSize=0&lang=" + lang;

        var loadFlag = false;
        var loadCount = 0;

        function loadResults() {
            if (loadCount === 0) {
                var putApiRequest = new XMLHttpRequest();
                putApiRequest.open("POST", builtApiUrl, true);
                putApiRequest.onreadystatechange = function () {
                    if (this.readyState === 4 && this.status === 200) {
                        alphaListingResults.push(this.responseText);
                    }
                    if (this.readyState === 4 && this.status === 404) {
                        alphaListingResults.push("NONEXISTS");
                    }
                };
                putApiRequest.setRequestHeader('Content-Type', 'application/json');
                putApiRequest.withCredentials = false;
                putApiRequest.send(null);
            }
            loadCount += 1;
            if (loadFlag === false) {
                if (typeof alphaListingResults[0] !== "undefined") {
                    if (alphaListingResults[0].length > 10) {
                        loadFlag = true;
                    }
                }
                if (loadCount >= 50) {
                    loadFlag = true;
                }
                window.setTimeout(loadResults, 100); /* this checks the flag every 100 milliseconds*/
            }
            else {
                if (loadCount < 50) {
                    var result = JSON.parse(alphaListingResults[0]).Data;

                    var arrayLength = result.length;

                    var displayText = "";
                    for (var i = 0; i < arrayLength; i++) {

                        var thisitem1 = "";
                        var thisitem2 = "";
                        var thisitem3 = "";
                        var thisitem4 = "";

                        if (result[i].TwitterAccount) {
                            thisitem1 = result[i].TwitterAccount;
                            thisitem1 = thisitem1.replace("https://", "");
                            thisitem1 = thisitem1.replace("http://", "");
                            thisitem1 = thisitem1.replace("www.", "");
                            thisitem1 = thisitem1.replace("twitter.com/", "");
                        }
                        if (result[i].Facebook) {
                            thisitem2 = result[i].Facebook;
                            thisitem2 = thisitem2.replace("https://", "");
                            thisitem2 = thisitem2.replace("http://", "");
                            thisitem2 = thisitem2.replace("www.", "");
                            thisitem2 = thisitem2.replace("facebook.com/", "");
                        }
                        if (result[i].YouTube) {
                            thisitem3 = result[i].YouTube;
                            thisitem3 = thisitem3.replace("https://", "");
                            thisitem3 = thisitem3.replace("http://", "");
                            thisitem3 = thisitem3.replace("www", "");
                            thisitem3 = thisitem3.replace("youtube.com/", "");
                        }
                        if (result[i].ContactEmail) {
                            thisitem4 = result[i].ContactEmail;
                        }

                        var agencyNameToPass = processJsonData.processPassedItem('Out', result[i].FriendlyName);

                        displayText += "<li style=\"display:none;\">" + result[i].AgencyName + "|" + agencyLandingPage + "?item=" + agencyNameToPass + "|" + result[i].FriendlyName + "|" + thisitem1 + "|" + thisitem2 + "|" + thisitem3 + "|" + thisitem4 + "</li>";
                    }

                    displayText += "<!-- DONE -->";

                    document.getElementById(idOfDivToFill).innerHTML = displayText;

                }
            }
        }
        loadResults();

    },

    showFeaturedAgencies: function (selectedAgency1, selectedAgency2, selectedAgency3, selectedAgency4, lang, agencyLandingPage) {

        if (lang === "") { lang = "en"; }

        var selectedAgencies = [selectedAgency1, selectedAgency2, selectedAgency3, selectedAgency4];
        var idBuilder = "";
        var itemNumber = 0;

        for (var i = 0; i < selectedAgencies.length; i++) {
            var currentAgencyId = selectedAgencies[i];
            if (currentAgencyId > 0) {
                itemNumber = itemNumber + 1;
                idBuilder = "agencyTile" + itemNumber;
                processJsonData.populateFeaturedAgency(selectedAgencies[i], itemNumber, idBuilder, lang, agencyLandingPage);
            }
        }
    },

    populateFeaturedAgency: function (selectedAgency, currentCountItem, selectedServiceLocation, lang, agencyLandingPage) {

        var builtApiUrl = "";
        switch (currentCountItem) {
            case 1:
                builtApiUrl = apiLocation + "api/Agencies/GetAgencyById/" + selectedAgency + "/" + lang;
                var getApiRequest = new XMLHttpRequest();
                getApiRequest.open("GET", builtApiUrl, true);
                getApiRequest.onreadystatechange = function () {
                    if (this.readyState === 4 && this.status === 200) {
                        var result1 = JSON.parse(this.responseText);
                        document.getElementById(selectedServiceLocation).innerHTML = processJsonData.buildAgencyCard(result1.AgencyId, result1.LogoUrl, result1.FriendlyName, result1.AgencyName, result1.Acronym, result1.WebsiteURL, result1.Description, result1.ContactPhone, result1.HearingImpairedPhone, result1.FaxNumber, result1.PhoneHours, result1.ContactURL, result1.TwitterAccount, result1.Facebook, result1.YouTube, result1.ContactEmail, result1.LivechatLink, lang, agencyLandingPage);
                    }
                };
                getApiRequest.setRequestHeader('Content-Type', 'application/json');
                getApiRequest.withCredentials = false;
                getApiRequest.send();
                break;
            case 2:
                builtApiUrl = apiLocation + "api/Agencies/GetAgencyById/" + selectedAgency + "/" + lang;
                var getApiRequest2 = new XMLHttpRequest();
                getApiRequest2.open("GET", builtApiUrl, true);
                getApiRequest2.onreadystatechange = function () {
                    if (this.readyState === 4 && this.status === 200) {
                        var result2 = JSON.parse(this.responseText);
                        document.getElementById(selectedServiceLocation).innerHTML = processJsonData.buildAgencyCard(result2.AgencyId, result2.LogoUrl, result2.FriendlyName, result2.AgencyName, result2.Acronym, result2.WebsiteURL, result2.Description, result2.ContactPhone, result2.HearingImpairedPhone, result2.FaxNumber, result2.PhoneHours, result2.ContactURL, result2.TwitterAccount, result2.Facebook, result2.YouTube, result2.ContactEmail, result2.LivechatLink, lang, agencyLandingPage);
                    }
                };
                getApiRequest2.setRequestHeader('Content-Type', 'application/json');
                getApiRequest2.withCredentials = false;
                getApiRequest2.send();
                break;
            case 3:
                builtApiUrl = apiLocation + "api/Agencies/GetAgencyById/" + selectedAgency + "/" + lang;
                var getApiRequest3 = new XMLHttpRequest();
                getApiRequest3.open("GET", builtApiUrl, true);
                getApiRequest3.onreadystatechange = function () {
                    if (this.readyState === 4 && this.status === 200) {
                        var result3 = JSON.parse(this.responseText);
                        document.getElementById(selectedServiceLocation).innerHTML = processJsonData.buildAgencyCard(result3.AgencyId, result3.LogoUrl, result3.FriendlyName, result3.AgencyName, result3.Acronym, result3.WebsiteURL, result3.Description, result3.ContactPhone, result3.HearingImpairedPhone, result3.FaxNumber, result3.PhoneHours, result3.ContactURL, result3.TwitterAccount, result3.Facebook, result3.YouTube, result3.ContactEmail, result3.LivechatLink, lang, agencyLandingPage);
                    }
                };
                getApiRequest3.setRequestHeader('Content-Type', 'application/json');
                getApiRequest3.withCredentials = false;
                getApiRequest3.send();
                break;
            default:
                builtApiUrl = apiLocation + "api/Agencies/GetAgencyById/" + selectedAgency + "/" + lang;
                var getApiRequestd = new XMLHttpRequest();
                getApiRequestd.open("GET", builtApiUrl, true);
                getApiRequestd.onreadystatechange = function () {
                    if (this.readyState === 4 && this.status === 200) {
                        var resultd = JSON.parse(this.responseText);
                        document.getElementById(selectedServiceLocation).innerHTML = processJsonData.buildAgencyCard(resultd.AgencyId, resultd.LogoUrl, resultd.FriendlyName, resultd.AgencyName, resultd.Acronym, resultd.WebsiteURL, resultd.Description, resultd.ContactPhone, resultd.HearingImpairedPhone, resultd.FaxNumber, resultd.PhoneHours, resultd.ContactURL, resultd.TwitterAccount, resultd.Facebook, resultd.YouTube, resultd.ContactEmail, resultd.LivechatLink, lang, agencyLandingPage);
                    }
                };
                getApiRequestd.setRequestHeader('Content-Type', 'application/json');
                getApiRequestd.withCredentials = false;
                getApiRequestd.send();
        }
    },

    //####################################################################################################
    //    Search Functions
    //####################################################################################################

    //--- Show Service Cards Based On Search Term, Sort Order, Number Of Cards Per Page, & Page Selected -
    showServicesList: function (searchTerm, previousSearchTermHolder, pageOfData, pageSize, sortDirection, idOfDivToFill, idOfResultDivToFill, idofTopPageDivToFill, idofBottomPageDivToFill, lang, serviceLandingPage, agencyLandingPage) {

        var currentResults = document.getElementById(idOfResultDivToFill).innerHTML;

        if (lang === "") { lang = "en"; }

        var data = JSON.stringify({
            "lang": lang,
            "name": searchTerm,
            "agencyTypeIds": [
                null
            ],
            "agencyTagIds": [
                null
            ],
            "page": pageOfData,
            "pageSize": pageSize,
            "sortDirection": sortDirection
        });

        var builtApiUrl = apiLocation + "api/Services/Query";
        var loadFlag = false;
        var loadCount = 0;
        var halfOfTheCards = "";
        var otherHalfOfTheCards = "";
        var displayText = "";
        var displayablePaginationBar = "";

        var resultInfoText = "No service results returned for \"" + searchTerm + "\"";
        document.getElementById(idOfDivToFill).innerHTML = displayText;

        function loadResults() {
            if (loadCount === 0) {
                serviceSearchResults = [];
                var putApiRequest = new XMLHttpRequest();
                putApiRequest.open("POST", builtApiUrl, true);
                putApiRequest.onreadystatechange = function () {
                    if (this.readyState === 4 && this.status === 200) {
                        serviceSearchResults.push(this.responseText);
                        document.getElementById(previousSearchTermHolder).innerHTML = searchTerm;
                    }
                    if (this.readyState === 4 && this.status === 404) {
                        serviceSearchResults.push("NONEXISTS");
                    }
                };
                putApiRequest.setRequestHeader('Content-Type', 'application/json');
                putApiRequest.withCredentials = false;
                putApiRequest.send(data);
            }
            loadCount += 1;
            if (loadFlag === false) {
                if (typeof serviceSearchResults[0] !== "undefined") {
                    if (serviceSearchResults[0].length > 10) {
                        loadFlag = true;
                    }
                }
                if (loadCount >= 50) {
                    loadFlag = true;
                }
                window.setTimeout(loadResults, 100); /* this checks the flag every 100 milliseconds*/
            }
            else {
                if (loadCount < 50) {

                    if (typeof serviceSearchResults[0] !== "undefined") {
                        theResults = JSON.parse(serviceSearchResults[0]);
                        this.apiData = theResults.Results;
                        var totalCount = theResults.TotalCount;
                        var currentPage = theResults.Page;
                        var pageSize = theResults.PageSize;
                        var arrayLength = this.apiData.length;

                        if (totalCount > 0) {
                            if (totalCount < 2) {
                                resultInfoText = "<span aria-label=\"Displaying only service search result for \"" + searchTerm + "\"\">Displaying only service result for \"" + searchTerm + "\"</span>";
                            }
                            else {
                                if (totalCount < pageSize) {
                                    currentPage = 0;
                                }

                                var lowerNumber = currentPage * pageSize + 1;
                                var upperNumber = currentPage * pageSize + pageSize;

                                displayablePaginationBar += "<div class=\"table\">";
                                displayablePaginationBar += "<span style=\"text-align:center;\">";
                                displayablePaginationBar += "<div class=\"tr\">";


                                if (currentPage > 0) {
                                    displayablePaginationBar += "<a aria-label=\"Go to Previous Page of Service Search Results\"  style=\"text-decoration: none!important;\" href=\"javascript:switchToServicePage('" + (currentPage - 1) + "');\"><div class=\"td\"> << Previous</div></a>";
                                }

                                for (var p = 0; p < totalCount / pageSize; p++) {
                                    if (p === currentPage) {
                                        displayablePaginationBar += "<a aria-label=\"You are currently on Services Search Result Page " + (p + 1) + " of " + Math.ceil(totalCount / pageSize) + " Pages\" style=\"text-decoration: none!important;\" href=\"javascript:switchToServicePage('" + p + "');\"><div class=\"td\" style=\"color: #fff; background-color: #046B99; cursor: default;\">&nbsp;" + (p + 1) + "&nbsp;</div></a>";
                                    }
                                    else {
                                        displayablePaginationBar += "<a aria-label=\"Switch to Result Page " + (p + 1) + " of " + Math.ceil(totalCount / pageSize) + " Pages\" style=\"text-decoration: none!important;\" href=\"javascript:switchToServicePage('" + p + "');\"><div class=\"td\">&nbsp;" + (p + 1) + "&nbsp;</div></a>";
                                    }
                                }

                                if (upperNumber < totalCount) {
                                    displayablePaginationBar += "<a aria-label=\"Go to Next Page of Search Results\" style=\"text-decoration: none!important;\" href=\"javascript:switchToServicePage('" + (currentPage + 1) + "');\"><div class=\"td\">Next >> </div></a>";
                                }

                                displayablePaginationBar += "</div></span>";
                                displayablePaginationBar += "</div>";

                                if (upperNumber > totalCount) {
                                    upperNumber = totalCount;
                                }

                                resultInfoText = "<span aria-label=\"Displaying results " + lowerNumber + " through " + upperNumber + " of " + totalCount + " total service search results\">Displaying results " + lowerNumber + " - " + upperNumber + " of " + totalCount + " total results</span>";

                                if (searchTerm.length !== 0) {
                                    resultInfoText += " for \"" + searchTerm + "\"";
                                }
                            }

                            for (var i = 0; i < arrayLength; i++) {
                                if (i & 1) {
                                    halfOfTheCards += processJsonData.buildServiceCard(this.apiData[i].ServiceId, this.apiData[i].ImageUrl, this.apiData[i].FriendlyName, this.apiData[i].Acronym, this.apiData[i].ServiceName, this.apiData[i].ServiceUrl, this.apiData[i].Description, this.apiData[i].ContactPhone, lang, serviceLandingPage, agencyLandingPage);
                                }
                                else {
                                    otherHalfOfTheCards += processJsonData.buildServiceCard(this.apiData[i].ServiceId, this.apiData[i].ImageUrl, this.apiData[i].FriendlyName, this.apiData[i].Acronym, this.apiData[i].ServiceName, this.apiData[i].ServiceUrl, this.apiData[i].Description, this.apiData[i].ContactPhone, lang, serviceLandingPage, agencyLandingPage);
                                }
                            }

                            displayText += "<div class=\"row\">";
                            displayText += "<div class=\"half\">";
                            displayText += otherHalfOfTheCards;
                            displayText += "</div>";
                            displayText += "<div class=\"half\">";
                            displayText += halfOfTheCards;
                            displayText += "</div>";
                            displayText += "</div>";
                        }
                        else {
                            resultInfoText = "<span aria-label=\"No service results found for \"" + searchTerm + "\"\">No service results found for \"" + searchTerm + "\"</span>";
                            displayablePaginationBar = "";
                        }

                        if (currentResults !== displayText) {
                            document.getElementById(idOfDivToFill).innerHTML = displayText;
                            document.getElementById(idOfResultDivToFill).innerHTML = resultInfoText;
                            document.getElementById(idofTopPageDivToFill).innerHTML = displayablePaginationBar;
                            document.getElementById(idofBottomPageDivToFill).innerHTML = displayablePaginationBar;
                        }
                    }
                    else {
                        resultInfoText = "<span aria-label=\"No service results found for \"" + searchTerm + "\"\">No service results found for \"" + searchTerm + "\"</span>";
                        document.getElementById(idOfDivToFill).innerHTML = displayText;
                        document.getElementById(idOfResultDivToFill).innerHTML = resultInfoText;
                        document.getElementById(idofTopPageDivToFill).innerHTML = displayablePaginationBar;
                        document.getElementById(idofBottomPageDivToFill).innerHTML = displayablePaginationBar;
                    }
                }
                else {
                    resultInfoText = "<span aria-label=\"No service results found for \"" + searchTerm + "\"\">No service results found for \"" + searchTerm + "\"</span>";
                    document.getElementById(idOfDivToFill).innerHTML = displayText;
                    document.getElementById(idOfResultDivToFill).innerHTML = resultInfoText;
                    document.getElementById(idofTopPageDivToFill).innerHTML = displayablePaginationBar;
                    document.getElementById(idofBottomPageDivToFill).innerHTML = displayablePaginationBar;
                }
            }
        }
        loadResults();
    },

    //--- Show Agency Cards Based On Search Term, Sort Order, Number Of Cards Per Page, & Page Selected --
    showAgenciesList: function (searchTerm, previousSearchTermHolder, pageOfData, pageSize, sortDirection, idOfDivToFill, idOfResultDivToFill, idofTopPageDivToFill, idofBottomPageDivToFill, lang, agencyLandingPage) {

        var currentResults = document.getElementById(idOfResultDivToFill).innerHTML;

        if (lang === "") { lang = "en"; }

        var data = JSON.stringify({
            "lang": lang,
            "name": searchTerm,
            "agencyTypeIds": [
                null
            ],
            "agencyTagIds": [
                null
            ],
            "page": pageOfData,
            "pageSize": pageSize,
            "sortDirection": sortDirection
        });

        var builtApiUrl = apiLocation + "api/Agencies/Query";
        var loadFlag = false;
        var loadCount = 0;

        var halfOfTheCards = "";
        var otherHalfOfTheCards = "";
        var displayText = "";
        var resultInfoText = "";
        var displayablePaginationBar = "";


        function loadResults() {
            if (loadCount === 0) {
                agencySearchResults = [];
                var putApiRequest = new XMLHttpRequest();
                putApiRequest.open("POST", builtApiUrl, true);
                putApiRequest.onreadystatechange = function () {
                    if (this.readyState === 4 && this.status === 200) {
                        agencySearchResults.push(this.responseText);
                        document.getElementById(previousSearchTermHolder).innerHTML = searchTerm;
                    }
                    if (this.readyState === 4 && this.status === 404) {
                        agencySearchResults.push("NONEXISTS");
                    }
                };
                putApiRequest.setRequestHeader('Content-Type', 'application/json');
                putApiRequest.withCredentials = false;
                putApiRequest.send(data);
            }
            loadCount += 1;
            if (loadFlag === false) {
                if (typeof agencySearchResults[0] !== "undefined") {
                    if (agencySearchResults[0].length > 10) {
                        loadFlag = true;
                    }
                }
                if (loadCount >= 50) {
                    loadFlag = true;
                }
                window.setTimeout(loadResults, 100); /* this checks the flag every 100 milliseconds*/
            }
            else {
                if (loadCount < 50) {

                    if (typeof agencySearchResults[0] !== "undefined") {
                        theResults = JSON.parse(agencySearchResults[0]);
                        this.apiData = theResults.Results;
                        var totalCount = theResults.TotalCount;
                        var currentPage = theResults.Page;
                        var pageSize = theResults.PageSize;
                        var arrayLength = this.apiData.length;

                        if (totalCount > 0) {
                            if (totalCount < 2) {
                                resultInfoText = "<span aria-label=\"Displaying only agency search result for \"" + searchTerm + "\"\">Displaying only agency result for \"" + searchTerm + "\"</span>";
                                resultInfoText = "";
                            }
                            else {
                                if (totalCount < pageSize) {
                                    currentPage = 0;
                                }

                                var lowerNumber = currentPage * pageSize + 1;
                                var upperNumber = currentPage * pageSize + pageSize;

                                displayablePaginationBar += "<div class=\"table\">";
                                displayablePaginationBar += "<span style=\"text-align:center;\">";
                                displayablePaginationBar += "<div class=\"tr\">";

                                if (currentPage > 0) {
                                    displayablePaginationBar += "<a aria-label=\"Go to Previous Page of Agency Search Results\"  style=\"text-decoration: none!important;\" href=\"javascript:switchToAgencyPage('" + (currentPage - 1) + "');\"><div class=\"td\"> << Previous</div></a>";
                                }

                                for (var p = 0; p < totalCount / pageSize; p++) {
                                    if (p === currentPage) {
                                        displayablePaginationBar += "<a aria-label=\"You are currently on Agency Search Result Page " + (p + 1) + " of " + Math.ceil(totalCount / pageSize) + " Pages\" style=\"text-decoration: none!important;\" href=\"javascript:switchToAgencyPage('" + p + "');\"><div class=\"td\" style=\"color: #fff; background-color: #046B99; cursor: default;\">&nbsp;" + (p + 1) + "&nbsp;</div></a>";
                                    }
                                    else {
                                        displayablePaginationBar += "<a aria-label=\"Switch to Agency Result Page " + (p + 1) + " of " + Math.ceil(totalCount / pageSize) + " Pages\" style=\"text-decoration: none!important;\" href=\"javascript:switchToAgencyPage('" + p + "');\"><div class=\"td\">&nbsp;" + (p + 1) + "&nbsp;</div></a>";
                                    }
                                }

                                if (upperNumber < totalCount) {
                                    displayablePaginationBar += "<a aria-label=\"Go to Next Page of Agency Search Results\" style=\"text-decoration: none!important;\" href=\"javascript:switchToAgencyPage('" + (currentPage + 1) + "');\"><div class=\"td\">Next >> </div></a>";
                                }

                                displayablePaginationBar += "</div></span>";
                                displayablePaginationBar += "</div>";

                                if (upperNumber > totalCount) {
                                    upperNumber = totalCount;
                                }
                                resultInfoText = "<span aria-label=\"Displaying results " + lowerNumber + " through " + upperNumber + " of " + totalCount + " total agency search results\">Displaying results " + lowerNumber + " - " + upperNumber + " of " + totalCount + " total results</span>";

                                if (searchTerm.length !== 0) {
                                    resultInfoText += " for \"" + searchTerm + "\"";
                                }
                            }

                            for (var i = 0; i < arrayLength; i++) {
                                if (i & 1) {
                                    halfOfTheCards += processJsonData.buildAgencyCard(apiData[i].AgencyId, apiData[i].LogoUrl, apiData[i].FriendlyName, apiData[i].AgencyName, apiData[i].Acronym, apiData[i].WebsiteURL, apiData[i].Description, apiData[i].ContactPhone, apiData[i].HearingImpairedPhone, apiData[i].FaxNumber, apiData[i].PhoneHours, apiData[i].ContactURL, apiData[i].TwitterAccount, apiData[i].Facebook, apiData[i].YouTube, apiData[i].ContactEmail, apiData[i].LivechatLink, lang, agencyLandingPage);
                                }
                                else {
                                    otherHalfOfTheCards += processJsonData.buildAgencyCard(apiData[i].AgencyId, apiData[i].LogoUrl, apiData[i].FriendlyName, apiData[i].AgencyName, apiData[i].Acronym, apiData[i].WebsiteURL, apiData[i].Description, apiData[i].ContactPhone, apiData[i].HearingImpairedPhone, apiData[i].FaxNumber, apiData[i].PhoneHours, apiData[i].ContactURL, apiData[i].TwitterAccount, apiData[i].Facebook, apiData[i].YouTube, apiData[i].ContactEmail, apiData[i].LivechatLink, lang, agencyLandingPage);
                                }
                            }

                            displayText += "<div class=\"row\">";
                            displayText += "<div class=\"half\">";
                            displayText += otherHalfOfTheCards;
                            displayText += "</div>";
                            displayText += "<div class=\"half\">";
                            displayText += halfOfTheCards;
                            displayText += "</div>";
                            displayText += "</div>";
                        }
                        else {
                            resultInfoText = "<span aria-label=\"No agency results found for \"" + searchTerm + "\"\">No agency results found for \"" + searchTerm + "\"</span>";
                            displayablePaginationBar = "";
                        }

                        if (currentResults !== displayText) {
                            document.getElementById(idOfDivToFill).innerHTML = displayText;
                            document.getElementById(idOfResultDivToFill).innerHTML = resultInfoText;
                            document.getElementById(idofTopPageDivToFill).innerHTML = displayablePaginationBar;
                            document.getElementById(idofBottomPageDivToFill).innerHTML = displayablePaginationBar;
                        }
                    }
                    else {
                        resultInfoText = "<span aria-label=\"No agency results found for \"" + searchTerm + "\"\">No agency results found for \"" + searchTerm + "\"</span>";
                        document.getElementById(idOfDivToFill).innerHTML = displayText;
                        document.getElementById(idOfResultDivToFill).innerHTML = resultInfoText;
                        document.getElementById(idofTopPageDivToFill).innerHTML = displayablePaginationBar;
                        document.getElementById(idofBottomPageDivToFill).innerHTML = displayablePaginationBar;
                    }
                }
                else {
                    resultInfoText = "<span aria-label=\"No agency results found for \"" + searchTerm + "\"\">No agency results found for \"" + searchTerm + "\"</span>";
                    document.getElementById(idOfDivToFill).innerHTML = displayText;
                    document.getElementById(idOfResultDivToFill).innerHTML = resultInfoText;
                    document.getElementById(idofTopPageDivToFill).innerHTML = displayablePaginationBar;
                    document.getElementById(idofBottomPageDivToFill).innerHTML = displayablePaginationBar;
                }
            }
        }
        loadResults();
    },

    //####################################################################################################
    //    Sitemap Functions
    //####################################################################################################

    //--- Populate Sitemap Agencies ----------------------------------------------------------------------
    showSiteMap: function (idOfDivToFill, lang, serviceLandingPage, agencyLandingPage) {

        if (lang === "") { lang = "en"; }

        var builtApiUrl = apiLocation + "api/Agencies/Get?page=0&pageSize=0&lang=" + lang;

        var loadFlag = false;
        var loadCount = 0;

        function loadResults() {
            if (loadCount === 0) {
                var putApiRequest = new XMLHttpRequest();
                putApiRequest.open("POST", builtApiUrl, true);
                putApiRequest.onreadystatechange = function () {
                    if (this.readyState === 4 && this.status === 200) {
                        alphaListingResults.push(this.responseText);
                    }
                    if (this.readyState === 4 && this.status === 404) {
                        alphaListingResults.push("NONEXISTS");
                    }
                };
                putApiRequest.setRequestHeader('Content-Type', 'application/json');
                putApiRequest.withCredentials = false;
                putApiRequest.send(null);
            }
            loadCount += 1;
            if (loadFlag === false) {
                if (typeof alphaListingResults[0] !== "undefined") {
                    if (alphaListingResults[0].length > 10) {
                        loadFlag = true;
                    }
                }
                if (loadCount >= 50) {
                    loadFlag = true;
                }
                window.setTimeout(loadResults, 100); /* this checks the flag every 100 milliseconds*/
            }
            else {
                if (loadCount < 50) {
                    var result = JSON.parse(alphaListingResults[0]).Data;
                    var arrayLength = result.length;
                    var columnOneEnd = Math.floor(arrayLength / 3);
                    var columnTwoEnd = columnOneEnd + columnOneEnd;

                    var displayText = "";

                    displayText += "<div class=\"third\">";
                    displayText += "    <ul class=\"list-standout\">";

                    for (var i = 0; i < arrayLength; i++) {
                        var agencyNameToPass = processJsonData.processPassedItem('Out', result[i].FriendlyName);
                        displayText += "<li><a aria-label=\"View Agency Details for " + result[i].FriendlyName + "\" href=\"" + agencyLandingPage + "?item=" + agencyNameToPass + "\">" + result[i].FriendlyName + "</a><span style=\"padding: 0px, margin: 0px;\" id=\"serviceHolder" + result[i].AgencyId + "\"></span></li>";

                        sitemapAgencyListForServices.push(result[i].AgencyId);

                        if (i === columnOneEnd || i === columnTwoEnd) {
                            displayText += "    </ul>";
                            displayText += "</div>";
                            displayText += "<div class=\"third\">";
                            displayText += "    <ul class=\"list-standout\" style=\"color: #000000\">";
                        }
                    }

                    displayText += "    </ul>";
                    displayText += "</div>";

                    document.getElementById(idOfDivToFill).innerHTML = displayText;

                    for (var l = 0; l < sitemapAgencyListForServices.length; l++) {
                        var currentServiceId = sitemapAgencyListForServices[l];
                        processJsonData.showSiteMapServices(currentServiceId, serviceLandingPage, lang);
                    }

                }
            }
        }
        loadResults();
    },

    //--- Populate Sitemap Services For Each Sitemap Agency ----------------------------------------------
    showSiteMapServices: function (searchvalue, serviceLandingPage, lang) {

        var data = JSON.stringify([
            searchvalue
        ]);

        if (lang === "") { lang = "en"; }
        var builtApiUrl = apiLocation + "api/Services/GetServicesByAgencyIds?lang=" + lang;

        var putApiRequest = new XMLHttpRequest();
        putApiRequest.open("POST", builtApiUrl, true);
        putApiRequest.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                if (this.responseText.length > 10) {

                    var dataToProcess = JSON.parse(this.responseText);

                    var arrayLength = dataToProcess.length;

                    displayText = "<ul style=\"margin-bottom: 0px;padding-bottom: 5px; list-style-type: circle;\">";

                    for (var i = 0; i < arrayLength; i++) {
                        var serviceNameToPass = processJsonData.processPassedItem('Out', dataToProcess[i].ServiceName);
                        displayText += "<li><a aria-label=\"View Service Details for " + dataToProcess[i].ServiceName + " ( This is a service provided by " + dataToProcess[i].FriendlyName + " ) \" href=\"" + serviceLandingPage + "?item=" + serviceNameToPass + "\">" + dataToProcess[i].ServiceName + "</a></li>";
                    }
                    displayText += "</ul>";
                    var divIdBuilder = "serviceHolder" + searchvalue;
                    document.getElementById(divIdBuilder).innerHTML = displayText;
                }

            }
            if (this.readyState === 4 && this.status === 404) {
                agencyServices = "NONEXISTS";
            }
        };
        putApiRequest.setRequestHeader('Content-Type', 'application/json');
        putApiRequest.withCredentials = false;
        putApiRequest.send(data);
    }

};