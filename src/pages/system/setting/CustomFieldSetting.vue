<template>
  <div>
    <EZTable
      v-loading="tableLoading"
      :custom-empty="true"
      :hide-filter="true"
      :table-id="tableId"
      :columns="columnConfig"
      :rows="fieldTableData"
      @pageChanged="getCustomFieldList"
      @sizeChanged="getCustomFieldList"
      @sortChanged="getCustomFieldList">
      <div slot="header">
        <div class="pad-top-10 pad-btm-20">
          <span class="font-size-second font-gray-40 font-weight-bold">字段配置为您提供内容展示的灵活性，可在列表中自定义呈现</span>
          <span
            v-if="judgePerm(permConfig.system)"
            class="mar-lft-20 cursor-pointer font-size-second font-color-primary iconfont icon-tianjia font-weight-bold"
            @click="addFieldForm">添加字段</span>
        </div>
      </div>
      <div slot="empty">
        <EmptyContent :opt-data="fieldEmptyBtn"></EmptyContent>
      </div>
    </EZTable>
    <el-dialog
      v-loading="fieldFormLoading"
      :title="isEditField ? '编辑字段' : '新增字段'"
      :visible.sync="showFieldDialog"
      :show-close="false"
      :close-on-press-escape="false"
      width="550px"
      @close="fieldFormCanceled">
      <el-form
        :model="fieldForm"
        :rules="fieldFormRules"
        :ref="fieldFormRef"
        label-width="100px">
        <el-form-item label="字段范围" prop="scope">
          <el-select v-model="fieldForm.scope" class="width-100" placeholder="请选择字段范围">
            <el-option
              v-for="(scope, idx) in commConfig.customFieldScope"
              :label="scope.label"
              :value="scope.value"
              :key="idx"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="字段名称" prop="name">
          <el-input v-model="fieldForm.name" placeholder="请填写字段名称" @change="markChange"></el-input>
        </el-form-item>
        <el-form-item label="字段标识" prop="mark">
          <el-input v-model="fieldForm.mark" placeholder="请填写字段标识"></el-input>
        </el-form-item>
        <el-form-item label="字段类型" prop="dataType">
          <el-select v-model="fieldForm.dataType" class="width-100" placeholder="请选择字段类型">
            <el-option
              v-for="(type, idx) in commConfig.customFieldType"
              :label="type.label"
              :value="type.value"
              :key="idx"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="是否必填">
          <el-radio-group v-model="fieldForm.required">
            <el-radio :label="false">非必填</el-radio>
            <el-radio :label="true">必填</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否显示">
          <el-radio-group v-model="fieldForm.isShow">
            <el-radio :label="false">不显示</el-radio>
            <el-radio :label="true">显示</el-radio>
          </el-radio-group>
        </el-form-item>
        <div v-if="fieldForm.dataType === commConfig.customFieldType[0].value">
          <el-form-item label="字段枚举">
            <EnumDynamic
              :dynamic-data="enumList"
              :data-type="fieldForm.dataType"
              @enumDynamicChanged="enumDynamicChanged">
            </EnumDynamic>
          </el-form-item>
          <el-form-item v-if="enumList.length > 0" label="是否多选">
            <el-radio-group v-model="fieldForm.multiple">
              <el-radio :label="false">单选</el-radio>
              <el-radio :label="true">多选</el-radio>
            </el-radio-group>
          </el-form-item>
        </div>
      </el-form>
      <FormOptBtn
        :is-in-dialog="true"
        @formCancel="fieldFormCanceled"
        @formSubmit="fieldFormSubmitted"></FormOptBtn>
    </el-dialog>
  </div>
</template>

