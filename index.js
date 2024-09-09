window.onload = () => {
  // https://www.somesolvedproblems.com/2018/07/how-do-i-make-plotly-faster.html?m=1
  const plot = document.getElementById('plot')
  let type = (new URLSearchParams(window.location.search)).get('type')
  const area = (new URLSearchParams(window.location.search)).get('area') || 'athens'
  type = ['sale', 'rent', 'roi', 'area'].includes(type) ? type : 'sale'
  const config_all = [
    {
      type: 'default',
      z_key: 'price_per_meter',
      cmax: 7000,
      cmin: 1000,
      title: '€/m2',
      size: 10,
      hovertemplate: null
    },
    {
      type: 'rent',
      z_key: 'price_per_meter',
      cmax: 20,
      cmin: 5,
      title: '€/m2',
      size: 10,
      hovertemplate: null
    },
    {
      type: 'roi',
      z_key: 'ROI',
      cmax: 5,
      cmin: 2,
      title: '%/year',
      size: 30,
      hovertemplate: null
    },
    {
      type: 'area',
      z_key: 'sale_price_per_meter',
      cmax: 6000,
      cmin: 1000,
      title: '€/m2',
      size: (r) => 20 + r.n_sale / 20,
      hovertemplate: '</br><b>%{customdata.geography}</b></br>On Sale: %{customdata.n_sale}</br>On Rent: %{customdata.n_rent}</br>Sale €/m2: %{customdata.sale_price_per_meter}</br>Rent €/m2: %{customdata.rent_price_per_meter}</br>ROI: %{customdata.ROI}<extra></extra>'
    }
  ]
  const config = config_all.find(x => x.type === type) || config_all.find(x => x.type === 'default')
  console.log('Config loaded', config)
  d3.csv(`greece_${type}.csv`, (err, rows) => {
    if (area === 'athens') {
      rows = rows.filter(r => r.Lat > 37.8 && r.Lat < 38.15 && r.Long > 23.55 && r.Long < 23.95)
    }
    /*
    if (type === 'roi') {
      rows = rows.filter(r => r.ROI > 0)
    }
    */
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
      z: rows.map(r => r[config.z_key]),
      type: 'scattermap',
      coloraxis: 'coloraxis',
      customdata: config.hovertemplate ? rows : null,
      hoverinfo: 'text',
      hovertext: rows.map(r => r[config.z_key]),
      hovertemplate: config.hovertemplate || null,
      marker: {
        allowoverlap: true,
        colorscale: 'Viridis', // Viridis,Jet,Reds,Earth,Rainbow,[[0, 'rgb(100,100,100)'], [1, 'rgb(255,0,0)']]
        color: rows.map(r => r[config.z_key]),
        opacity: 0.8,
        size: typeof config.size === 'function' ? rows.map(config.size) : config.size || 10,
        // sizemin: 4,
        // size: rows.map(r => r.rooms > 4 ? 16 : r.rooms * 4),
        cmax: config.cmax,
        cmin: config.cmin,
        colorbar: {
          title: config.title,
          showticksuffix: 'last',
          ticksuffix: '+'
        }
      },
      connectgaps: false
    }]

    /*
    const template = {
      data: {},
      layout: {
        title: 'Watermark',
        images: [
          {
            name: 'watermark',
            // source: 'https://raw.githubusercontent.com/michaelbabyn/plot_data/master/naphthalene.png',
            xref: 'paper',
            yref: 'paper',
            x: 0.75,
            y: 0.3,
            sizex: 0.25,
            sizey: 0.25,
            sizing: 'stretch',
            opacity: 0.1,
            layer: 'over'
          }],
        showlegend: false
      }
    }
    */
    const layout = {
      // template,
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
        console.log('Zoom changed: %s -> %s [%s]', last_zoom, new_zoom, new_zoom / first_zoom)
        last_zoom = new_zoom
        const new_marker_size = typeof first_marker_size === 'object' ? first_marker_size.map(r => Math.round(r * new_zoom / first_zoom)) : first_marker_size * new_zoom / first_zoom
        console.log(new_marker_size)
        Plotly.update(plot, [{ 'marker.size': new_marker_size }])
      }
    })
  })
}
