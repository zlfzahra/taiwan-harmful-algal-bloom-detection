// =====================================================
// EXPORT TWO SENTINEL-2 GEOTIFF IMAGES
// High HAB date and Low HAB date
// Using drawn geometry, not stations
// =====================================================


// =============================
// 1. GEOMETRY
// =============================
// Draw your reservoir boundary using the Geometry tool in GEE.
// Make sure the drawn object is named: geometry

Map.centerObject(geometry, 13);
Map.addLayer(geometry, {color: 'yellow'}, 'Export Geometry');


// =============================
// 2. CHOOSE HIGH AND LOW HAB DATES
// =============================
var highHABDate = '2023-08-18';
var lowHABDate  = '2024-01-05';


// =============================
// 3. MAKE SENTINEL-2 COMPOSITE
// =============================
function makeComposite(targetDate) {
  var center = ee.Date(targetDate);
  var start = center.advance(-3, 'day');
  var end = center.advance(3, 'day');

  var s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
    .filterDate(start, end.advance(1, 'day'))
    .filterBounds(geometry)
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 15))
    .map(function(image) {

      var scaled = image.select(['B2', 'B3', 'B4', 'B5', 'B8', 'B11'])
        .multiply(0.0001)
        .toFloat();

      var ndwi = scaled.normalizedDifference(['B3', 'B8']).rename('NDWI');
      var ndci = scaled.normalizedDifference(['B5', 'B4']).rename('NDCI');
      var ndre = scaled.normalizedDifference(['B8', 'B5']).rename('NDRE');
      var ndvi = scaled.normalizedDifference(['B8', 'B4']).rename('NDVI');

      var eps = ee.Image.constant(1e-6).toFloat();

      var b3b2 = scaled.select('B3')
        .divide(scaled.select('B2').max(eps))
        .rename('B3_B2');

      var b5b4 = scaled.select('B5')
        .divide(scaled.select('B4').max(eps))
        .rename('B5_B4');

      var b3b4 = scaled.select('B3')
        .divide(scaled.select('B4').max(eps))
        .rename('B3_B4');

      var b2b3 = scaled.select('B2')
        .divide(scaled.select('B3').max(eps))
        .rename('B2_B3');

      var fai = scaled.select('B8').subtract(
        scaled.select('B4').add(
          scaled.select('B11').subtract(scaled.select('B4'))
            .multiply((842 - 665) / (1610 - 665))
        )
      ).rename('FAI');

      var ci = scaled.select('B5')
        .divide(scaled.select('B4').max(eps))
        .subtract(1)
        .rename('CI');

      var waterMask = ndwi.gt(0.1);

      return scaled
        .addBands(ndwi)
        .addBands(ndci)
        .addBands(ndre)
        .addBands(ndvi)
        .addBands(fai)
        .addBands(b3b2)
        .addBands(b5b4)
        .addBands(b3b4)
        .addBands(b2b3)
        .addBands(ci)
        .updateMask(waterMask)
        .clip(geometry)
        .toFloat()
        .copyProperties(image, ['system:time_start']);
    });

  return s2.median().toFloat();
}


// =============================
// 4. CHECK IMAGE AVAILABILITY
// =============================
function checkImageCount(targetDate) {
  var center = ee.Date(targetDate);
  var start = center.advance(-3, 'day');
  var end = center.advance(3, 'day');

  var count = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
    .filterDate(start, end.advance(1, 'day'))
    .filterBounds(geometry)
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 15))
    .size();

  return count;
}

print('High HAB image count:', checkImageCount(highHABDate));
print('Low HAB image count:', checkImageCount(lowHABDate));


// =============================
// 5. CREATE HIGH AND LOW HAB IMAGES
// =============================
var highHABImage = makeComposite(highHABDate);
var lowHABImage  = makeComposite(lowHABDate);

print('High HAB composite:', highHABImage);
print('Low HAB composite:', lowHABImage);


// =============================
// 6. DISPLAY IMAGES ON MAP
// =============================
Map.addLayer(
  highHABImage.select(['B4', 'B3', 'B2']),
  {min: 0, max: 0.3},
  'High HAB RGB'
);

Map.addLayer(
  lowHABImage.select(['B4', 'B3', 'B2']),
  {min: 0, max: 0.3},
  'Low HAB RGB'
);

Map.addLayer(
  highHABImage.select('NDCI'),
  {
    min: -0.2,
    max: 0.4,
    palette: ['blue', 'white', 'green', 'yellow', 'red']
  },
  'High HAB NDCI'
);

Map.addLayer(
  lowHABImage.select('NDCI'),
  {
    min: -0.2,
    max: 0.4,
    palette: ['blue', 'white', 'green', 'yellow', 'red']
  },
  'Low HAB NDCI'
);


// =============================
// 7. EXPORT MULTIBAND GEOTIFFS
// =============================
Export.image.toDrive({
  image: highHABImage,
  description: 'High_HAB_Sentinel2_Composite_' + highHABDate,
  folder: 'GEE_HAB_TIFF',
  fileNamePrefix: 'High_HAB_Sentinel2_Composite_' + highHABDate,
  region: geometry,
  scale: 10,
  crs: 'EPSG:4326',
  maxPixels: 1e13,
  fileFormat: 'GeoTIFF'
});

Export.image.toDrive({
  image: lowHABImage,
  description: 'Low_HAB_Sentinel2_Composite_' + lowHABDate,
  folder: 'GEE_HAB_TIFF',
  fileNamePrefix: 'Low_HAB_Sentinel2_Composite_' + lowHABDate,
  region: geometry,
  scale: 10,
  crs: 'EPSG:4326',
  maxPixels: 1e13,
  fileFormat: 'GeoTIFF'
});