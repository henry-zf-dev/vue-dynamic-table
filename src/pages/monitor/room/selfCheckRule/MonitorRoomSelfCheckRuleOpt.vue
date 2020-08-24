<template>
  <div :style="{paddingTop: `${breadcrumbHeight}px`}">
    <Breadcrumb v-model="breadcrumbHeight" :title="roomName"></Breadcrumb>
    <div v-loading="isFormLoading">
      <div class="page-container">
        <div class="page-operation-container">
          <el-form
            :ref="selfCheckFormRef"
            :model="selfCheckForm"
            :rules="selfCheckRules"
            size="medium"
            label-width="100px"
            class="page-operation-form">
            <div class="header5">自检设置</div>
            <div class="page-operation-divider"></div>
            <el-form-item prop="name" label="自检名称">
              <el-input v-model="selfCheckForm.name" type="text" placeholder="请输入自检名称"></el-input>
            </el-form-item>
            <el-form-item prop="sceneId" label="触发条件">
              <div>
                <el-select
                  v-model="selfCheckForm.sceneId"
                  class="search-select">
                  <el-option
                    v-for="(scene,index) in sceneData"
                    :key="index"
                    :value="scene.sceneId"
                    :label="scene.name"></el-option>
                </el-select>
              </div>
              <div class="note">*注：触发目标设备自检的前提条件。</div>
            </el-form-item>
            <div class="header5 mar-top-40">自检设备</div>
            <div class="page-operation-divider"></div>
            <el-form-item prop="deviceId" label="设备名称">
              <el-select
                v-model="selfCheckForm.deviceId"
                @change="categoryChang">
                <el-option
                  v-for="(device,index) in deviceData"
                  :key="index"
                  :value="device.id"
                  :label="device.name"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item prop="stateCode" label="自检项">
              <el-select v-model="selfCheckForm.stateCode" @change="codeChang">
                <el-option
                  v-for="(items,index) in selfCheckingItemsData"
                  :key="index"
                  :value="items.code"
                  :label="items.name"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item prop="operators" label="条件">
              <el-select v-model="selfCheckForm.operators">
                <el-option
                  v-for="ops in opsList.ops"
                  :label="ops.name"
                  :value="ops.value"
                  :key="ops.value">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item prop="expectedValue" label="正常值">
              <el-select
                v-if="opsList.valueList"
                v-model="selfCheckForm.expectedValue">
                <el-option
                  v-for="item in opsList.valueList"
                  :label="item.name"
                  :value="item.value"
                  :key="item.value">
                </el-option>
              </el-select>
              <el-input v-else v-model="selfCheckForm.expectedValue" type="text"></el-input>
            </el-form-item>
            <el-form-item prop="runMode" label="异常条件">
              <el-select
                v-model="selfCheckForm.runMode"
                @change="abnormalChange">
                <el-option value="any" label="只要有异常"></el-option>
                <el-option value="duration" label="持续异常"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item v-if="isDuration" prop="duration" label="异常时间">
              <el-select
                v-model="selfCheckForm.duration">
                <el-option
                  v-for="(duration,index) in durationData"
                  :key="index"
                  :value="duration.value"
                  :label="duration.label"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item prop="isEnable" label="是否启用">
              <el-select v-model="selfCheckForm.isEnable">
                <el-option value="Y" label="启用"></el-option>
                <el-option value="N" label="禁用"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item prop="remark" label="备注">
              <el-input v-model="selfCheckForm.remark" type="textarea" placeholder="请输入房间自检备注"></el-input>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <FormOptBtn @formCancel="selfCheckClose" @formSubmit="selfCheckSubmit"></FormOptBtn>
    </div>
  </div>
</template>

<script>
import Breadcrumb from '../../../../components/breadcrumb/Breadcrumb';
import FormOptBtn from '../../../../components/FormOptBtn';
import { routerMeta } from '../../../../router/routerMeta';
import { commonConfig } from '../../../../config/common';
import { checkRespCorrect, getRoomByIdDetail, messageHandle, paramsTrim } from '../../../../utils';
import { msgCode, msgContent } from '../../../../config/string';

