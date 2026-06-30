// =====================================================
// SAMPLE SENTINEL-2 FEATURES AT MONITORING STATIONS
// For HAB classification dataset
// =====================================================


// =============================
// 1. STATIONS
// =============================
var stations = ee.FeatureCollection([
  ee.Feature(ee.Geometry.Point([120.392218, 22.54098]), {station: 'S1'}),
  ee.Feature(ee.Geometry.Point([120.390094, 22.538978]), {station: 'S2'}),
  ee.Feature(ee.Geometry.Point([120.388483, 22.538672]), {station: 'S3'}),
  ee.Feature(ee.Geometry.Point([120.389622, 22.535145]), {station: 'S4'})
]);

Map.addLayer(stations, {color: 'red'}, 'Stations');
Map.centerObject(stations, 14);


// =============================
// 2. GROUND TRUTH DATES
// =============================
var gtDates = [
  '2019-01-08','2019-03-13','2019-04-16','2019-06-05','2019-07-16','2019-09-18','2019-10-16','2019-12-11',
  '2020-01-08','2020-03-11','2020-04-15','2020-06-15','2020-07-15','2020-12-09',
  '2021-01-12','2021-02-02','2021-03-03','2021-04-12','2021-05-10','2021-06-01','2021-07-12','2021-08-27',
  '2021-09-10','2021-10-21','2021-11-08','2021-12-06',
  '2022-01-10','2022-02-22','2022-03-07','2022-04-06','2022-05-10','2022-06-15','2022-07-04','2022-08-02',
  '2022-09-02','2022-10-06','2022-11-04','2022-12-02',
  '2023-01-05','2023-02-07','2023-03-06','2023-04-12','2023-05-10','2023-06-07','2023-07-20','2023-08-18',
  '2023-09-06','2023-10-13','2023-11-14','2023-12-20',
  '2024-01-05','2024-02-16','2024-03-04','2024-04-03','2024-05-03','2024-06-14','2024-07-08','2024-08-16',
  '2024-11-07',
  '2025-02-13','2025-06-06','2025-09-04','2025-12-02',
  '2026-01-28'
];


// =============================
// 3. MAKE SENTINEL-2 COMPOSITE
// =============================
function makeComposite(targetDate) {
  var center = ee.Date(targetDate);
  var start = center.advance(-3, 'day');
  var end = center.advance(3, 'day');

  var s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
    .filterDate(start, end.advance(1, 'day'))
    .filterBounds(stations)
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
        .toFloat()
        .copyProperties(image, ['system:time_start']);
    });

  return s2.median().toFloat();
}


// =============================
// 4. SAMPLE STATIONS FOR ONE DATE
// =============================
function sampleStationsForDate(dateStr) {
  var image = makeComposite(dateStr);

  var samples = image.sampleRegions({
    collection: stations,
    properties: ['station'],
    scale: 10,
    geometries: true
  });

  return samples.map(function(f) {
    return f.set('gt_date', dateStr);
  });
}


// =============================
// 5. CHECK VALID DATES
// =============================
var validDateFC = ee.FeatureCollection(
  gtDates.map(function(dateStr) {
    var center = ee.Date(dateStr);
    var start = center.advance(-3, 'day');
    var end = center.advance(3, 'day');

    var s2Check = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
      .filterDate(start, end.advance(1, 'day'))
      .filterBounds(stations)
      .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 15));

    return ee.Feature(null, {
      gt_date: dateStr,
      image_count: s2Check.size()
    });
  })
).filter(ee.Filter.gt('image_count', 0));

var validDates = validDateFC.aggregate_array('gt_date');


// =============================
// 6. EXPORT CSV
// =============================
var allSamples = ee.FeatureCollection(
  validDates.map(function(dateStr) {
    return sampleStationsForDate(dateStr);
  })
).flatten();

print('Valid dates:', validDateFC);
print('All station samples:', allSamples.limit(10));
print('Total samples:', allSamples.size());

Export.table.toDrive({
  collection: allSamples,
  description: 'StationSamples_AllDates_3DayWindow',
  folder: 'GEE_Station_CSV',
  fileNamePrefix: 'StationSamples_AllDates_3DayWindow',
  fileFormat: 'CSV'
});