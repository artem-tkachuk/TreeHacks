function set_servicesesrimap(map_zoom, centerLat, centerLng, pointsToAdd, MapCanvasId) {

    var thePoints = pointsToAdd.split("^");

    var LatSet = [];

    var LongSet = [];

    var TitleSet = [];

    var IdSet = [];

    var StreetSet = [];

    var CitySet = [];

    var StateSet = [];

    var ZipSet = [];

    var count = 0;



    for (var i = 1; i < thePoints.length; i++) {

        count += 1;

        var LatLongSet = thePoints[i].split("|");

        LongSet[count] = LatLongSet[0];
        LatSet[count] = LatLongSet[1];
        TitleSet[count] = LatLongSet[2];
        IdSet[count] = LatLongSet[3];
        StreetSet[count] = LatLongSet[4];
        CitySet[count] = LatLongSet[5];
        StateSet[count] = LatLongSet[6];
        ZipSet[count] =  LatLongSet[7];

    }



    require([

        "esri/Map",

        "esri/views/MapView",

        "esri/Graphic",

        "esri/geometry/Point",

        "esri/symbols/PictureMarkerSymbol",

//        "esri/PopupTemplate",

        "dojo/domReady!"

    ], function (

        Map, MapView,

//        Graphic, Point, PictureMarkerSymbol, PopupTemplate

        Graphic, Point, PictureMarkerSymbol

    ) {





            var map = new Map({

                basemap: "streets" // Sets Type of Map

            });



                viewForMaps = new MapView({

                center: [centerLng, centerLat],

                container: MapCanvasId,

                map: map,

                zoom: map_zoom,

                constraints: {

                    rotationEnabled: false

                },
				
				ui: {
					components: ["attribution"]
				}	

            });



            viewForMaps.on("mouse-wheel", function (event) {

                // disable mouse wheel scroll zooming on the view

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
				// prevents panning with the arrow keys
				var keyPressed = event.key;
				if (keyPressed.slice(0, 5) === "Arrow") {
					event.stopPropagation();
				}
			});			

            var markerSymbol = new PictureMarkerSymbol({

                height: 33,

                width: 22,

                url: "https://california.azureedge.net/cdt/CAgovPortal/images/Location_Icon.png"

            });

            for (i = 1; i < count + 1; i++) {

                var point = new Point({

                    longitude: LongSet[i],

                    latitude: LatSet[i]
                });



               // var contentText = StreetSet[i] + "<br />" + CitySet[i] + "," + StateSet[i] + " " + ZipSet[i] + "<br /><br />" + "<a style=\"font-weight: normal;color:#0000FF\" href=\"http://maps.google.com/?daddr=" + LatSet[i] + "," + LongSet[i] + "\" target=\"_blank\">Get directions</a>";

                //var contentTitle = "<strong>" + TitleSet[i] + "</strong>";

                /* var template = new PopupTemplate({

                    title: contentTitle,

                    content: contentText

                }); */

                var pointGraphic = new Graphic({

                    geometry: point,

                    symbol: markerSymbol
					
					//,

                    //popupTemplate: template

                });

                pointGraphic.attributes = {
//                    "Title": contentTitle,
//                    "Content": contentText,
                    "Id": IdSet[i]
                };

                viewForMaps.graphics.add(pointGraphic);
            }

			setTimeout(function () { disableIt(); }, 4000);
			
        });



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

function centerIt(id, lat, lng) {
    viewForMaps.center = [lng, lat];
    viewForMaps.zoom = 17;

    var textId = id.toString();
	
	
	var x = document.getElementsByClassName("location-details");
	var i;
	for (i = 0; i < x.length; i++) {
		x[i].style.display = "none";
	}
	var itemToTurnOn = "locationItem" + textId;
	document.getElementById(itemToTurnOn).style.display = "block";
		

    for (var i = 0; i < viewForMaps.graphics.length; i++) {
        var graphic = viewForMaps.graphics.items[i];
        if (graphic.attributes.Id === textId) {
//            var graphic = viewForMaps.graphics[i];
//            var popTemplate = graphic.getEffectivePopupTemplate();

/*            viewForMaps.popup.open({
                // Set the popup's title to the coordinates of the clicked location
                title: graphic.attributes.Title,
                location: graphic.geometry,
                content: graphic.attributes.Content
            });
*/

        }
    }
}