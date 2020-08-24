<template>
  <div :style="{paddingTop: `${breadcrumbHeight}px`}" class="alarm-self-operation-page">
    <Breadcrumb v-model="breadcrumbHeight" :title="titleName"></Breadcrumb>
    <div v-loading="isFormLoading">
      <div class="page-container">
        <div class="page-operation-container">
          <el-form
            :ref="templateFormRef"
            :model="templateForm"
            :rules="templateRule"
            size="medium"
            label-width="100px"
            class="page-operation-form">
            <div class="header5">自检模板</div>
            <div class="page-operation-divider"></div>
            <el-form-item prop="name" label="模板名称">
              <el-input v-model="templateForm.name" type="text"></el-input>
            </el-form-item>
            <el-form-item prop="sceneCode" label="触发场景">
              <el-select v-model="templateForm.sceneCode">
                <el-option
                  v-for="(scene,index) in sceneData"
                  :key="index"
                  :value="scene.code"
                  :label="scene.name"></el-option>
              </el-select>
            </el-form-item>
            <div class="header5 mar-top-40">自检项</div>
            <div class="page-operation-divider"></div>
            <el-form-item class="mar-top" label="设备类型">
              <el-select
                v-model="templateForm.category"
                @change="categoryChang">
                <el-option
                  v-for="device in deviceData"
                  :key="device.code"
                  :value="device.code"
                  :label="device.name"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item prop="brand" label="设备品牌">
              <el-select v-model="templateForm.brand" @change="brandChang">
                <el-option
                  v-for="device in brandData"
                  :key="device.code"
                  :value="device.code"
                  :label="device.name"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="自检项">
              <el-select v-model="templateForm.stateCode" @change="codeChang">
                <el-option
                  v-for="items in selfCheckingItemsData"
                  :key="items.code"
                  :value="items.code"
                  :label="items.name"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item prop="operators" label="条件">
              <el-select v-model="templateForm.operators">
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
                v-model="templateForm.expectedValue">
                <el-option
                  v-for="item in opsList.valueList"
                  :label="item.name"
                  :value="item.value"
                  :key="item.value">
                </el-option>
              </el-select>
              <el-input v-else v-model="templateForm.expectedValue" type="text"></el-input>
            </el-form-item>
            <el-form-item prop="runMode" label="异常条件">
              <el-select
                v-model="templateForm.runMode"
                @change="abnormalChange">
                <el-option value="any" label="只要有异常"></el-option>
                <el-option value="duration" label="持续异常"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item v-if="isDuration" prop="duration" label="异常时间">
              <el-select
                v-model="templateForm.duration">
                <el-option
                  v-for="(duration,index) in durationData"
                  :key="index"
                  :value="duration.value"
                  :label="duration.label"></el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <FormOptBtn @formCancel="selfTemplateClose" @formSubmit="selfTemplateSubmitted"></FormOptBtn>
    </div>
  </div>
</template>

<script>
import { routerMeta } from '../../../../router/routerMeta';
import MultipleSelector from '../../../../components/MultipleSelector';
import FormOptBtn from '../../../../components/FormOptBtn';
import Breadcrumb from '../../../../components/breadcrumb/Breadcrumb';
import { checkRespCorrect, messageHandle, paramsTrim } from '../../../../utils';
import { msgCode, msgContent } from '../../../../config/string';

