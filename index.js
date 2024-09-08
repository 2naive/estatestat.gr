window.onload = () => {
  const plot = document.getElementById('plot')
  let type = (new URLSearchParams(window.location.search)).get('type')
  type = ['sale', 'rent', 'rent_roi', 'area'].includes(type) ? type : 'sale'
  d3.csv(`greece_${type}.csv`, (err, rows) => {
    function unpack (rows, key) {
      return rows.map(function (row) {
        return row[key]
      })
    }

    const data = [{
      lon: unpack(rows, 'Long'),
      lat: unpack(rows, 'Lat'),
      /*
      cluster: {
        enabled: true,
        size: [20,20],
        color: ['red','green'],
        step: [20,40]
      },
      */
      z: unpack(rows, 'price_per_meter'),
      type: 'scattermap',
      coloraxis: 'coloraxis',
      hoverinfo: 'text',
      hovertext: unpack(rows, 'price_per_meter'),
      marker: {
        allowoverlap: true,
        colorscale: 'Viridis', // Viridis,Jet,Reds,Earth,Rainbow,[[0, 'rgb(100,100,100)'], [1, 'rgb(255,0,0)']]
        color: unpack(rows, 'price_per_meter'),
        opacity: 0.8,
        sizemin: 4,
        // size: 10,
        size: unpack(rows, 'rooms').map((r) => { return r > 4 ? 16 : r * 4 }),
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
        zoom: 10
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

    Plotly.newPlot(plot, data, layout, { scrollZoom: true })
    const first_zoom = plot.layout.map.zoom
    let last_zoom = plot.layout.map.zoom
    plot.on('plotly_relayout', (eventdata) => {
      const new_zoom = parseInt(eventdata['map.zoom'])
      if (last_zoom !== new_zoom) {
        console.log('Zoom changed: %s -> %s', last_zoom, new_zoom)
        last_zoom = new_zoom
        Plotly.update(plot, {'marker.size': unpack(rows, 'rooms').map((r) => { return r > 4 ? 16 * new_zoom/first_zoom : r * 4 * new_zoom/first_zoom})})
      }
    })
  })
}