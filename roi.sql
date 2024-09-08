SELECT MEDIAN(CAST(longitude  as decimal)) AS Long, MEDIAN(CAST(latitude  as decimal)) AS Lat, ROUND(100 * 12 * (SELECT MEDIAN(IFNULL(price,0)/sq_meters) FROM spitogatos.properties rent WHERE rent.type='rent' AND rent.geography=sale.geography)/MEDIAN(IFNULL(sale.price,0)/sale.sq_meters), 1) AS ROI
FROM spitogatos.properties sale
WHERE sale.type='sale' AND imported_at IS NOT NULL AND modified > '2024-01-01'
GROUP BY sale.geography
/*
Для использования MEDIAN нужна stats.dll
https://antonz.org/sqlean/
https://github.com/nalgeon/sqlean/releases/tag/0.27.1
SELECT load_extension('stats')
*/