/** 
 * app.js
 * Single page app to display the results of a query to the Google Places API
 * @author Irene Alvarado
 */

(function() {

    /**
     * ViewModel the application
     */
    var ResultsViewModel = function() {
        var self = this;
        this.map;
        this.infowindow;

        this.userSearch = ko.observable(); // Input by user in the search bar
        this.placeholder = ko.observable(); //Placeholder text in the search bar
        this.placesResultsList = ko.observableArray([]); // will contain search result objects of type { marker, header, description}

        //Initial settings to show as an example when page renders for the first time
        this.initialRequest = "Coffee near San Francisco";
        this.initialLat = 37.7577;
        this.initialLng = -122.4376;

        /**
         * Timeout function in case Google Maps doesn't load
         */
        this.mapTimeout = setTimeout(function() {
            $('#map-canvas').html('Problem loading Google Maps. Please refresh your browser and try again.');
        }, 6000);


        /**
         * Initialize google maps and perform an example search request
         */
        this.initializeMap = function() {
            var mapOptions = {
                center: new google.maps.LatLng(self.initialLat, self.initialLng),
                zoom: 10
            };
            self.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
            clearTimeout(self.mapTimeout); // clear the timeout if the map loads

            self.infowindow = new google.maps.InfoWindow();

            // Placeholder text in search bar
            self.placeholder("Search for a place") ; 

            //Initial example request
            self.userSearch(self.initialRequest);
            self.searchLocation();
        }.bind(this);

        /**
         * Perform a search request to the Places API using Google's Autocomplete service
         * https://developers.google.com/maps/documentation/javascript/places-autocomplete
         */
        this.searchLocation = function() {
            var service = new google.maps.places.AutocompleteService();

            service.getPlacePredictions({
                input: self.userSearch()
            }, self.callback);
        }.bind(this);

        /**
         * Remove Google Map markers when a user performs a new search request
         */
        this.removeMarkers = function() {
            ko.utils.arrayForEach(self.placesResultsList(), function(item) { // Search through the array containing our search results
                item.marker.setMap(null);
            });

            self.placesResultsList.removeAll();
        }.bind(this);

        /**
         * Callback function for getPlacePredictions() Google Places API call. 
         * @param {object} results JSON object containing the results from the API call
         * @param {string} status Status message for the API call
         */
        this.callback = function(results, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {

                self.removeMarkers() // Removes the markers from the map,

                var bounds = new google.maps.LatLngBounds(); // Sets the map bounds
                var service = new google.maps.places.PlacesService(self.map);

                // Iterate through each location in the 'results' object and call the PlaceService() function to get 
                // detailed information about a location
                for (var i = 0; i < results.length; i++) {
                    var request = {
                        placeId: results[i].place_id
                    }

                    //Get detailed information about a location by making another API call to the Google Places API
                    service.getDetails(request, function(place, status) {
                        if (status == google.maps.places.PlacesServiceStatus.OK) {
                            var marker = new google.maps.Marker({
                                map: self.map,
                                position: place.geometry.location,
                                animation: google.maps.Animation.DROP
                            }); //Create a marker for the new location

                            self.placesResultsList.push({
                                marker: marker,
                                html: self.getDescriptionString(place)
                            }); //Add the marker and description of the location to our results list

                            bounds.extend(marker.position); // Extend the map bounds to include the new location

                            if (self.placesResultsList().length == results.length) { // Fit the map to the new bounds
                                self.map.fitBounds(bounds);
                            }

                            google.maps.event.addListener(marker, 'click', function() {
                                self.infowindow.setContent(place.name);
                                self.infowindow.open(self.map, this);
                            }); // Add an event listener in case marker is clicked
                        }
                        else {
                            alert("Error obtaining some location details: " + status) ;
                        }
                    });
                }
            }
            else if (status == google.maps.places.PlacesServiceStatus.ZERO_RESULTS) { //If no results back from the Google Places request
                self.placeholder("No results for that search. Try again.") ; 
                self.userSearch("") ;
            }
            else {
                alert("Error loading results from the Google Places Library: " + status) ;
            }
        }.bind(this);

        /**
         * Creates a string with the description of a location
         * @param {object} place JSON object representing a location
         * @return {string} string to display as HTML
         */
        this.getDescriptionString = function(place) {
            var name = place.name;
            var address = place.formatted_address;
            var phone_number = place.formatted_phone_number;
            var closed = place.permanently_closed;
            var website = place.website;

            var description = "<p>" + address + "<br>";

            if (typeof phone_number !== 'undefined') { // Check if the location contains phone or permanently closed information
                description += phone_number + "<br>";

                if (typeof closed !== 'undefined') {
                    description += "Permanently closed: " + closed;
                }
            };

            description += "</p>";

            if (typeof website !== 'undefined') { // Link to a location website
                description += "<a href='" + website + "'>" + website + "</a>";
            }

            var html = {
                header: name,
                description: description,
            }

            return html;

        }.bind(this);

        /**
         * Simulate a marker click if a user clicks on a location header from the list of search results
         * @param {object} clickedItem the location that a user clicked
         */
        this.clickedHeader = function(clickedItem) {
            google.maps.event.trigger(clickedItem.marker, 'click');
        }.bind(this);

        google.maps.event.addDomListener(window, 'load', this.initializeMap);
    };

    ko.applyBindings(new ResultsViewModel()); //Apply knockout bindings
}());
