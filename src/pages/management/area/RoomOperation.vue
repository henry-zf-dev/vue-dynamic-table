<template>
  <div class="room-operation-page" style="padding-top: 60px">
    <Breadcrumb></Breadcrumb>
    <div v-loading="roomFormLoading">
      <div class="page-container">
        <div class="page-operation-container">
          <el-form
            :ref="roomFormRef"
            :model="roomForm"
            :rules="roomFormRules"
            class="page-operation-form"
            size="medium"
            label-width="100px">
            <div class="header5">基本信息</div>
            <div class="page-operation-divider"></div>
            <el-form-item prop="name" label="房间名称">
              <el-input v-model="roomForm.name" placeholder="如：长安1栋001室"></el-input>
            </el-form-item>
            <el-form-item prop="roomType" label="房间类型">
              <RoomTypeSelect
                :search-info="roomForm"
                :is-all="false"
                class-name="form-page-operation-form-width"
                placer="请选择"></RoomTypeSelect>
            </el-form-item>
            <el-form-item v-if="areaPath" prop="areaId" label="所属区域">
              <AreaCascadeComp
                v-model="roomForm.areaId"
                :area-path="areaPath"></AreaCascadeComp>
            </el-form-item>
            <el-form-item label="房间容量" prop="capacity">
              <el-input-number
                v-model="roomForm.capacity"
                :min="1"
                controls-position="right"
                placeholder="请输入容量"></el-input-number>
            </el-form-item>
            <el-form-item label="系统图">
              <DragFileUpload :file-list="roomForm.pics" accept=".jpg,.jpeg,.png"></DragFileUpload>
            </el-form-item>
            <div class="header5 mar-top-40">其他信息</div>
            <div class="page-operation-divider"></div>
            <!-- //todo oppo这边先注释房间管理员配置-->
            <!--            <el-form-item label="管理者">-->
            <!--              <el-select v-model="roomForm.userIds" multiple collapse-tags placeholder="请选择">-->
            <!--                <el-option v-for="item in userData"-->
            <!--                           :key="item.value"-->
            <!--                           :label="item.label"-->
            <!--                           :value="item.value">-->
            <!--                </el-option>-->
            <!--              </el-select>-->
            <!--            </el-form-item>-->
            <el-form-item prop="remark" label="备注">
              <el-input v-model="roomForm.remark" placeholder="请填写备注" class="areaClass" type="textarea"></el-input>
            </el-form-item>
            <div class="header5 mar-top-40">扩展字段</div>
            <div class="page-operation-divider"></div>
            <ExtentForm :form-item-data="extentFormItem" :form-model="extentFormModel"></ExtentForm>
          </el-form>
        </div>
      </div>
      <FormOptBtn @formCancel="goBack" @formSubmit="roomSubmit"></FormOptBtn>
    </div>
  </div>
</template>

