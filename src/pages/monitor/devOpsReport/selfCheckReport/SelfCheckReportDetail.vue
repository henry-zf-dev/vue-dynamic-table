<template>
  <div class="self-check-detail self-check-record-page" style="padding-top: 60px">
    <Breadcrumb></Breadcrumb>
    <div class="page-container">
      <div class="position-relative page-detail-title">
        <div class="header4">{{ selfCheckData.roomLocationName }}</div>
        <div class="font-size-mini mar-top mar-btm-20 font-gray-70">
          自检时间：{{ selfCheckData.checkFullTime }}
        </div>
        <div
          class="header4 position-absolute display-inline-block"
          style="top: 0;margin-top: 20px;right: 15px;line-height: 56px;">
          <TableCircle
            :title="selfCheckData.score"
            :trim="false"
            :color="selfCheckData.classKey || 'fine-circle'"
            class="circle"
            style="vertical-align: middle"
            size="48"></TableCircle>
          <span style="vertical-align: middle">健康度：{{ selfCheckData.selfCheckText || "优秀" }}</span>
        </div>
      </div>
      <div class="page-detail-container">
        <el-collapse v-model="activeName">
          <el-collapse-item class="position-relative mar-top-5" name="first">
            <template slot="title" class="border-bottom-90" style="line-height: 54px">
              <span class="header5 mar-top-0 mar-btm-0">自检情况</span>
              <span style="position: absolute;right: 28px;line-height: 54px" class="font-gray-40 font-size-main">自检时间：{{ selfCheckData.checkTime }}</span>
            </template>
            <el-divider></el-divider>
            <el-row
              v-for="(item,idx) in (selfCheckData.checkItems || []) "
              :key="idx"
              class="border-bottom-90 row-hover"
              style="line-height: 54px;">
              <el-col :span="7">
                <TableCircle title="!" class="normal-circle mar-rgt-5 mar-lft-5" size="18"></TableCircle>
                <span class="table-main-title">{{ item.ruleName }}</span>
              </el-col>
              <el-col :span="10">
                <span v-if="item.score" class="table-sub-title">触发：<span
                  class="font-color-danger">-{{ item.score }}分</span></span>
                <span v-else class="table-sub-title">未触发</span>
              </el-col>
              <el-col :span="7">
                <span
                  class="table-sub-title float-right pad-rgt pad-top-20">时间：{{ getItemTime(item.createdTime) }}</span>
              </el-col>
            </el-row>
          </el-collapse-item>
        </el-collapse>
      </div>

    </div>
  </div>
</template>

<script>
import Breadcrumb from '../../../../components/breadcrumb/Breadcrumb';
import { momentFormat } from '../../../../config/common';
import { commonString, msgCode, msgContent } from '../../../../config/string';
import { checkRespCorrect, messageHandle, getSelfCheckStatus, momentTimeToString } from '../../../../utils';
import TableCircle from '../../../../components/table/TableCircle';

export default {
  name: 'SelfCheckReportDetail',
  components: {
    Breadcrumb, TableCircle
  },
  data() {
    return {
      activeName: 'first',
      selfCheckId: '',
      selfCheckData: {}
    };
  },
  created() {
    this.selfCheckId = this.$route.params.sid || '';
    this.selfCheckDetail();
  },
  methods: {
    getItemTime(checkTime) {
      return momentTimeToString(checkTime);
    },
    selfCheckDetail() {
      API.room.roomSelfCheckDetail({ id: this.selfCheckId }).then(resp => {
        if (checkRespCorrect(resp)) {
          const { data = {} } = resp;
          const selfCheckStatus = getSelfCheckStatus(parseInt(data.hasOwnProperty('score') ? data.score : 100));
          this.selfCheckData = {
            ...data,
            roomLocationName: (data.roomLocation || '') + '-' + (data.roomName || ''),
            score: data.score,
            checkTime: momentTimeToString(data.checkTime, momentFormat.date),
            checkFullTime: momentTimeToString(data.checkTime, momentFormat.dateTimeDetailCN),
            selfCheckText: selfCheckStatus.label,
            classKey: selfCheckStatus.classKey
          };
        } else {
          messageHandle({ code: resp.code, msg: resp.message || msgContent.QUERY });
        }
      }).catch(err => {
        messageHandle({ code: msgContent.SYSTEM });
      });
    }
  }
};
</script>

<style lang="less">
  .self-check-detail {
    .el-collapse-item__header {
      height: 54px !important;
      line-height: 54px !important;
    }

    .el-collapse {
      border: none !important;
    }

    .el-collapse-item__wrap {
      border: none !important;
    }

    .el-collapse-item__content {
      padding-bottom: unset !important;
    }

    .row-hover:hover {
      background-color: @colorBgWhite;
    }
  }
</style>
