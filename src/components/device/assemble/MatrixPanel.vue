<template>
  <div class="video-matrix-table">
    <el-table
      :data="rows"
      class="position-relative"
      border
      @cell-mouse-enter="cellMouseEnter"
      @cell-mouse-leave="cellMouseLeave"
      @cell-dblclick="cellDbClick">
      <el-table-column>
        <template slot-scope="scope">
          <div class="text-align-center">
            <span
              :class="scope.row.inputChannel.signal ? 'color-primary' : 'color-gray-70'"
              class="input-signal-status"></span>
            <span>{{ scope.row.inputChannel.input }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        v-for="(item, idx) in outputs"
        :key="idx"
        :prop="item.prop"
        :label="item.label">
        <!--<template slot="header" slot-scope="scope">-->
        <!--<TableCircle :type="connectionStatus.type"></TableCircle>-->
        <!--&lt;!&ndash;            <span class="channel-status cursor-pointer" :class="item.status"></span>&ndash;&gt;-->
        <!--<span class="cursor-pointer">{{item.label}}</span>-->
        <!--</template>-->
        <template slot-scope="scope">
          <div class="text-align-center">
            <span v-if="scope.row[item.prop] === 'A'" class="font-color-danger">{{ scope.row[item.prop] }}</span>
            <span v-if="scope.row[item.prop] === 'V'" class="font-color-success">{{ scope.row[item.prop] }}</span>
            <span v-if="scope.row[item.prop] === 'AV'" class="font-color-warning">{{ scope.row[item.prop] }}</span>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <EmptyContent v-if="rows.length === 0"></EmptyContent>
  </div>
</template>

<script>
import TableCircle from '../../table/TableCircle';
import { deviceCtrFunc } from '../../../config/common';
import EmptyContent from '../../EmptyContent';

export default {
  name: 'MatrixPanel',
  components: {
    TableCircle, EmptyContent
  },
  props: {
    deviceAbility: {
      type: Array,
      default: () => {
        return [];
      }
    },
    rows: {
      type: Array,
      default: () => {
        return [];
      }
    },
    outputs: {
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  data() {
    return {
      currentColumn: 0 // 标志当前鼠标移动到哪一列，用于列的highlight显示
    };
  },
  methods: {
    cellMouseEnter(row, column) {
      this.currentColumn = parseInt(column.label);
    },
    cellMouseLeave() {
      this.currentColumn = 0;
    },
    cellDbClick(row, column) {
      const inputTitle = row.inputChannel.input;
      const outputTitle = column.label;
      const rowIdx = row.inputChannel.prop;
      const columnIdx = column.property;
      let alterMsg = '';
      if (!row[columnIdx]) return;
      const positive = row[columnIdx].trim();
      if (!positive) {
        alterMsg = `确定要将 ${inputTitle}，切换到 ${outputTitle}?`;
      } else {
        alterMsg = `确定要取消 ${inputTitle}，到 ${outputTitle}的路由吗?`;
      }
      this.$confirm(alterMsg, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        const ctrParam = {
          method: deviceCtrFunc.videoMatrix.setInputOutputRoute.method,
          params: {
            input: positive ? '00' : rowIdx,
            output: columnIdx
          }
        };
        const expParam = {
          method: ctrParam.method,
          expectKey: `channelRoute.${row.idx}.${columnIdx}`,
          value: !positive ? 'V' : ' ',
          ignoreParam: true
        };
        this.$emit('routeChanged', ctrParam, expParam);
      }).catch(() => {
      });
    }
  }
};
</script>

<style scoped>

  .input-signal-status {
    display: inline-block;
    margin-right: 5px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }

</style>
