<template>
  <div id="map-id" class="antv-canvas"></div>
</template>

<script>
import G2 from '@antv/G2';
import L7 from '@antv/l7';
import DataSet from '@antv/data-set';
// const mapData = require('../../assets/json/polygonLayer');
const mapData = require('../../assets/json/world.geo');
const alarmData = require('../../assets/json/alarmPoint');
// const normalData = require('../../assets/json/normalPoint');
const normalData = require('../../assets/json/earthquake');

export default {
  name: 'MapChart',
  data() {
    return {

    };
  },
  mounted() {
    this.initMapChart();
  },
  methods: {
    initL7Map() {
      const scene = new L7.Scene({
        id: 'map-id',
        mapStyle: 'light', // 样式URL
        center: [107.40, 35.82],
        pitch: 0,
        zoom: 4.48
      });

      scene.on('loaded', function() {
        scene.PolygonLayer({
          zIndex: 1
        }).source(mapData).color('cname', function(value) {
          return value === '中国' ? 'rgba(230,98,58,0.1)' : 'rgba(227,244,244,0.1)';
        }).shape('fill').render();

        scene.PointLayer({
          zIndex: 2
        }).source(normalData).shape('2d:circle').size(5).color('#0BC27F').style({
          stroke: 'rgb(255,255,255)',
          strokeWidth: 1,
          opacity: 0.9
        }).render();

        scene.PointLayer({
          zIndex: 4
        }).source(alarmData).size(5).shape('2d:circle').color('#E83721').style({
          stroke: 'rgb(255,255,255)',
          strokeWidth: 1,
          opacity: 0.9
        }).render();

        scene.PointLayer({
          zIndex: 8,
          minZoom: 5
        }).source(mapData).size(14.0).shape('name', 'text').color('rgba(0,0,0,0.25)').style({
          textOffset: [-20, 22],
          stroke: '#fff',
          strokeWidth: 4
        }).render();
      });
    },
    initMapChart() {
      const self = this;
      const canvasId = 'map-id';
      // const mapData = require('../assets/json/world.geo');
      // const data = require('../assets/json/earthquake');
      const chart = new G2.Chart({
        container: canvasId,
        forceFit: true,
        height: window.innerHeight,
        padding: [0, 20, 40]
      });
        // force sync scales
      chart.scale({
        x: {
          sync: true,
          nice: false
        },
        y: {
          sync: true,
          nice: false
        }
      });
      chart.coord().reflect();
      chart.legend(false);
      chart.axis(false);
      chart.tooltip(false);

      // style the tooltip
      // chart.tooltip({
      //   showTitle: false,
      //   containerTpl: '<div class="g2-tooltip"><table class="g2-tooltip-list"></table></div>',
      //   itemTpl: '<tr data-index="{index}"><td style="padding:5px;background-color:#545454;">{name}</td><td style="padding:5px;background-color:#fff;color:#000;">{value}</td></tr>',
      //   'g2-tooltip': {
      //     borderRadius: '2px',
      //     backgroundColor: '#DDDDDD',
      //     padding: 0,
      //     border: '1px solid #333'
      //   }
      // });
      // data set
      const ds = new DataSet();

      // draw the map
      const dv = ds.createView('back').source(mapData, {
        type: 'GeoJSON'
      }).transform({
        type: 'geo.projection',
        projection: 'geoMercator',
        as: ['x', 'y', 'centroidX', 'centroidY']
      });
      const bgView = chart.view();
      bgView.source(dv);
      bgView.tooltip(false);
      bgView.polygon().position('x*y').style({
        fill: '#DDDDDD',
        stroke: '#b1b1b1',
        lineWidth: 0.5,
        fillOpacity: 0.85
      });

      // draw the bubble plot
      const userData = ds.createView().source(normalData);
      userData.transform({
        type: 'map',
        callback: function callback(obj) {
          const projectedCoord = dv.geoProjectPosition([obj.lng * 1, obj.lat * 1], 'geoMercator');
          obj.x = projectedCoord[0];
          obj.y = projectedCoord[1];
          obj.deaths = obj.deaths * 1;
          obj.magnitude = obj.magnitude * 1;
          return obj;
        }
      });
      const pointView = chart.view();
      pointView.source(userData);
      pointView.point()
        .position('x*y')
        .size('deaths', [2, 10])
        .shape('circle')
        .opacity(0.8)
        .color('#0BC27F')
        .tooltip('date*location*lat*lng*deaths*magnitude');

      chart.render();
    },
    generateRandomColor() {
      const idx = Math.round(Math.random() * 3);
      const colors = ['#0BC27F', '#E6A23C', '#E83721', '#1989FA'];
      return colors[idx];
    }
  }
};
</script>

<style scoped>

  #map-id {
    position: fixed;
    top: 60px;
    bottom: 0;
    width: 100%;
    height: 100%;
  }

</style>
