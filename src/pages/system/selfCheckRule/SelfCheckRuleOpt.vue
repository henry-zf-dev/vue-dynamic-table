<template>
  <div class="alarm-self-operation-page" style="padding-top: 60px">
    <Breadcrumb></Breadcrumb>
    <div v-loading="isFormLoading">
      <div class="page-container">
        <div class="page-operation-container">
          <el-form
            :ref="selfCheckFormRef"
            :model="selfCheckForm"
            :rules="selfCheckRule"
            size="medium"
            label-width="100px"
            class="page-operation-form">
            <div class="header5">自检规则</div>
            <div class="page-operation-divider"></div>
            <el-form-item prop="name" label="自检名称">
              <el-input v-model="selfCheckForm.name" type="text"></el-input>
            </el-form-item>
            <el-form-item prop="sceneCode" label="触发场景">
              <el-select
                :disabled="selfCheckForm.isEditable==='Y'?false:true"
                v-model="selfCheckForm.sceneCode">
                <el-option
                  v-for="(scene,index) in sceneData"
                  :key="index"
                  :value="scene.code"
                  :label="scene.name"></el-option>
              </el-select>
            </el-form-item>
            <div class="header5 mar-top-40">自检设备</div>
            <div class="page-operation-divider"></div>
            <el-form-item v-if="selfCheckForm.conditionDeviceCategoryName" label="触发设备">
              <el-input
                :disabled="selfCheckForm.isEditable==='Y'?false:true"
                v-model="selfCheckForm.conditionDeviceCategoryName"
                type="text"></el-input>
            </el-form-item>
            <el-form-item class="mar-top" label="设备类型">
              <el-input :disabled="true" v-model="selfCheckForm.categoryName" type="text"></el-input>
            </el-form-item>
            <el-form-item v-if="selfCheckForm.state" label="自检项">
              <el-input :disabled="true" v-model="selfCheckForm.state.name" type="text"></el-input>
            </el-form-item>
            <el-form-item label="条件">
              <el-select v-model="selfCheckForm.operators">
                <el-option
                  v-for="ops in selfCheckForm.state.ops"
                  :label="ops.name"
                  :value="ops.value"
                  :key="ops.value">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item prop="expectedValue" label="正常值">
              <el-select
                v-if="selfCheckForm.state.valueList"
                v-model="selfCheckForm.expectedValue">
                <el-option
                  v-for="item in selfCheckForm.state.valueList"
                  :label="item.name"
                  :value="item.value"
                  :key="item.value">
                </el-option>
              </el-select>
              <el-input v-else v-model="selfCheckForm.expectedValue" class="mar-top-10" type="text"></el-input>
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
              <el-input v-model="selfCheckForm.remark" type="textarea" placeholder="请输入全局自检备注"></el-input>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <FormOptBtn @formCancel="selfCheckClose" @formSubmit="selfCheckSubmitted"></FormOptBtn>
    </div>
  </div>
</template>

<script>
import { routerMeta } from '../../../router/routerMeta';
import MultipleSelector from '../../../components/MultipleSelector';
import FormOptBtn from '../../../components/FormOptBtn';
import Breadcrumb from '../../../components/breadcrumb/Breadcrumb';
import { checkRespCorrect, messageHandle, paramsTrim } from '../../../utils';
import { msgCode, msgContent } from '../../../config/string';
import { commonConfig } from '../../../config/common';

export default {
  name: 'SelfCheckRuleOpt',
  components: { MultipleSelector, FormOptBtn, Breadcrumb },
  data() {
    return {
      routerMeta: routerMeta,
      isFormLoading: false,
      isDuration: false,
      selfCheckForm: {
        name: '',
        state: {
          ops: [{ name: '', value: '' }],
          valueList: [{ name: '', value: '' }],
          name: ''
        },
        runMode: '',
        duration: ''
      },
      selfCheckId: '',
      sceneData: [],
      durationData: [],
      selfCheckFormRef: 'selfCheckFormRef',
      selfCheckRule: {
        name: [{ required: true, message: '请输入自检名称', trigger: 'blur' }],
        sceneCode: [{ required: true, message: '请选择检测场景', trigger: 'change' }],
        expectedValue: [{ required: true, message: '请选择或输入正常值', trigger: 'change' }],
        runMode: [{ required: true, message: '请选择异常条件', trigger: 'change' }],
        duration: [{ required: true, message: '请选择异常时间', trigger: 'change' }],
        isEnable: [{ required: true, message: '请选择是否启动', trigger: 'change' }],
        remark: [
          {
            max: commonConfig.formMaxLength.inputMax,
            message: '备注不能超过' + commonConfig.formMaxLength.inputMax + '个字符',
            trigger: 'blur'
          }
        ]
      }
    };
  },
  created() {
    this.selfCheckId = this.$route.params.sid;
    this.getSelfCheck();
    this.getSceneList();
    this.getDuration();
  },
  methods: {
    getSelfCheck() {
      API.selfCheckRule.globalSelfCheckRuleDetail({ id: this.selfCheckId }).then(resp => {
        if (checkRespCorrect(resp)) {
          const { data = {} } = resp;
          const { state = {} } = data;
          this.selfCheckForm = {
            ...data,
            duration: data.duration || '',
            sceneCode: data.sceneCode ? data.sceneCode : 'empty',
            runMode: data.duration ? 'duration' : 'any'
          };
          this.selfCheckForm.ops = state.ops;
          this.selfCheckForm.stateName = state.name; // 检查项
          this.abnormalChange();
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
    getSceneList() {
      API.selfCheckRule.globalSelfCheckTriggerScene().then(resp => {
        if (checkRespCorrect(resp)) {
          this.sceneData = resp.data || [];
        } else {
          messageHandle({ code: resp.code, msg: resp.message || msgContent.QUERY });
        }
      }).catch(err => {
        messageHandle({ code: msgCode.SYSTEM });
      });
    },
    selfCheckClose() {
      this.$router.push({
        name: routerMeta.systemSelfCheckRule.name
      });
    },
    abnormalChange() {
      if (this.selfCheckForm.runMode === 'any') {
        this.isDuration = false;
        this.selfCheckForm.duration = '';
      } else {
        this.isDuration = true;
        (!this.selfCheckForm.duration) && (this.selfCheckForm.duration = (this.durationData.length > 0 ? this.durationData[0].value : ''));
      }
    },
    selfCheckSubmitted() { // 提交
      this.$refs[this.selfCheckFormRef].validate((valid) => {
        if (!valid) return;
        this.isFormLoading = true;
        const params = {
          id: this.selfCheckForm.id,
          expectedValue: this.selfCheckForm.expectedValue,
          name: this.selfCheckForm.name,
          operators: this.selfCheckForm.operators,
          isEnable: this.selfCheckForm.isEnable,
          sceneCode: this.selfCheckForm.sceneCode,
          duration: this.selfCheckForm.duration ? parseInt(this.selfCheckForm.duration) : 0,
          remark: this.selfCheckForm.remark || ''
        };
        paramsTrim(params);
        API.selfCheckRule.globalSelfCheckRuleEdit(params).then(resp => {
          this.isFormLoading = false;
          if (checkRespCorrect(resp)) {
            messageHandle({ code: msgCode.EDIT_SAVE, msg: '自检项编辑成功' });
            this.selfCheckClose();
          } else {
            messageHandle({ code: resp.code, msg: resp.message || msgContent.MUTATION });
          }
        }).catch(err => {
          this.isFormLoading = false;
          messageHandle({ code: msgCode.SYSTEM });
        });
      });
    }
  }
};
</script>

<style scoped>

</style>
