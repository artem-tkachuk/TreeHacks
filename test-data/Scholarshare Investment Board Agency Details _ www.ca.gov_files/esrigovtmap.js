	var activeItem = null;
	var activeCity = '';
	var polyRings = null;
	
	require(["esri/Map", "esri/views/MapView", "esri/layers/MapImageLayer","esri/tasks/QueryTask","esri/tasks/support/Query","esri/layers/GraphicsLayer", "esri/geometry/Point", "esri/Graphic", "esri/geometry/Polygon"], 
	
	function (Map, MapView, MapImageLayer, QueryTask, Query, GraphicsLayer, Point, Graphic, Polygon) {
		var map = new Map({
			basemap: "topo"
		});
		
        var resultsLayer = new GraphicsLayer();		  
		  
		window.getCountyData = function(){
			var layer = new MapImageLayer({
				url: "http://services.gis.ca.gov/arcgis/rest/services/Boundaries/Counties_Web/MapServer"
			});
			map.removeAll();
			map.add(layer); 
			var countiesUrl = "http://services.gis.ca.gov/arcgis/rest/services/Boundaries/Counties_Web/MapServer/0/";
			var countyQueryTask = new QueryTask({
				url: countiesUrl
			});
						
			var countyQuery = new Query();
			countyQuery.returnGeometry = false;
			countyQuery.outFields = ["AREA_ID,County,link_href"];
			countyQuery.where = "County <> ''";
		
			countyQueryTask.execute(countyQuery).then(function(results){
				var dataToProcess = results.features;
				var arrayLength = dataToProcess.length;
                if (arrayLength > 1) {
					var countyArray = new Array(arrayLength);
					for (var f = 0; f < arrayLength; f++) {
						  countyArray[f] =  new Array(3);
						  countyArray[f][0] = dataToProcess[f].attributes.AREA_ID;
						  countyArray[f][1] = dataToProcess[f].attributes.County; 
						  countyArray[f][2] = dataToProcess[f].attributes.link_href; 
					}
					
					function sortCounty(a){
						a.sort(sortFunction);
						function sortFunction(a, b) {
							if (a[1] === b[1]) {
								return 0;
							}
							else {
								return (a[1] < b[1]) ? -1 : 1;
							}
						}
						return a;
					}

					var sortedCountyArray = sortCounty(countyArray);
					
					var textToDisplay = "";
					for (var i = 0; i < arrayLength; i++) {
						textToDisplay += "<div class=\"location-list\" onMouseOver=\"this.style.backgroundColor = '#F3F3F3'\" onMouseOut=\"this.style.backgroundColor = '#FFFFFF'\"><a href=\"javascript:Zoom(" + sortedCountyArray[i][0] + ",'','County');\" class=\"location-list-item\">" + sortedCountyArray[i][1] + "</a><span role=\"status\" aria-atomic=\"true\" aria-live=\"polite\"><div class=\"location-details\" id=\"locationItem" + sortedCountyArray[i][0] + "\"><a class=\"btn btn-default btn-xs direction-button\"  href=\"javascript:externalConfirmation('redirectConfirm','" + sortedCountyArray[i][2] + "', 'website-county-" + sortedCountyArray[i][0] + "');\" id=\"website-county-" + sortedCountyArray[i][0] + "\" aria-label=\"Visit " + sortedCountyArray[i][1]  + " County's Website.\" >Visit Website</a></div></span></div>";
					}
					document.getElementById('map_toc').innerHTML = textToDisplay;

				} 
			});
			viewForMaps.zoom = 6;
		} 
				
		
		window.getCityData = function() {
			viewForMaps.graphics.removeAll();
			var layer = new MapImageLayer({
				url: "http://services.gis.ca.gov/arcgis/rest/services/Boundaries/Cities_webtm/MapServer"
			});
			map.removeAll();
			map.add(layer); 
			var citiesURL = "http://services.gis.ca.gov/arcgis/rest/services/Boundaries/Cities_webtm/MapServer/0/";
			var cityQueryTask = new QueryTask({
				url: citiesURL
			});
			var cityQuery = new Query();
			cityQuery.returnGeometry = false;
			cityQuery.outFields = ["OBJECTID,CIty,website_href"];
			cityQuery.where = "CIty <> ''"; 

			cityQueryTask.execute(cityQuery).then(function(results){
				var dataToProcess2 = results.features;
				var arrayLength2 = dataToProcess2.length;
				if (arrayLength2 > 1) {			
					var cityArray = new Array(arrayLength2);
					for (var g = 0; g < arrayLength2; g++) {
						  cityArray[g] = new Array(3);
						  cityArray[g][0] = dataToProcess2[g].attributes.OBJECTID;
						  cityArray[g][1] = dataToProcess2[g].attributes.CIty;
						  cityArray[g][2] = dataToProcess2[g].attributes.website_href; 
					}
										
					function sortCity(a){
						a.sort(sortFunction2);
						function sortFunction2(a, b) {
							if (a[1] === b[1]) {
								return 0;
							}
							else {
								return (a[1] < b[1]) ? -1 : 1;
							}
						}
						return a;
					}

					var sortedCityArray = sortCity(cityArray);

					var textToDisplay2 = "";
					for (var j = 0; j < arrayLength2; j++) {
						textToDisplay2 += "<div class=\"location-list\" onMouseOver=\"this.style.backgroundColor = '#F3F3F3'\" onMouseOut=\"this.style.backgroundColor = '#FFFFFF'\"><a href=\"javascript:Zoom(" + sortedCityArray[j][0] + ",'" + sortedCityArray[j][1] + "','City');\" class=\"location-list-item\">" + sortedCityArray[j][1] + "</a><span role=\"status\" aria-atomic=\"true\" aria-live=\"polite\"><div class=\"location-details\" id=\"locationItem" + sortedCityArray[j][0] + "\"><a class=\"btn btn-default btn-xs direction-button\" href=\"javascript:externalConfirmation('redirectConfirm','" + sortedCityArray[j][2] + "', 'website-city-" + sortedCityArray[j][0] + "');\" id=\"website-city-" + sortedCityArray[j][0] + "\" aria-label=\"Visit the City or Town of " + sortedCityArray[j][1]  + "'s Website.\" >Visit Website</a></div></span></div>";
					}
					document.getElementById('map_toc').innerHTML = textToDisplay2;
				}
			});
			viewForMaps.zoom = 6;
		}
		
		window.showCountyPoly = function() {
			
			var polygon = new Polygon({
			});
			var polyStuff = polyRings.rings[0];
			var polyRingItems = "";
			var arrayLength = polyStuff.length;
			var ptArray = new Array(arrayLength);
			if (arrayLength > 1) {
				for (var f = 0; f < arrayLength; f++) {
				
					var pt = new Point({
						x: polyStuff[f][0],
						y: polyStuff[f][1]
					});
				ptArray[f] = pt;
				}
				polygon.addRing(ptArray);
			}			

			var fillSymbol = {
			  type: "simple-fill", 
			  color: [64, 128, 64, 0.2],
			  outline: {
				color: [0, 0, 0],
				width: 0.25
			  }
			};

			var polygonGraphic = new Graphic({
			  geometry: polygon,
			  symbol: fillSymbol
			});

			viewForMaps.graphics.removeAll();
			viewForMaps.graphics.add(polygonGraphic);
		}
		
		
		window.showCityPoly = function() {
		
		
			var findOneCityUrl = "https://services.gis.ca.gov/arcgis/rest/services/Boundaries/CA_CivicBoundaries/MapServer/1/";
			var findOneCityTask = new QueryTask({
				url: findOneCityUrl
			});
				
			var getOneCityQuery = new Query();
			getOneCityQuery.returnGeometry = true;
			getOneCityQuery.outFields = ["NAME"];
			getOneCityQuery.where = "NAME = '"+ activeCity +"'";
		
			findOneCityTask.execute(getOneCityQuery).then(function(results){
				var polygon = new Polygon({
				});
				
				var polyRings = results.features[0].geometry;
				
				viewForMaps.graphics.removeAll();
				
				var amountOfPolys = polyRings.rings.length;
				console.log("#" + amountOfPolys + "#");
				
				var polysArray = new Array(amountOfPolys);
				if (amountOfPolys > 0) {
					for (var p = 0; p < amountOfPolys; p++) {
				
						var polyStuff = polyRings.rings[p];
						var arrayLength = polyStuff.length;
						var ptArray = new Array(arrayLength);
						if (arrayLength > 1) {
							for (var f = 0; f < arrayLength; f++) {
							
								var pt = new Point({
									x: polyStuff[f][0],
									y: polyStuff[f][1]
								});
							ptArray[f] = pt;
							}
							polygon.addRing(ptArray);
						}			

						var fillSymbol = {
						  type: "simple-fill", 
						  color: [64, 128, 64, 0.05],
						  outline: {
							color: [0, 0, 0],
							width: 0.25
						  }
						};

						polysArray[p] = new Graphic({
						  geometry: polygon,
						  symbol: fillSymbol
						});
						
						viewForMaps.graphics.add(polysArray[p]);
					}
				}
			});
		}		
		
		window.zoomToCounty = function(){
			var findCountyUrl = "http://services.gis.ca.gov/arcgis/rest/services/Boundaries/Counties_Web/MapServer/0/";
			var findCountyTask = new QueryTask({
				url: findCountyUrl
			});
						
			var getOneCountyQuery = new Query();
			getOneCountyQuery.returnGeometry = true;
			getOneCountyQuery.outFields = ["AREA_ID"];
			getOneCountyQuery.where = "AREA_ID = "+ activeItem +"";
		
			findCountyTask.execute(getOneCountyQuery).then(function(results){
				var foundItems = results.features;
				viewForMaps.zoom = 9;
				polyRings = foundItems[0].geometry;
				var pt = new Point({
				  x: foundItems[0].geometry.centroid.longitude,
				  y: foundItems[0].geometry.centroid.latitude
				});
				viewForMaps.center = pt;
				window.showCountyPoly();
			});
		}
		
		window.zoomToCity = function(){
			var findCityUrl = "http://services.gis.ca.gov/arcgis/rest/services/Boundaries/Cities_webtm/MapServer/0/";
			var findCityTask = new QueryTask({
				url: findCityUrl
			});
						
			var getOneCityQuery = new Query();
			getOneCityQuery.returnGeometry = true;
			getOneCityQuery.outFields = ["OBJECTID"];
			getOneCityQuery.where = "OBJECTID = "+ activeItem +"";
		
			findCityTask.execute(getOneCityQuery).then(function(results){
				var foundItems = results.features;
				viewForMaps.zoom = 12;
				var pt = new Point({
				  x: foundItems[0].geometry.longitude,
				  y: foundItems[0].geometry.latitude
				});
				viewForMaps.center = pt;
				window.showCityPoly();
			});		
		}
		
		
		var viewForMaps = new MapView({
			container: "esrimap_canvas",
			map: map,
			zoom: 6,
			center: [-120.500, 37.455],
			constraints: {
				rotationEnabled: false
			},			
			ui: {
				components: ["attribution"]
			}	
		});


		viewForMaps.on("mouse-wheel", function (event) {
			event.stopPropagation();
		});
			
		viewForMaps.on("key-down", function(event) {
			var prohibitedKeys = ["+", "-", "Shift", "_", "="];
			var keyPressed = event.key;
			if (prohibitedKeys.indexOf(keyPressed) !== -1) {
				event.stopPropagation();
			}
		});


		viewForMaps.on("double-click", function(event) {
			event.stopPropagation();
		});

		viewForMaps.on("double-click", ["Control"], function(event) {
			event.stopPropagation();
		});

		viewForMaps.on("drag", function(event) {
			 event.stopPropagation();
		});

		viewForMaps.on("drag", ["Shift"], function(event) {
			event.stopPropagation();
		});

		viewForMaps.on("drag", ["Shift", "Control"], function(event) {
			event.stopPropagation();
		});

		viewForMaps.on("key-down", function(event) {
			var keyPressed = event.key;
			if (keyPressed.slice(0, 5) === "Arrow") {
				event.stopPropagation();
			}
		});	

		setTimeout(function () { disableIt(); }, 4000);
		
		PopulateCounties();
		
	});


	function PopulateCities() {
		window.getCityData();
	}
	
	function PopulateCounties() {
		window.getCountyData();
	}

	function Zoom(itemToShow,nameToGet,whichCityOrCounty) {
	    var textId = itemToShow.toString();
		
		activeItem = textId;

		if (whichCityOrCounty == "County") {
			window.zoomToCounty();
		}
		else {
			activeCity = nameToGet;
			window.zoomToCity();
		}
	
		var x = document.getElementsByClassName("location-details");
		var i;
		for (i = 0; i < x.length; i++) {
			x[i].style.display = "none";
		}
		var itemToTurnOn = "locationItem" + textId;
		document.getElementById(itemToTurnOn).style.display = "block";
	}
	  
	function disableIt() {
		var w = document.getElementsByClassName("esri-interactive");
		w[0].style.cursor = "default";

		var x = document.getElementsByClassName("esri-view-surface");
		x[0].style.cursor = "default";
		x[0].removeAttribute("tabindex");
		x[0].setAttribute("tabindex", "-1");

		var y = document.getElementsByClassName("esri-attribution__sources");
		y[0].removeAttribute("tabindex");
		y[0].setAttribute("tabindex", "-1");

		var z = document.getElementsByClassName("esri-attribution__link");
		z[0].removeAttribute("tabindex");
		z[0].setAttribute("tabindex", "-1");
		z[0].style.cursor = "default";
	}