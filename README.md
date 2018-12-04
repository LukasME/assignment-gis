# General course assignment

Build a map-based application, which lets the user see geo-based data on a map and filter/search through it in a meaningfull way. Specify the details and build it in your language of choice. The application should have 3 components:

1. Custom-styled background map, ideally built with [mapbox](http://mapbox.com). Hard-core mode: you can also serve the map tiles yourself using [mapnik](http://mapnik.org/) or similar tool.
2. Local server with [PostGIS](http://postgis.net/) and an API layer that exposes data in a [geojson format](http://geojson.org/).
3. The user-facing application (web, android, ios, your choice..) which calls the API and lets the user see and navigate in the map and shows the geodata. You can (and should) use existing components, such as the Mapbox SDK, or [Leaflet](http://leafletjs.com/).

## Data sources

- [Open Street Maps](https://www.openstreetmap.org/)

## My project

**Application description**: Tweewieler application aims to help encourage cyclists to go and explore their surroundings. User is able to enter his location with a mouse click on a map. This triggers search for bicycle routes near his or her location. Further functionality includes:
<dl>
  <dt>Search all things bicycle related</dt>
  <dd>
    User can search for bicycle rentals, parkings, repair stations and shops. Search is performed in respect to user current location and radius entered.
  </dd>

  <dt>Search for tourist landmarks and attractions</dt>
  <dd>User is able to pick one from Belgium provinces and show all the landmarks it contains. Landmarks showed may be one of these categories: bunker, castle, fort, memorial, monument, ruins, unspecific attraction, binoculars, viewpoint.</dd>
</dl>

**Data source**: `https://download.geofabrik.de/europe/belgium.html`

**Technologies used**: NodeJS, Leaflet, MapBox, PostgreSQL

**Documentation**:
After opening the application, user is presented with map view and simple controls shown on the picture:

Main view                             |  All things bicycle related
:------------------------------------:|:-----------------------------------------------:
![Tweewieler main screen](main.jpg)   |  ![Searched provinces](all_things_related.jpg)

Province preview                    |  Province searched for landmarks
:----------------------------------:|:-----------------------------------------------:
![Preview province](province.jpg)   |  ![Searched provinces](province-searched.jpg)

Options                    |
:----------------------------------:|
![Options](settings.jpg)   |


**Creating indices to improve performance**: 

```sql
CREATE INDEX point_amenity
  ON planet_osm_point (amenity);
CREATE INDEX point_shop
  ON planet_osm_point (shop)
  WHERE shop = 'bicycle';
```

```sql
CREATE INDEX polygon_boundary
  ON planet_osm_polygon (boundary)
  WHERE boundary = 'administrative';
CREATE INDEX polygon_admin_leve
  ON planet_osm_polygon (admin_level)
  WHERE admin_level = '6';
```

```sql
CREATE INDEX point_historic
  ON planet_osm_point (historic);
CREATE INDEX point_tourism
  ON planet_osm_point (tourism);
```

```sql
CREATE INDEX lines_route
  ON planet_osm_line (route)
  WHERE route = 'bicycle';
```