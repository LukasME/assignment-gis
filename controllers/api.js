const pg = require('pg');
const squel = require('squel').useFlavour('postgres');

exports.getGeoPoints = (req, res) => {
  const results = [];
  let latitude = req.query.latitude;
  let longitude = req.query.longitude;
  let radius = req.query.radius;
  // ? 
  let rental = req.query.rental;
  let repair = req.query.repair;
  let shop = req.query.shop;
  let parking = req.query.parking;

  // Get a Postgres client from the connection pool
  pg.connect({
    host: 'localhost',
    port: 5433,
    database: 'belgium',
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
  }, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }

    whereExpression = squel.expr().and('ST_DistanceSphere(ST_Transform(?::geometry, 4326), ST_Transform(way, 4326)) < ?', 'SRID=4326;POINT(' + longitude + ' ' + latitude + ')' , radius);
    orExpressions = squel.expr();
    if(rental == 'true'){
      orExpressions.or('amenity = \'bicycle_rental\'');
    }
    if(repair == 'true'){
      orExpressions.or('amenity = \'bicycle_repair_station\'');
    }
    if(parking == 'true'){
      orExpressions.or('amenity = \'bicycle_parking\'');
    }
    if(repair == 'true' || rental == 'true'){
      orExpressions.or('amenity = \'bicycle_repair_station;bicycle_rental\'');
    }
    if(shop == 'true'){
      orExpressions.or('shop = \'bicycle\'');
    }
    if(orExpressions.toString() == ''){
      done();
      return res.json(results);
    } else {
      whereExpression.and(orExpressions);
    
      squelQuery = squel.select()
        .field('osm_id', 'id')
        .field('amenity')
        .field('shop')
        .field('covered')
        .field('name')
        .field('operator')
        .field('to_json(tags)', 'tags')
        .field(squel.expr().and('ST_DistanceSphere(ST_Transform(?::geometry, 4326), ST_Transform(way, 4326))', 'SRID=4326;POINT(' + longitude + ' ' + latitude + ')').toString(), 'st_distance')
        .field('ST_AsGeoJSON(ST_Transform(way, 4326), 7)')
        .from('planet_osm_point')
        .where(whereExpression)
        .order('st_distance')

      console.log(squelQuery.toString());  
      const query = client.query(squelQuery.toString());
      // Stream results back one row at a time
      query.on('row', (row) => {
        results.push(row);
      });
      // After all data is returned, close connection and return results
      query.on('end', () => {
        done();
        return res.json(results);
      });
    }
  });
};

exports.getProvinces = (req, res) => {
  const results = [];

  // Get a Postgres client from the connection pool
  pg.connect({
    host: 'localhost',
    port: 5433,
    database: 'belgium',
    user: 'postgres',
    password: 'postgres',
  }, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }

    whereExpression = squel.expr()
    .and('boundary = \'administrative\'')
    .and('admin_level = \'6\'');

    squelQuery = squel.select()
      .field('osm_id', 'id')
      .field('name')
      .field('ST_AsGeoJSON(ST_FlipCoordinates(ST_Transform(way, 4326)))')
      .field('tags')
      .from('planet_osm_polygon')
      .where(whereExpression)
      .order('name')
      .toString();
      
    const query = client.query(squelQuery);
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
};

exports.getPaths = (req, res) => {
  const results = [];
  let latitude = req.query.latitude;
  let longitude = req.query.longitude;

  // Get a Postgres client from the connection pool
  pg.connect({
    host: 'localhost',
    port: 5433,
    database: 'belgium',
    user: 'postgres',
    password: 'postgres',
  }, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }

    whereExpression = squel.expr()
      .and('route = \'bicycle\'')
      .and('ST_Intersects(ST_Buffer(ST_SetSRID(ST_Point(?, ?),4326)::geography, 2000), ST_Transform(way, 4326))', longitude, latitude);

    squelQuery = squel.select()
      .field('osm_id', 'id')
      .field('route')
      .field('surface')
      .field('name')
      .field('ST_AsGeoJSON(ST_FlipCoordinates(ST_Transform(way, 4326)))')
      .field('tags')
      .from('planet_osm_line')
      .where(whereExpression)
      .toString();
    
    console.log(squelQuery);
    const query = client.query(squelQuery);
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
};

exports.getLandmarks = (req, res) => {
  const results = [];
  let provinceId = req.query.provinceId;

  // Get a Postgres client from the connection pool
  pg.connect({
    host: 'localhost',
    port: 5433,
    database: 'belgium',
    user: 'postgres',
    password: 'postgres',
  }, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }

   //tourism viewpoints
    squelQuery = squel.select()
      .field('point.osm_id', 'id')
      .field('point.historic')
      .field('point.tourism')
      .field('point.name')
      .field('to_json(point.tags)', 'tags')
      .field('ST_AsGeoJSON(ST_Transform(point.way, 4326), 7)')
      .field('point.way')
      .from(squel.select()
        .field('*')
        .from('planet_osm_point')
        .where(squel.expr()
          .and('historic IN (\'bunker\', \'castle\', \'fort\', \'memorial\', \'monument\', \'ruins\')')
          .or('tourism IN (\'attraction\', \'binoculars\', \'viewpoint\')')
        )
        , 'point'
      )
      .from(squel.select()
        .field('way')
        .from('planet_osm_polygon')
        .where(squel.expr()
          .and('osm_id = ?', provinceId)
        )
        , 'province'
      )
      .where(squel.expr().and('ST_Contains(province.way, point.way)'))

    console.log(squelQuery.toString());
    const query = client.query(squelQuery.toString());
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
};