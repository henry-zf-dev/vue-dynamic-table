<template>
  <div class="device-management-operation-page" style="padding-top: 60px">
    <Breadcrumb></Breadcrumb>
    <div v-loading="isFormLoading">
      <div class="page-container">
        <div class="page-operation-container">
          <el-form
            :ref="deviceFormRef"
            :model="deviceForm"
            :rules="deviceFormRules"
            class="page-operation-form"
            size="medium"
            label-width="100px">
            <div class="header5">基本信息</div>
            <div class="page-operation-divider"></div>
            <el-form-item label="设备类型">
              <el-input v-model="deviceForm.categoryName" disabled type="text"></el-input>
            </el-form-item>
            <el-form-item label="设备品牌">
              <el-input v-model="deviceForm.brandName" disabled type="text"></el-input>
            </el-form-item>
            <el-form-item label="设备系列">
              <el-input v-model="deviceForm.seriesName" disabled type="text"></el-input>
            </el-form-item>
            <div class="header5 mar-top-40">其他信息</div>
            <div class="page-operation-divider"></div>
            <el-form-item label="设备名称" prop="name">
              <el-input v-model="deviceForm.name" type="text" placeholder="输入名称"></el-input>
            </el-form-item>
            <el-form-item label="设备型号" prop="modelName">
              <el-input v-model="deviceForm.modelName" type="text"></el-input>
            </el-form-item>
            <el-form-item label="附件">
              <DragFileUpload :file-list="deviceForm.pics" accept=".jpg,.jpeg,.png"></DragFileUpload>
            </el-form-item>
            <el-form-item prop="remark" label="备注">
              <el-input v-model="deviceForm.remark" placeholder="请填写备注" class="areaClass" type="textarea"></el-input>
            </el-form-item>
            <div v-if="deviceForm.schema">
              <div class="header5 mar-top-40">扩展字段</div>
              <div class="page-operation-divider"></div>
              <ExtentForm :form-item-data="extentFormItem" :form-model="extentFormModel"></ExtentForm>
            </div>
          </el-form>
        </div>
      </div>
      <FormOptBtn @formCancel="goBack" @formSubmit="deviceSubmit"></FormOptBtn>
    </div>
  </div>
</template>

<script>
  import DragFileUpload from '../../../components/DragFileUpload';
  import ExtentForm from '../../../components/ExtentForm';
  import Breadcrumb from '../../../components/breadcrumb/Breadcrumb';
  import FormOptBtn from '../../../components/FormOptBtn';
  import {routerMeta} from '../../../router/routerMeta';
  import {checkRespCorrect, deepCopyWithJson, messageHandle, paramsTrim} from '../../../utils';
  import {commonConfig} from '../../../config/common';
  import {msgCode, msgContent} from '../../../config/string';

  export default {
    name: 'DeviceOperation',
    components: {
      DragFileUpload, ExtentForm, Breadcrumb, FormOptBtn
    },
    data() {
      return {
        deviceId: '',
        deviceFormRef: 'deviceFormRef',
        deviceForm: {},
        deviceFormRules: {
          name: [{required: true, message: '请输入设备名称', trigger: 'blur'},
            {
              max: commonConfig.formMaxLength.inputMax,
              message: '设备名称不能超过' + commonConfig.formMaxLength.inputMax + '个字符',
              trigger: 'blur'
            }]
        },
        isFormLoading: false,
        extentFormItem: [], // 扩展字段数据
        extentFormModel: {}
      };
    },
    created() {
      this.deviceId = this.$route.params.did;
      this.initDeviceForm();
      this.getDeviceDetail();
      this.getDeviceExtentField();
    },
    methods: {
      goBack() {
        this.$router.push({
          name: routerMeta.managementDevice.name
        });
      },
      initDeviceForm() {
        this.deviceForm = {
          name: '',
          modelName: '',
          pics: [],
          remark: ''
        };
      },
      getDeviceDetail() {
        API.device.deviceDetail({id: this.deviceId}).then(resp => {
          if (checkRespCorrect(resp)) {
            const {data = {}} = resp;
            const {pics = [], schema = [], serverExt = {}} = data;
            this.deviceForm = {
              ...data,
              pics: pics
            };
            const extentFormModel = {};
            schema.forEach((item) => {
              extentFormModel[item.mark] = serverExt[item.mark] || '';
            });
            this.extentFormModel = extentFormModel;
          } else {
            messageHandle({code: resp.code, msg: resp.message || msgContent.QUERY});
          }
        }).catch(err => {
          messageHandle({code: msgCode.SYSTEM});
        });
      },
      // 获取自定义属性数据
      getDeviceExtentField() {
        API.setting.customFieldList({pageNo: 1, pageSize: 0}).then(resp => {
          if (checkRespCorrect(resp)) {
            resp.data.items.forEach((item) => {
              if (item.scope === commonConfig.customFieldScope[2].value) {
                this.extentFormItem.push(item);
              }
            });
          } else {
            messageHandle({code: resp.code, msg: resp.message || msgContent.QUERY});
          }
        }).catch(err => {
          messageHandle({code: msgCode.SYSTEM});
        });
      },
      deviceSubmit() {
        this.$refs[this.deviceFormRef].validate((valid) => {
          if (!valid) return;
          this.isFormLoading = true;
          const {name, modelName, pics = [], remark} = deepCopyWithJson(this.deviceForm);
          const param = {
            id: this.deviceId,
            data: {
              name, modelName, remark,
              pics: JSON.stringify(pics),
              serverExt: this.extentFormModel
            }
          };
          paramsTrim(param);
          API.device.deviceEdit(param).then(resp => {
            this.isFormLoading = false;
            if (checkRespCorrect(resp)) {
              messageHandle({code: msgCode.EDIT_SAVE, msg: '设备编辑成功'});
              this.goBack();
            } else {
              messageHandle({code: resp.code, msg: resp.message || msgContent.MUTATION});
            }
          }).catch(err => {
            this.isFormLoading = false;
            messageHandle({code: msgCode.SYSTEM});
          });
        });
      }
    }
  };

</script>

<style scoped lang="less">

</style>
