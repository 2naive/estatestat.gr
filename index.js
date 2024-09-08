window.onload = () => {
  // https://www.somesolvedproblems.com/2018/07/how-do-i-make-plotly-faster.html?m=1
  const plot = document.getElementById('plot')
  let type = (new URLSearchParams(window.location.search)).get('type')
  let area = (new URLSearchParams(window.location.search)).get('area') || 'athens'
  type = ['sale', 'rent', 'rent_roi', 'area'].includes(type) ? type : 'sale'
  d3.csv(`greece_${type}.csv`, (err, rows) => {
    if (area === 'athens') {
      rows = rows.filter(r => r.Lat > 37.8 && r.Lat < 38.15 && r.Long > 23.55 && r.Long < 23.95)
    }
    const data = [{
      lon: rows.map(r => r.Long),
      lat: rows.map(r => r.Lat),
      /*
      cluster: {
        enabled: true,
        size: [20,20],
        color: ['red','green'],
        step: [20,40]
      },
      */
      z: rows.map(r => r.price_per_meter),
      type: 'scattermap',
      coloraxis: 'coloraxis',
      hoverinfo: 'text',
      hovertext: rows.map(r => r.price_per_meter),
      marker: {
        allowoverlap: true,
        colorscale: 'Viridis', // Viridis,Jet,Reds,Earth,Rainbow,[[0, 'rgb(100,100,100)'], [1, 'rgb(255,0,0)']]
        color: rows.map(r => r.price_per_meter),
        opacity: 0.8,
        sizemin: 4,
        size: 10,
        // size: rows.map(r => r.rooms > 4 ? 16 : r.rooms * 4),
        cmax: type === 'sale' ? 7000 : 20,
        cmin: type === 'sale' ? 1000 : 5,
        colorbar: {
          title: '€/m2',
          showticksuffix: 'last',
          ticksuffix: '+'
        }
      },
      connectgaps: false
    }]

    const layout = {
      dragmode: 'zoom',
      map: {
        center: { lon: 23.75, lat: 38 },
        style: 'open-street-map', // basic, carto-darkmatter, carto-darkmatter-nolabels, carto-positron, carto-positron-nolabels, carto-voyager, carto-voyager-nolabels, dark, light, open-street-map, outdoors, satellite, satellite-streets, streets, white-bg
        zoom: area === 'athens' ? 10 : 6
      },
      coloraxis: {
        colorscale: 'Viridis',
        showscale: true
      },
      // title: { text: '' },
      // width: 1400,
      // height: 800,
      margin: { t: 0, b: 0, l: 0 }
    }

    Plotly.react(plot, data, layout, { scrollZoom: true })
    const first_marker_size = plot.data[0].marker.size
    const first_zoom = plot.layout.map.zoom
    let last_zoom = plot.layout.map.zoom
    plot.on('plotly_relayout', (eventdata) => {
      // console.log(eventdata)
      const new_zoom = parseInt(eventdata['map.zoom'])
      if (last_zoom !== new_zoom) {
        console.log('Zoom changed: %s -> %s [%s]', last_zoom, new_zoom, first_marker_size * new_zoom / first_zoom)
        last_zoom = new_zoom
        Plotly.update(plot, { 'marker.size': first_marker_size * new_zoom / first_zoom })
      }
    })
  })
}