<script>
  import {
    checkRespCorrect,
    messageHandle,
    paramsClean,
    paramsTrim, getUserInfo, deepCopyWithJson
  } from '../../../utils';
  import {rulesInt} from '../../../utils/validate';
  import {commonConfig} from '../../../config/common';
  import {msgCode, msgContent} from '../../../config/string';
  import DragFileUpload from '../../../components/DragFileUpload';
  import {routerMeta} from '../../../router/routerMeta';
  import RoomTypeSelect from '../../../components/RoomTypeSelect';
  import ExtentForm from '../../../components/ExtentForm';
  import Breadcrumb from '../../../components/breadcrumb/Breadcrumb';
  import AreaCascadeComp from '../../../components/AreaCascadeComp';
  import FormOptBtn from '../../../components/FormOptBtn';

  export default {
    name: 'RoomOperation',
    components: {
      DragFileUpload, RoomTypeSelect, ExtentForm,
      Breadcrumb, AreaCascadeComp, FormOptBtn
    },
    data() {
      return {
        editRoom: false,
        areaId: '',
        roomId: '',
        areaPath: null, // 房间所属区域全路径
        reqHeaders: { // 请求接口的额外header设置
          token: getUserInfo().token
        },
        roomFormLoading: false, // 控制表单加载圈
        roomForm: {},
        roomFormRef: 'roomFormRef', // 表单名字
        roomFormRules: { // 非空验证
          name: [{required: true, message: '请输入房间名称', trigger: 'blur'},
            {
              max: commonConfig.formMaxLength.inputMax,
              message: '房间名称不能超过' + commonConfig.formMaxLength.inputMax + '个字符',
              trigger: 'blur'
            }],
          remark: [{
            max: commonConfig.formMaxLength.textareaMax,
            message: '备注不能超过' + commonConfig.formMaxLength.textareaMax + '个字符',
            trigger: 'blur'
          }],
          roomType: [{required: true, message: '请选择房间类型', trigger: 'change'}],
          areaId: [{required: true, message: '请选择区域', trigger: 'change'}],
          capacity: [{required: true, message: '请输入容量', trigger: 'blur'}, {
            validator: rulesInt,
            trigger: 'blur'
          }]
        },
        roomTypeData: [], // 房间类型下拉框
        extentFormItem: [], // 扩展字段数据
        extentFormModel: {}
      };
    },
    created() {
      const {lid = '', rid = ''} = this.$route.params;
      this.editRoom = this.$route.meta.edit;
      this.areaId = lid;
      this.roomId = rid;
      this.initRoomForm();
      this.editRoom ? this.getRoomDetail() : this.getAreaDetail();
      this.getRoomExtentField();
    },
    methods: {
      goBack() {
        this.$router.push({
          name: routerMeta.managementArea.name
        });
      },
      initRoomForm() {
        this.roomForm = {
          areaId: this.areaId,
          name: '',
          roomType: '',
          capacity: '',
          pics: [],
          remark: ''
        };
      },
      getAreaDetail() {
        API.area.areaDetail({id: this.areaId}).then(resp => {
          if (checkRespCorrect(resp)) {
            const {data = {}} = resp;
            const {id, locationIds = []} = data;
            locationIds.push(id);
            this.areaPath = locationIds;
          } else {
            messageHandle({code: resp.code, msg: resp.message || msgContent.QUERY});
          }
        }).catch(err => {
          messageHandle({code: msgCode.SYSTEM});
        });
      },
      getRoomDetail() {
        API.area.roomDetail({id: parseInt(this.roomId)}).then(resp => {
          if (checkRespCorrect(resp)) {
            const {data = {}} = resp;
            const {
              locationIds = [], pics = [],
              capacity, schema = [], serverExt = {}
            } = data;
            this.areaPath = locationIds;
            this.roomForm = {
              ...data,
              areaId: this.areaId,
              pics: pics,
              capacity: parseInt(capacity)
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
      getRoomExtentField() {
        API.setting.customFieldList({pageNo: 1, pageSize: 0}).then(resp => {
          if (checkRespCorrect(resp)) {
            resp.data.items.forEach((item) => {
              if (item.scope === commonConfig.customFieldScope[1].value) {
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
      roomSubmit() {
        this.$refs[this.roomFormRef].validate((valid) => {
          if (!valid) return;
          this.roomFormLoading = true;
          const {
            areaId, name, roomType,
            capacity, pics = [], remark
          } = deepCopyWithJson(this.roomForm);
          const param = {
            pid: areaId,
            name, roomType,
            pics, remark,
            capacity: parseInt(capacity),
            serverExt: this.extentFormModel
          };
          paramsClean(param);
          paramsTrim(param);
          if (!this.editRoom) {
            API.area.roomAdd(param).then(resp => {
              this.roomFormLoading = false;
              if (checkRespCorrect(resp)) {
                messageHandle({code: msgCode.ADD_SAVE, msg: '房间新增成功'});
                this.goBack();
              } else {
                messageHandle({code: resp.code, msg: resp.message || msgContent.MUTATION});
              }
            }).catch(err => {
              this.roomFormLoading = false;
              messageHandle({code: msgCode.SYSTEM});
            });
          } else {
            API.area.roomEdit({
              id: this.roomForm.id,
              ...param
            }).then(resp => {
              this.roomFormLoading = false;
              if (checkRespCorrect(resp)) {
                messageHandle({code: msgCode.HAS_SAVE, msg: '房间编辑成功'});
                this.goBack();
              } else {
                messageHandle({code: resp.code, msg: resp.message || msgContent.MUTATION});
              }
            }).catch(err => {
              this.roomFormLoading = false;
              messageHandle({code: msgCode.SYSTEM});
            });
          }
        });
      }
    }
  };
</script>

<style scoped lang="less">

  .img-class {
    height: 40px;
    border-radius: 0 14px 14px 0;
  }

  .el-icon-upload {
    color: @colorGray70;
    line-height: 35px !important;
    font-size: 39px !important;
  }

  .avatar-uploader .el-upload:hover {
    border-color: @colorPrimary;
  }

  .avatar {
    width: 40px;
    height: 40px;
    display: block;
  }

  .note {
    width: 380px;
    margin-top: 15px;
    font-size: 14px;
    font-weight: 400;
    color: @colorGray70;
    line-height: 22px;
  }
</style>
