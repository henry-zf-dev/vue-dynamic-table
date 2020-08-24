<template>
  <div :id="canvasId" class="antv-canvas"></div>
</template>

<script>
import G2 from '@antv/G2';
import DataSet from '@antv/data-set';

export default {
  name: 'PieChart',
  props: {
    canvasId: {
      type: String,
      default: ''
    },
    sourceData: {
      type: Array,
      default: () => {
        return [];
      }
    },
    statusColors: {
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  data() {
    return {
      chart: null
    };
  },
  mounted() {
    this.initPieChart();
  },
  methods: {
    initPieChart() {
      const self = this;
      const dataSet = new DataSet();
      const dataView = dataSet.createView().source(this.sourceData).transform({
        type: 'percent',
        field: 'sum',
        dimension: 'name',
        as: 'percent'
      });

      const chart = self.chart || new G2.Chart({
        container: self.canvasId,
        height: 220,
        forceFit: true,
        padding: { top: -10, bottom: 40 },
        F: [0, 100, 0, 0]
      });
      chart.legend({
        offsetY: -10,
        useHtml: true,
        reactive: true,
        containerTpl: '<div class="g2-legend"><table class="g2-legend-list"></table></div>',
        itemTpl: (name, color, checked, index) => {
          const obj = dataView.rows[index];
          checked = checked ? 'checked' : 'unChecked';
          return `<tr class="g2-legend-list-item item-${index} ${checked}" data-value="${name}" data-color="${color}">` +
              `<td class="g2-legend-list-main text-overflow pull-left"><i class="g2-legend-marker" style="background-color:${color}"></i>` +
              `<span class="g2-legend-text" style="color: #666">${name}</span></td>` +
              `<td style="text-align: right;color: #666;width:10px">${obj.sum}</td></tr>`;
        }
      });
      chart.source(dataView);
      chart.coord('theta', {
        radius: 0.85, innerRadius: 0.6
      });
      chart.tooltip({
        showTitle: false,
        containerTpl: '<div class="g2-tooltip"><ul class="g2-tooltip-list"></ul></div>',
        itemTpl: '<li class="text-bold" data-index={index}><span style="color:{color}">{name}: &nbsp;</span>{value}</li>'
      });

      const interval = chart
        .intervalStack()
        .position('percent')
        .color('name', self.statusColors)
        .tooltip('name*percent', (name, percent) => {
          return {
            name: name,
            value: (percent * 100).toFixed(2) + '%'
          };
        }).style({
          lineWidth: 1,
          stroke: '#fff'
        });

      chart.render();

      chart.on(`#${self.canvasId} ` + 'interval:mouseenter', function(ev) {
        interval.setShapeSelected(ev.shape);
      });
      chart.on(`#${self.canvasId} ` + 'interval:mouseleave', function() {
        interval.clearSelected();
      });

      self.chart = chart;
    }
  }
};
</script>

<style scoped>

</style>
