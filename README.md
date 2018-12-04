# General course assignment

Build a map-based application, which lets the user see geo-based data on a map and filter/search through it in a meaningfull way. Specify the details and build it in your language of choice. The application should have 3 components:

1. Custom-styled background map, ideally built with [mapbox](http://mapbox.com). Hard-core mode: you can also serve the map tiles yourself using [mapnik](http://mapnik.org/) or similar tool.
2. Local server with [PostGIS](http://postgis.net/) and an API layer that exposes data in a [geojson format](http://geojson.org/).
3. The user-facing application (web, android, ios, your choice..) which calls the API and lets the user see and navigate in the map and shows the geodata. You can (and should) use existing components, such as the Mapbox SDK, or [Leaflet](http://leafletjs.com/).

## Data sources

- [Open Street Maps](https://www.openstreetmap.org/)

## My project

**Application description**: Tweewieler application aims to help and encourage cyclists to go and explore their surroundings. It is currently using only Belgium data.

**Data source**: `https://download.geofabrik.de/europe/belgium.html`

**Technologies used**: NodeJS, Leaflet, MapBox, PostgreSQL

**Documentation**:
After opening the application, user is presented with map view and simple controls shown on the picture:
![Tweewieler main screen](main.jpg)

**Creating indices to improve performance**: 

CREATE INDEX point_amenity
  ON planet_osm_point (amenity);
CREATE INDEX point_shop
  ON planet_osm_point (shop)
  WHERE shop = 'bicycle';

CREATE INDEX polygon_boundary
  ON planet_osm_polygon (boundary)
  WHERE boundary = 'administrative';
CREATE INDEX polygon_admin_leve
  ON planet_osm_polygon (admin_level)
  WHERE admin_level = '6';

CREATE INDEX point_historic
  ON planet_osm_point (historic);
CREATE INDEX point_tourism
  ON planet_osm_point (tourism);

CREATE INDEX lines_route
  ON planet_osm_line (route)
  WHERE route = 'bicycle';