export default {
  name: 'MonitorRoomSelfCheckRuleOpt',
  components: {
    Breadcrumb, FormOptBtn
  },
  data() {
    return {
      breadcrumbHeight: 0,
      roomId: '',
      ruleId: '',
      selfCheckFormRef: 'selfCheckFormRef',
      selfCheckForm: {
        expectedValue: '',
        operators: '',
        runMode: 'any',
        isEnable: 'Y',
        duration: '',
        stateCode: ''
      },
      sceneData: [],
      deviceData: [],
      isFormLoading: false,
      selfCheckRules: {
        name: [{ required: true, message: '请输入自检名称', trigger: 'blur' },
          {
            max: commonConfig.formMaxLength.inputMax,
            message: '自检名称不能超过' + commonConfig.formMaxLength.inputMax + '个字符',
            trigger: 'blur'
          }],
        sceneId: [{ required: true, message: '请选择触发条件', trigger: 'change' }],
        deviceId: [{ required: true, message: '请选择设备名称', trigger: 'change' }],
        stateCode: [{ required: true, message: '请选择自检项', trigger: 'change' }],
        operators: [{ required: true, message: '请选择正常值', trigger: 'change' }],
        expectedValue: [{ required: true, message: '请选择或输入正常值', trigger: 'change' }],
        isEnable: [{ required: true, message: '请选择是否启用', trigger: 'change' }],
        runMode: [{ required: true, message: '请选择异常条件', trigger: 'change' }],
        duration: [{ required: true, message: '请选择异常时间', trigger: 'change' }],
        remark: [
          {
            max: commonConfig.formMaxLength.inputMax,
            message: '备注不能超过' + commonConfig.formMaxLength.inputMax + '个字符',
            trigger: 'blur'
          }
        ]
      },
      isDuration: false,
      selfCheckingItemsData: [],
      valueList: [],
      opsList: [],
      isCheck: '',
      durationData: [],
      roomName: ''
    };
  },
  created() {
    this.initData();
  },
  methods: {
    initData() {
      this.roomId = this.$route.params.rid || '';
      this.ruleId = this.$route.params.sid || '';
      this.isCheck = this.$route.params.isCheck || ''; // 用于判断是不是自检规则菜单跳过来的
      this.getSceneList();
      this.getRoomDeviceList();
      this.getDuration();
      if (this.ruleId) {
        this.getRoomSelfDetail();
      }
      getRoomByIdDetail(this.roomId).then(item => {
        this.roomName = item || '';
      });
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
    // 获取异常时间
    getDuration() {
      API.selfCheckRule.roomSelfCheckRuleDuration().then(resp => {
        if (checkRespCorrect(resp)) {
          this.durationData = (resp.data || []).map(item => {
            return {
              value: item,
              label: item + '分钟'
            };
          });
        } else {
          messageHandle({ code: resp.code, msg: resp.message || msgContent.QUERY });
        }
      }).catch(err => {
        messageHandle({ code: msgCode.SYSTEM });
      });
    },
    // 根据房间ID获取情景
    getSceneList() {
      API.room.roomSceneAll({ roomId: this.roomId }).then(resp => {
        if (checkRespCorrect(resp)) {
          this.sceneData = resp.data || [];
          this.sceneData.push({ sceneId: 'empty', name: '无' }); // todo 因后台现在还没有无，需要前端先写死，以后有传就删除掉这行代码
        } else {
          messageHandle({ code: resp.code, msg: resp.message || msgContent.QUERY });
        }
      }).catch(err => {
        messageHandle({ code: msgCode.SYSTEM });
      });
    },
    // 根据设备ID获取自检项
    getSelfCheckList() {
      API.selfCheckRule.selfCheckItemListByDeviceId({ deviceId: this.selfCheckForm.deviceId }).then(resp => {
        if (checkRespCorrect(resp)) {
          this.selfCheckingItemsData = resp.data || [];
        } else {
          this.selfCheckingItemsData = [];
          this.opsList = [];
          messageHandle({ code: resp.code, msg: resp.message || msgContent.QUERY });
        }
      }).catch(err => {
        messageHandle({ code: msgCode.SYSTEM });
      });
    },
    getRoomSelfDetail() { // 根据自检ID和房间ID查询详情
      API.selfCheckRule.roomSelfCheckRuleDetail({ roomId: this.roomId, ruleId: this.ruleId }).then(resp => {
        if (checkRespCorrect(resp)) {
          const { data = {} } = resp;
          this.selfCheckForm = {
            ...data,
            duration: data.duration || '',
            sceneId: data.sceneId ? data.sceneId : 'empty',
            runMode: data.duration ? 'duration' : 'any'
          };
          this.opsList = data.state || {};
          this.getSelfCheckList();
          this.abnormalChange();
        } else {
          messageHandle({ code: resp.code, msg: resp.message || msgContent.QUERY });
        }
      }).catch(err => {
        messageHandle({ code: msgCode.SYSTEM });
      });
    },
    categoryChang() { // 切换设备
      this.selfCheckForm.expectedValue = '';
      this.selfCheckForm.operators = '';
      this.selfCheckForm.stateCode = '';
      this.getSelfCheckList();
    },
    codeChang() { // 切换自检项
      this.selfCheckForm.expectedValue = '';
      this.selfCheckForm.operators = '';
      this.opsList = (this.selfCheckingItemsData || []).find(item => item.code === this.selfCheckForm.stateCode);
    },
    abnormalChange() { // 切换异常条件
      if (this.selfCheckForm.runMode === 'any') {
        this.isDuration = false;
        this.selfCheckForm.duration = '';
      } else {
        this.isDuration = true;
        (!this.selfCheckForm.duration) && (this.selfCheckForm.duration = (this.durationData.length > 0 ? this.durationData[0].value : ''));
      }
    },
    selfCheckClose() { // 关闭房间自检
      this.$router.go(-1);
      // if (this.isCheck) { //跳转到自检规则菜单里面房间自检详情页面
      //   this.$router.push({
      //     name: routerMeta.systemRoomSelfCheckList.name,
      //     params: this.$route.params
      //   })
      // } else {
      //   this.$router.push({
      //     name: routerMeta.monitorRoomSelfCheck.name,
      //     params: this.$route.params
      //   })
      // }
    },
    selfCheckSubmit() { // 提交房间自检
      this.$refs[this.selfCheckFormRef].validate((valid) => {
        if (!valid) return;
        this.isFormLoading = true;
        const params = {
          ...this.selfCheckForm,
          duration: this.selfCheckForm.duration ? parseInt(this.selfCheckForm.duration) : 0,
          roomId: this.roomId
        };
        paramsTrim(params);
        if (!this.selfCheckForm.id) {
          API.selfCheckRule.roomSelfCheckRuleAdd(params).then(resp => {
            this.isFormLoading = false;
            if (checkRespCorrect(resp)) {
              messageHandle({ code: msgCode.ADD_SAVE, msg: '自检规则新增成功' });
              this.selfCheckClose();
            } else {
              messageHandle({ code: resp.code, msg: resp.message || msgContent.MUTATION });
            }
          }).catch(err => {
            this.isFormLoading = false;
            messageHandle({ code: msgCode.SYSTEM });
          });
        } else {
          API.selfCheckRule.roomSelfCheckRuleEdit(params).then(resp => {
            this.isFormLoading = false;
            if (checkRespCorrect(resp)) {
              messageHandle({ code: msgCode.ADD_SAVE, msg: '自检规则编辑成功' });
              this.selfCheckClose();
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
