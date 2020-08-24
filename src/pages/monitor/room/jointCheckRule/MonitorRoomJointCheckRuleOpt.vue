<template>
  <div :style="{paddingTop: `${breadcrumbHeight}px`}" class="joint-check-rule-page">
    <Breadcrumb v-model="breadcrumbHeight" :title="roomName"></Breadcrumb>
    <div v-loading="isFormLoading">
      <div class="page-container">
        <div class="page-operation-container">
          <div class="header5">联检设置</div>
          <div class="page-operation-divider"></div>
          <el-form
            :ref="jointCheckRuleFormRef"
            :model="jointCheckRuleForm"
            :rules="joinSelfCheckRules"
            size="medium"
            label-width="120px"
            class="page-operation-form">
            <el-form-item prop="name" label="联检名称">
              <el-input v-model="jointCheckRuleForm.name" type="text" placeholder="请输入联检名称"></el-input>
            </el-form-item>
            <el-form-item prop="beginScene" label="执行动作">
              <el-select
                v-model="jointCheckRuleForm.beginScene"
                class="search-select"
                @change="executiveChange">
                <el-option
                  v-for="(scene,index) in sceneData"
                  :key="index"
                  :value="scene.sceneId"
                  :label="scene.name"></el-option>
              </el-select>
              <div class="note">
                *{{ jointCheckRuleForm.beginScene?'动作执行时长'+jointCheckRuleForm.delay+'秒':'当房间达到该动作/状态时，开始执行联检' }}
              </div>
            </el-form-item>
            <el-form-item prop="timeout" label="联检时长">
              <el-input-number
                v-model="jointCheckRuleForm.timeout"
                :min="((jointCheckRuleForm.delay||0)+300||300)"
                placeholder="单位/秒"
                controls-position="right"></el-input-number>
              <div class="note">*联检时长≥动作执行时长({{ jointCheckRuleForm.delay||0 }}秒)+系统默认状态返回最短时长(5分钟)，可自定义时长(单位/秒)</div>
            </el-form-item>
            <el-form-item label="检测项设置">
              <el-table :data="selfTableData" class="joint-check-rule-table width-75" @cell-click="cellClick">
                <el-table-column
                  prop="deviceName"
                  label="设备名称">
                  <template slot-scope="scope">
                    <div v-if="scope.row.seen">
                      <el-select
                        v-model="scope.row.deviceId"
                        size="small"
                        class="width-100"
                        @change="categoryChang(scope.row)">
                        <el-option
                          v-for="(device,index) in deviceData"
                          :key="index"
                          :value="device.id"
                          :label="device.name"></el-option>
                      </el-select>
                    </div>
                    <div v-else>
                      <span style="margin-left: 10px">{{ scope.row.deviceName }}</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="stateName"
                  label="检测项">
                  <template slot-scope="scope">
                    <div v-if="scope.row.seen">
                      <el-select
                        v-model="scope.row.stateCode"
                        size="small"
                        @change="codeChang(scope.$index, scope.row)">
                        <el-option
                          v-for="(items,index) in scope.row.selfCheckingItemsData"
                          :key="index"
                          :value="items.code"
                          :label="items.name"></el-option>
                      </el-select>
                    </div>
                    <div v-else>
                      <span style="margin-left: 10px">{{ scope.row.stateName }}</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="operatorsName"
                  label="条件">
                  <template slot-scope="scope">
                    <div v-if="scope.row.seen">
                      <el-select v-model="scope.row.operators" size="small">
                        <el-option
                          v-for="ops in scope.row.opsList.ops"
                          :label="ops.name"
                          :value="ops.value"
                          :key="ops.value">
                        </el-option>
                      </el-select>
                    </div>
                    <div v-else>
                      <span style="margin-left: 10px">{{ scope.row.operatorsName }}</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="expectedValueName"
                  label="值">
                  <template slot-scope="scope">
                    <div v-if="scope.row.seen">
                      <el-select
                        v-if="scope.row.opsList.valueList"
                        v-model="scope.row.expectedValue"
                        size="small">
                        <el-option
                          v-for="item in scope.row.opsList.valueList"
                          :label="item.name"
                          :value="item.value"
                          :key="item.value">
                        </el-option>
                      </el-select>
                      <el-input v-else v-model="scope.row.expectedValue" size="small" type="text"></el-input>
                    </div>
                    <div v-else>
                      <span style="margin-left: 10px">{{ scope.row.expectedValueName }}</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                  label="操作"
                  width="100">
                  <template slot-scope="scope">
                    <el-button slot="reference" type="danger" size="mini" @click="deleteCell(scope.$index)">删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
              <div>
                <el-button class="mar-top" type="success" size="small" @click="selfCellAdd">添加检测项
                </el-button>
              </div>
            </el-form-item>
            <el-form-item prop="endScene" label="结束执行动作">
              <el-select
                v-model="jointCheckRuleForm.endScene"
                class="search-select">
                <el-option label="无" value="empty"></el-option>
                <el-option
                  v-for="(executive,index) in sceneData"
                  :key="index"
                  :value="executive.sceneId"
                  :label="executive.name"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item prop="isEnable" label="是否启用">
              <el-select v-model="jointCheckRuleForm.isEnable">
                <el-option value="Y" label="启用"></el-option>
                <el-option value="N" label="禁用"></el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <FormOptBtn @formCancel="joinSelfCheckClose" @formSubmit="joinSelfCheckSubmit"></FormOptBtn>
    </div>
  </div>