<script>
  import {
    assembleTableOptBtn,
    checkRespCorrect,
    deepCopyWithJson, getTableCfgFromStorage, getTableConfig,
    getTableState,
    judgePermission,
    messageHandle, momentTimeToString,
    paramsTrim, updatePageNo, updateTableState
  } from '../../../utils';
  import {rulesValue} from '../../../utils/validate';
  import {commonConfig, momentFormat, tableIdConfig, tableOptBtnConfig} from '../../../config/common';
  import {msgCode, msgContent} from '../../../config/string';
  import EmptyContent from '../../../components/EmptyContent';
  import FormOptBtn from '../../../components/FormOptBtn';
  import EnumDynamic from '../../../components/EnumDynamic';
  import {commonString} from '../../../config/string';
  import {permissionConfig} from '../../../config/permission';
  import EZTable from '../../../components/table/EZTable';
  import moment from 'moment';
  import {updateRouteParamState} from '../../../modules/urlParamStoreHdl';

  export default {
    name: 'CustomFieldSetting',
    components: {
      FormOptBtn, EnumDynamic, EZTable, EmptyContent
    },
    data() {
      return {
        tableId: tableIdConfig.systemExtFieldConfig,
        columnConfig: [],
        commConfig: commonConfig,
        permConfig: permissionConfig,
        tableLoading: true,
        fieldTableData: [],
        selectedField: {},
        showFieldDialog: false,
        fieldFormLoading: false,
        fieldForm: {},
        enumList: [],
        fieldFormRules: {
          name: [{required: true, message: '请输入字段名称', trigger: 'blur'},
            {
              max: commonConfig.formMaxLength.inputMax,
              message: '字段名称不能超过' + commonConfig.formMaxLength.inputMax + '个字符',
              trigger: 'blur'
            }],
          mark: [{required: true, message: '请输入字段标识', trigger: 'blur'},
            {
              max: commonConfig.formMaxLength.inputMax,
              message: '字段标志不能超过' + commonConfig.formMaxLength.inputMax + '个字符',
              trigger: 'blur'
            }, {
              validator: rulesValue,
              trigger: 'blur'
            }
          ],
          scope: [{required: true, message: '请选择字段范围', trigger: 'change'}],
          dataType: [{required: true, message: '请选择字段类型', trigger: 'change'}]
        },
        fieldFormRef: 'fieldFormRef',
        isEditField: false,
        fieldEmptyBtn: [
          {
            type: 'btn',
            label: '添加字段',
            icon: 'icon-tianjia',
            perm: permissionConfig.system,
            callback: () => {
              this.addFieldForm();
            }
          }
        ]
      };
    },
    activated() {
      this.initTableConfig();
      this.initFieldForm();
      this.getCustomFieldList();
    },
    methods: {
      judgePerm: judgePermission,
      initTableConfig() {
        const assembleConfig = ({columns = [], filters = []}) => {
          this.columnConfig = columns;
          this.filters = filters;
          assembleTableOptBtn(columns, ({type = '', data = {}}) => {
            if (!type) return;
            switch (type) {
              case tableOptBtnConfig.edit.type:
                this.clickOperateBtn(type, data);
                break;
              case tableOptBtnConfig.delete.type:
                this.clickOperateBtn(type, data);
                break;
              default:
                break;
            }
          });
        };
        assembleConfig(getTableCfgFromStorage(this.tableId));
        getTableConfig(this.tableId).then((config) => {
          assembleConfig(config);
        }).catch(err => {
        });
      },
      markChange() { // 字段名称改变时自动转成字段标志
        const pinyin = require('pinyin');
        let mark = '';
        pinyin(this.fieldForm.name, {
          style: pinyin.STYLE_NORMAL // 设置拼音风格
        }).forEach(function(item) {
          mark = mark + item;
        });
        this.fieldForm.mark = mark;
      },
      initFieldForm() {
        this.fieldForm = {
          name: '',
          scope: '',
          mark: '',
          dataType: '',
          required: false,
          isShow: false,
          multiple: false
        };
        this.enumList = [];
      },
      addFieldForm() {
        if (this.isEditField) {
          this.resetFieldForm();
        }
        this.isEditField = false;
        this.showFieldDialog = true;
      },
      resetFieldForm() {
        this.initFieldForm();
        this.$refs[this.fieldFormRef] && (this.$refs[this.fieldFormRef].resetFields());
      },
      getCellLabel(src, val) {
        const obj = src.find(s => {
          return s.value === val;
        }) || {};
        return obj.label || commonString.unknown;
      },
      enumDynamicChanged(operation, idx) {
        switch (operation) {
          case 'add':
            this.enumList.push({value: ''});
            break;
          case 'delete':
            this.enumList.splice(idx, 1);
            break;
          default:
            break;
        }
      },
      getCustomFieldList() {
        this.tableLoading = true;
        const {pageNo = 1, pageSize = 10, filters, sort} = getTableState(this.tableId);
        const params = {
          pageNo, pageSize, filters, sort
        };
        API.setting.customFieldList(params).then(resp => {
          this.tableLoading = false;
          if (checkRespCorrect(resp)) {
            const {items, pageInfo = {}} = resp.data || {};
            this.fieldTableData = (items || []).map(item => {
              return {
                ...item,
                scopeText: this.getCellLabel(this.commConfig.customFieldScope, item.scope),
                dataTypeText: this.getCellLabel(this.commConfig.customFieldType, item.dataType),
                requiredText: item.required ? '是' : '否',
                isShowText: item.isShow ? '显示' : '不显示',
                updatedTime: momentTimeToString(item.updatedTime)
              };
            });
            updateTableState(this.tableId, {total: pageInfo.total || 0});
          } else {
            messageHandle({code: resp.code, msg: resp.message || msgContent.QUERY});
          }
        }).catch(err => {
          this.tableLoading = false;
          messageHandle({code: msgCode.SYSTEM});
        });
      },
      clickOperateBtn(operation, row) {
        const field = deepCopyWithJson(row);
        switch (operation) {
          case 'edit':
            this.isEditField = true;
            this.selectedField = field;// 防止直接修改数据源
            this.fieldForm = field;// 防止直接修改数据源
            this.enumList = (row.symbols || []).map(e => {
              return {value: e};
            });
            this.showFieldDialog = true;
            updateRouteParamState(this.$route.name, {customField: row.id});
            break;
          case 'delete':
            this.$confirm(`确定要删除字段：${row.name}?`, '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消'
            }).then(() => {
              API.setting.customFieldDelete({id: row.id}).then(resp => {
                if (checkRespCorrect(resp)) {
                  messageHandle({code: msgCode.DEL_SAVE, msg: '字段删除成功'});
                  updatePageNo(this.tableId);
                  this.getCustomFieldList();
                  this.resetFieldForm();
                } else {
                  messageHandle({code: resp.code, msg: resp.message || msgContent.MUTATION});
                }
              }).catch(err => {
                messageHandle({code: msgCode.SYSTEM});
              });
            }).catch((err) => {
            });
            break;
          default:
            break;
        }
      },
      fieldFormCanceled() {
        this.showFieldDialog = false;
        updateRouteParamState(this.$route.name, {customField: ''});
      },
      fieldFormSubmitted() {
        this.$refs[this.fieldFormRef].validate((valid) => {
          if (!valid) return;
          const params = {
            ...this.fieldForm,
            symbols: this.enumList.map(e => {
              return e.value;
            })
          };
          paramsTrim(params);
          this.fieldFormLoading = true;
          if (!this.isEditField) {
            API.setting.customFieldAdd(params).then(resp => {
              this.fieldFormLoading = false;
              if (checkRespCorrect(resp)) {
                messageHandle({code: msgCode.ADD_SAVE});
                this.showFieldDialog = false;
                this.getCustomFieldList();
                this.resetFieldForm();
              } else {
                messageHandle({code: resp.code, msg: resp.message || msgContent.MUTATION});
              }
            }).catch(err => {
              messageHandle({code: msgCode.SYSTEM});
            });
          } else {
            API.setting.customFieldEdit({...params, id: this.selectedField.id}).then(resp => {
              this.fieldFormLoading = false;
              if (checkRespCorrect(resp)) {
                messageHandle({code: msgCode.EDIT_SAVE});
                this.showFieldDialog = false;
                this.getCustomFieldList();
              } else {
                messageHandle({code: resp.code, msg: resp.message || msgContent.MUTATION});
              }
            }).catch(err => {
              messageHandle({code: msgCode.SYSTEM});
            });
          }
        });
      }
    }
  };
</script>

<style scoped>

</style>
