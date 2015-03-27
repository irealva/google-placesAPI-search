(function() {

    /**
     * ViewModel associated to the YouTube player section
     */
    var ResultsViewModel = function() {
        var self = this;
        this.map;
        this.infowindow;
        this.service;

        this.userSearch = ko.observable(); // Input by user in the search bar
        this.placesResultsList = ko.observableArray([]); // {marker, header, description}
        var markers = [];

        //Initial settings for example
        this.initialRequest = "Coffee near San Francisco";
        this.initialLat = 37.7577;
        this.initialLng = -122.4376;

        /**
         * Timeout function in case Google Maps doesn't load
         */
        this.mapTimeout = setTimeout(function() {
            $('#map-canvas').html('Problem loading Google Maps. Please refresh your browser and try again.');
        }, 6000);

        this.initializeMap = function() {
            var mapOptions = {
                center: new google.maps.LatLng(self.initialLat, self.initialLng),
                zoom: 10
            };
            self.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
            clearTimeout(self.mapTimeout);

            self.infowindow = new google.maps.InfoWindow();

            //Initial example request
            self.userSearch(self.initialRequest);
            self.searchLocation();
            //

        }.bind(this);

        // https://developers.google.com/maps/documentation/javascript/places-autocomplete
        this.searchLocation = function() {
            self.service = new google.maps.places.AutocompleteService();
            console.log("calling the service");
            self.service.getPlacePredictions({
                input: self.userSearch()
            }, self.callback);
        }.bind(this);

        this.removeMarkers = function() {
            for (var i = 0; i < markers.length; i++) {
                markers[i].setMap(null);
            }

            markers = [];
            self.placesResultsList.removeAll();
        }.bind(this);

        this.callback = function(results, status) {
            //console.log(status) ;
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                console.log(results);
                self.removeMarkers() // Removes the markers from the map,
                var bounds = new google.maps.LatLngBounds();

                var service2 = new google.maps.places.PlacesService(self.map);

                for (var i = 0; i < results.length; i++) {

                    var request = {
                        placeId: results[i].place_id
                    }

                    service2.getDetails(request, function(place, status) {
                        if (status == google.maps.places.PlacesServiceStatus.OK) {
                            var marker = new google.maps.Marker({
                                map: self.map,
                                position: place.geometry.location,
                                animation: google.maps.Animation.DROP
                            });

                            //console.log(self.getHeaderString(place)) ;
                            //console.log(self.getDescriptionString(place)) ;

                            self.placesResultsList.push({
                                marker: marker,
                                header: self.getHeaderString(place),
                                description: self.getDescriptionString(place)
                            });

                            markers.push(marker);

                            bounds.extend(marker.position);

                            if (markers.length == results.length) {
                                console.log("complete");
                                self.map.fitBounds(bounds);
                            }

                            google.maps.event.addListener(marker, 'click', function() {
                                self.infowindow.setContent(place.name);
                                self.infowindow.open(self.map, this);
                            });
                        }
                    });

                    console.log(results[i].place_id);
                }
            }
        }.bind(this);


        this.getHeaderString = function(place) {
            var string = place.name ;
            return string ;
        }.bind(this);

        this.getDescriptionString = function(place) {
            var address = place.formatted_address ;
            var phone_number = place.formatted_phone_number ;
            var closed = place.permanently_closed;
            var website = place.website ;

            var string = address + " = " + phone_number + " = " + closed + " = " + website ;

            //console.log(place) ;
            //console.log(string) ;
            //return string;
            return string ;

        }.bind(this);

        google.maps.event.addDomListener(window, 'load', this.initializeMap);
    };


    ko.applyBindings(new ResultsViewModel());

    //var resultsViewModel = new ResultsViewModel();
    //var mapViewModel = new MapViewModel();
    //ko.applyBindings(resultsViewModel, $('#playerContainer')[0]); //Apply our bindings to the player container
    //ko.applyBindings(mapViewModel, $('#topVideos')[0]); //Apply our bindings to the top ten video section

}());
