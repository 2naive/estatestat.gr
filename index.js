d3.csv('prop_sale_greece.csv',
  function (err, rows) {
    function unpack (rows, key) {
      return rows.map(function (row) {
        return row[key]
      })
    };

    const data = [{
      ids: unpack(rows, 'Address'),
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
        size: unpack(rows, 'rooms').map((r)=>{return r>4?16:r*4}),
        // cmax: 20, // rent
        // cmin: 5, // rent
        cmax: 8000, // sale
        cmin: 1000, // sale
        colorbar: {
          title: '€/m2'
        }
      },
      connectgaps: false
    }]

    const layout = {
      dragmode: 'zoom',
      map: {
        center: { lon: 23.75, lat: 38 },
        style: 'open-street-map',
        zoom: 10
      },
      coloraxis: {
        colorscale: 'Viridis',
        showscale: true
      },
      //title: { text: '' },
      //width: 1400,
      //height: 800,
      margin: { t: 30, b: 0 }
    }

    Plotly.newPlot('plot', data, layout, {scrollZoom: true})
  })