export default {
  name: 'SelfCheckRuleTemplateOpt',
  components: { MultipleSelector, FormOptBtn, Breadcrumb },
  props: {
    selfTemplateRow: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  data() {
    return {
      breadcrumbHeight: 0,
      routerMeta: routerMeta,
      titleName: '',
      isFormLoading: false,
      isDuration: false,
      templateForm: {
        name: '',
        stateCode: '',
        runMode: 'any',
        brand: '',
        operators: '',
        expectedValue: '',
        duration: ''
      },
      sceneData: [],
      deviceData: [],
      brandData: [],
      durationData: [],
      selfCheckingItemsData: [],
      opsList: [],
      templateFormRef: 'templateFormRef',
      templateRule: {
        name: [{ required: true, message: '请输入自检名称', trigger: 'blur' }],
        sceneCode: [{ required: true, message: '请选择检测场景', trigger: 'change' }],
        category: [{ required: true, message: '请选择设备类型', trigger: 'change' }],
        brand: [{ required: true, message: '请选择设备品牌', trigger: 'change' }],
        stateCode: [{ required: true, message: '请选择自检项', trigger: 'change' }],
        operators: [{ required: true, message: '请选择条件', trigger: 'change' }],
        expectedValue: [{ required: true, message: '请选择或输入正常值', trigger: 'change' }],
        isEnable: [{ required: true, message: '请选择是否启动', trigger: 'change' }],
        runMode: [{ required: true, message: '请选择异常条件', trigger: 'change' }],
        duration: [{ required: true, message: '请选择异常时间', trigger: 'change' }]
      }
    };
  },
  created() {
    this.initData();
  },
  methods: {
    initData() {
      this.selfId = this.$route.params.tid || '';
      this.getSceneList();
      this.getDeviceList();
      this.getDuration();
      if (this.selfId) {
        this.titleName = '编辑自检模板';
        this.getSelfTemplate();
      } else {
        this.titleName = '新增自检模板';
      }
    },
    // 获取设备类型
    getDeviceList() {
      API.device.deviceCategoryList().then(resp => {
        if (checkRespCorrect(resp)) {
          this.deviceData = resp.data || [];
        } else {
          messageHandle({ code: resp.code, msg: resp.message || msgContent.QUERY });
        }
      }).catch(err => {
        messageHandle({ code: msgCode.SYSTEM });
      });
    },
    // 切换自检项
    codeChang() {
      this.templateForm.expectedValue = '';
      this.templateForm.operators = '';
      this.opsList = (this.selfCheckingItemsData || []).find(item => item.code === this.templateForm.stateCode);
    },
    // 切换设备
    categoryChang() {
      this.templateForm.expectedValue = '';
      this.templateForm.operators = '';
      this.templateForm.stateCode = '';
      this.templateForm.brand = '';
      this.getDeviceBrandList();
    },
    // 切换品牌
    brandChang() {
      this.templateForm.expectedValue = '';
      this.templateForm.operators = '';
      this.templateForm.stateCode = '';
      this.getSelfCheckList();
    },
    getDeviceBrandList() {
      API.device.deviceBrandList({ category: this.templateForm.category }).then(resp => {
        if (checkRespCorrect(resp)) {
          this.brandData = resp.data || [];
        } else {
          messageHandle({ code: resp.code, msg: resp.message || msgContent.QUERY });
        }
      }).catch(err => {
        messageHandle({ code: msgCode.SYSTEM });
      });
    },
    // 根据设备ID获取自检项
    getSelfCheckList() {
      API.selfCheckRule.selfCheckItemListByDeviceCategory({
        category: this.templateForm.category,
        brand: this.templateForm.brand
      }).then(resp => {
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
    // 获取自检模板详情
    getSelfTemplate() {
      API.selfCheckRule.ruleTemplateDetail({ id: this.selfId }).then(resp => {
        if (checkRespCorrect(resp)) {
          const { data = {} } = resp;
          this.templateForm = {
            ...data,
            duration: data.duration || '',
            sceneCode: data.sceneCode ? data.sceneCode : 'empty',
            runMode: data.duration ? 'duration' : 'any'
          };
          this.opsList = data.state || {};
          this.getDeviceBrandList();
          this.getSelfCheckList();
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
    // 切换异常条件
    abnormalChange() {
      if (this.templateForm.runMode === 'any') {
        this.isDuration = false;
        this.templateForm.duration = '';
      } else {
        this.isDuration = true;
        (!this.templateForm.duration) && (this.templateForm.duration = (this.durationData.length > 0 ? this.durationData[0].value : ''));
      }
    },
    // 获取情景
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
    selfTemplateClose() {
      this.$router.push({
        name: routerMeta.systemSelfCheckRule.name
      });
    },
    selfTemplateSubmitted() { // 提交
      this.$refs[this.templateFormRef].validate((valid) => {
        if (!valid) return;
        this.isFormLoading = true;
        const params = {
          ...this.templateForm,
          duration: this.templateForm.duration ? parseInt(this.templateForm.duration) : 0
        };
        paramsTrim(params);
        if (this.selfId) {
          API.selfCheckRule.ruleTemplateEdit(params).then(resp => {
            this.isFormLoading = false;
            if (checkRespCorrect(resp)) {
              messageHandle({ code: msgCode.EDIT_SAVE, msg: '自检模板编辑成功' });
              this.selfTemplateClose();
            } else {
              messageHandle({ code: resp.code, msg: resp.message || msgContent.MUTATION });
            }
          }).catch(err => {
            this.isFormLoading = false;
            messageHandle({ code: msgCode.SYSTEM });
          });
        } else {
          API.selfCheckRule.ruleTemplateAdd(params).then(resp => {
            this.isFormLoading = false;
            if (checkRespCorrect(resp)) {
              messageHandle({ code: msgCode.ADD_SAVE, msg: '自检模板新增成功' });
              this.selfTemplateClose();
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

<style scoped>

</style>