</template>

<script>
import Breadcrumb from '../../../../components/breadcrumb/Breadcrumb';
import { routerMeta } from '../../../../router/routerMeta';
import { commonConfig } from '../../../../config/common';
import {
  checkRespCorrect, getRoomByIdDetail,
  messageHandle,
  paramsTrim
} from '../../../../utils';
import { msgCode, msgContent } from '../../../../config/string';
import FormOptBtn from '../../../../components/FormOptBtn';
import MultipleSelector from '../../../../components/MultipleSelector';

export default {
  name: 'MonitorRoomJointCheckRuleOpt',
  components: {
    Breadcrumb, FormOptBtn, MultipleSelector
  },
  data() {
    return {
      breadcrumbHeight: 0,
      roomId: '',
      ruleId: '',
      isCheck: '',
      roomName: '',
      // region **********配置联检操作属性**********
      jointCheckRuleFormRef: 'jointCheckRuleFormRef',
      jointCheckRuleForm: {
        isEnable: 'Y',
        rules: []
      },
      deviceData: [],
      sceneData: [],
      selfTableData: [
        {
          deviceName: '',
          // deviceId: 0,
          stateCode: '',
          stateName: '',
          operators: '',
          expectedValue: '',
          seen: true,
          opsList: [],
          selfCheckingItemsData: []
        }
      ],
      isFormLoading: false,
      joinSelfCheckRules: {
        name: [{ required: true, message: '请输入联检名称', trigger: 'blur' },
          {
            max: commonConfig.formMaxLength.inputMax,
            message: '自检名称不能超过' + commonConfig.formMaxLength.inputMax + '个字符',
            trigger: 'blur'
          }],
        timeSetting: [{ required: true, message: '请输入联检时间', trigger: 'blur' }],
        beginScene: [{ required: true, message: '请选择执行动作', trigger: 'change' }],
        // delay: [{required: true, message: '请输入执行延迟时间', trigger: 'blur'}],
        rules: [{ required: true, message: '请配置检测项', trigger: 'blur' }],
        isEnable: [{ required: true, message: '请选择是否启用', trigger: 'change' }],
        timeout: [{ required: true, message: '请选择联检时长', trigger: 'change' }],
        endScene: [{ required: true, message: '请选择结束执行动作', trigger: 'change' }]
      }
      // endregion
    };
  },
  created() {
    this.initData();
  },
  methods: {
    initData() {
      this.roomId = this.$route.params.rid || '';
      this.ruleId = this.$route.params.jid || '';
      this.isCheck = this.$route.params.isCheck || ''; // 用于判断是不是自检规则菜单跳过来的
      getRoomByIdDetail(this.roomId).then(item => {
        this.roomName = item || '';
      });
      this.getSceneList();
      this.getRoomDeviceList();
      if (this.ruleId) {
        this.jointCheckRuleDetail();
      }
    },
    // 切换设备
    categoryChang(row) {
      row.deviceName = (this.deviceData || []).find(item => item.id === row.deviceId).name;
      row.expectedValue = '';
      row.operators = '';
      row.stateCode = '';
      this.getSelfCheckList(row);
    },
    // 点击行变成可编辑
    cellClick(row, column) {
      row.seen = true;
      this.getRoomDeviceList();
    },
    // 行不可编辑
    cellBlur(row) {
      row.seen = false;
    },
    // 添加检测项行
    selfCellAdd() {
      this.selfTableData.push({
        deviceName: '',
        stateCode: '',
        stateName: '',
        operators: '',
        expectedValue: '',
        seen: true,
        opsList: [],
        selfCheckingItemsData: []
      });
    },
    // 删除检测项
    deleteCell(index) {
      this.$confirm(`确定删除该条检测项？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        this.selfTableData.splice(index, 1);
      }).catch(err => {
      });
    },
    // 切换自检项
    codeChang(index, row) {
      row.expectedValue = '';
      row.operators = '';
      row.opsList = (row.selfCheckingItemsData || []).find(item => item.code === row.stateCode);
    },
    // 根据房间ID获取设备
    getRoomDeviceList() {
      API.device.deviceListByRoomId({ roomId: this.roomId }).then(resp => {
        if (checkRespCorrect(resp)) {
          this.deviceData = resp.data || [];
        } else {
          messageHandle({ code: resp.code, msg: resp.message || msgContent.QUERY });
        }
      }).catch(err => {
        messageHandle({ code: msgCode.SYSTEM });
      });
    },
    // 根据设备ID获取自检项
    getSelfCheckList(row) {
      API.selfCheckRule.selfCheckItemListByDeviceId({ deviceId: row.deviceId }).then(resp => {
        if (checkRespCorrect(resp)) {
          row.selfCheckingItemsData = resp.data || [];
        } else {
          row.selfCheckingItemsData = [];
          row.opsList = [];
          messageHandle({ code: resp.code, msg: resp.message || msgContent.QUERY });
        }
      }).catch(err => {
        messageHandle({ code: msgCode.SYSTEM });
      });
    },
    // 根据联检ID获取详情
    jointCheckRuleDetail() {
      API.jointCheckRule.jointCheckRuleDetail({ roomId: this.roomId, id: this.ruleId }).then(resp => {
        if (checkRespCorrect(resp)) {
          const { data = {} } = resp;
          this.jointCheckRuleForm = {
            ...data,
            timeout: data.timeout || 300,
            rules: __.pluck(data.rules || [], 'id'),
            endScene: data.endScene ? data.endScene : 'empty'
          };
          this.selfTableData = (data.rules || []).map(item => {
            return {
              ...item,
              seen: false,
              opsList: (item.state || []).find(items => items.code === item.stateCode) || [],
              selfCheckingItemsData: item.state || []
            };
          });
        } else {
          messageHandle({ code: resp.code, msg: resp.message || msgContent.QUERY });
        }
      }).catch(err => {
        messageHandle({ code: msgCode.SYSTEM });
      });
    },
    // 根据当前选中的执行动作获取延迟时间
    executiveChange(id) {
      const sceneObj = (this.sceneData || []).find(item => item.sceneId === id) || {};
      this.jointCheckRuleForm.delay = Math.floor(sceneObj.spendTime / 1000) || 0;
      this.jointCheckRuleForm.timeout = Math.floor(sceneObj.spendTime / 1000) + 300 || 300;
    },
    // 根据房间ID获取情景和执行动作
    getSceneList() {
      API.room.roomSceneAll({ roomId: this.roomId }).then(resp => {
        if (checkRespCorrect(resp)) {
          this.sceneData = resp.data || [];
        } else {
          messageHandle({ code: resp.code, msg: resp.message || msgContent.QUERY });
        }
      }).catch(err => {
        messageHandle({ code: msgCode.SYSTEM });
      });
    },
    joinSelfCheckClose() { // 关闭房间联检
      this.$router.go(-1);
      // if (this.isCheck) { //跳转到自检规则菜单里面房间联检详情页面
      //   this.$router.push({
      //     name: routerMeta.systemRoomJointCheckRuleList.name,
      //     params: this.$route.params
      //   })
      // } else {
      //   this.$router.push({
      //     name: routerMeta.monitorRoomJointCheckRule.name,
      //     params: this.$route.params
      //   })
      // }
    },
    joinSelfCheckSubmit() { // 提交房间联检
      this.$refs[this.jointCheckRuleFormRef].validate((valid) => {
        if (!valid) return;
        this.isFormLoading = true;
        const params = {
          ...this.jointCheckRuleForm,
          roomId: this.roomId,
          rules: (this.selfTableData || []).map(item => {
            return {
              deviceId: item.deviceId,
              expectedValue: item.expectedValue,
              operators: item.operators,
              stateCode: item.stateCode
            };
          })
        };
        paramsTrim(params);
        if (!this.jointCheckRuleForm.id) {
          API.jointCheckRule.jointCheckRuleAdd(params).then(resp => {
            this.isFormLoading = false;
            if (checkRespCorrect(resp)) {
              messageHandle({ code: msgCode.ADD_SAVE, msg: '联检规则新增成功' });
              this.joinSelfCheckClose();
            } else {
              messageHandle({ code: resp.code, msg: resp.message || msgContent.MUTATION });
            }
          }).catch(err => {
            this.isFormLoading = false;
            messageHandle({ code: msgCode.SYSTEM });
          });
        } else {
          API.jointCheckRule.jointCheckRuleEdit(params).then(resp => {
            this.isFormLoading = false;
            if (checkRespCorrect(resp)) {
              messageHandle({ code: msgCode.ADD_SAVE, msg: '联检规则编辑成功' });
              this.joinSelfCheckClose();
            } else {
              messageHandle({ code: resp.code, msg: resp.message || msgContent.MUTATION });
            }
          }).catch(err => {
            this.isFormLoading = false;
            messageHandle({ code: msgCode.SYSTEM });
          });
        }
      });
    }
  }
};
</script>

<style scoped lang="less">
  .note {
    width: 380px;
    margin-top: 15px;
    font-size: 14px;
    font-weight: 400;
    color: @colorGray70;
    line-height: 22px;
  }
</style>
