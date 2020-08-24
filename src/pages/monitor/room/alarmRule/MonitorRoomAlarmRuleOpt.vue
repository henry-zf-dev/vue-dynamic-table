<template>
  <div :style="{paddingTop: `${breadcrumbHeight}px`}" class="alarm-rule-operation-page">
    <Breadcrumb v-model="breadcrumbHeight" :title="roomName"></Breadcrumb>
    <div v-loading="isFormLoading">
      <div class="page-container">
        <div class="page-operation-container">
          <el-form
            :ref="alarmFormRef"
            :model="alarmForm"
            :rules="alarmFormRules"
            size="medium"
            label-width="110px"
            class="page-operation-alarm">
            <div class="header5">告警设置</div>
            <div class="page-operation-divider"></div>
            <el-form-item prop="name" label="告警名称">
              <el-input v-model="alarmForm.name" type="text" placeholder="请输入告警名称"></el-input>
            </el-form-item>
            <!--            <el-form-item prop="checkIds" label="选择自检">-->
            <!--              <el-input type="text" placeholder="请选择自检项" @focus="selfChecking"></el-input>-->
            <!--              <div>-->
            <!--                <el-tag-->
            <!--                  v-for="tag in tagList"-->
            <!--                  :key="tag.id"-->
            <!--                  :disable-transitions="true"-->
            <!--                  class="mar-rgt-5"-->
            <!--                  type="success"-->
            <!--                  effect="plain"-->
            <!--                  closable-->
            <!--                  @close="tagRemover(tag)">-->
            <!--                  {{ tag.name }}-->
            <!--                </el-tag>-->
            <!--              </div>-->
            <!--            </el-form-item>-->
            <el-form-item prop="existCondition" label="触发条件">
              <el-select
                v-model="alarmForm.existCondition"
                class="search-select">
                <el-option value="Y" label="有"></el-option>
                <el-option value="N" label="无"></el-option>
              </el-select>
              <!--              <el-select-->
              <!--                v-model="alarmForm.triggerConditions"-->
              <!--                class="search-select">-->
              <!--                <el-option value="and" label="全部异常"></el-option>-->
              <!--                <el-option value="or" label="任意一项异常"></el-option>-->
              <!--              </el-select>-->
              <!--              <div class="note">*注：条件“全部异常”意味着以上所有选中的自检项同时发生则会触发告警，“任意一项异常”指当任何一个选中的自检项发生的时候都会触发告警，请谨慎选择。</div>-->
            </el-form-item>
            <el-form-item v-if="isPreconditions" label="房间场景">
              <el-radio-group v-model="alarmForm.sceneCondition">
                <el-radio v-for="item in sceneData" :key="item.sceneId" :label="item.sceneId">{{ item.name }}</el-radio>
              </el-radio-group>
              <!--              <el-checkbox-group-->
              <!--                v-model="alarmForm.sceneCondition"-->
              <!--                :min="0"-->
              <!--                :max="1">-->
              <!--                <el-checkbox v-for="item in sceneData" :label="item.code" :key="item.code">{{ item.name }}</el-checkbox>-->
              <!--              </el-checkbox-group>-->
            </el-form-item>
            <el-form-item v-if="isPreconditions" label="设备状态">
              <el-row v-for="(deviceStatus,index) in deviceStatusData" :key="index" class="pad-top-5">
                <el-col :span="5">
                  <el-select
                    v-model="deviceStatus.deviceId"
                    @change="categoryChang(deviceStatus)">
                    <el-option
                      v-for="(device,index) in deviceData"
                      :key="index"
                      :value="device.id"
                      :label="device.name"
                    ></el-option>
                  </el-select>
                </el-col>
                <el-col :span="5">
                  <el-select v-model="deviceStatus.stateCode" @change="codeChang(deviceStatus)">
                    <el-option
                      v-for="(items,index) in deviceStatus.selfCheckingItemsData"
                      :key="index"
                      :value="items.code"
                      :label="items.name"></el-option>
                  </el-select>
                </el-col>
                <el-col :span="5">
                  <el-select v-model="deviceStatus.operators">
                    <el-option
                      v-for="ops in deviceStatus.opsList.ops"
                      :label="ops.name"
                      :value="ops.value"
                      :key="ops.value">
                    </el-option>
                  </el-select>
                </el-col>
                <el-col :span="5">
                  <el-select
                    v-if="deviceStatus.opsList.valueList"
                    v-model="deviceStatus.expectedValue">
                    <el-option
                      v-for="item in deviceStatus.opsList.valueList"
                      :label="item.name"
                      :value="item.value"
                      :key="item.value">
                    </el-option>
                  </el-select>
                  <el-input v-else v-model="deviceStatus.expectedValue" type="text"></el-input>
                </el-col>
                <el-col :span="4">
                  <div>
                    <el-button slot="reference" type="danger" size="mini" @click="deviceStatusDelete(index)">删除
                    </el-button>
                  </div>
                </el-col>
              </el-row>
              <el-button class="mar-top" type="success" size="small" @click="deviceStatusAdd">添加设备状态
              </el-button>
            </el-form-item>
            <el-form-item label="告警项">
              <el-row>
                <el-col :span="5">
                  <el-select
                    v-model="alarmForm.detection.deviceId"
                    @change="categoryChang">
                    <el-option
                      v-for="(device,index) in deviceData"
                      :key="index"
                      :value="device.id"
                      :label="device.name"></el-option>
                  </el-select>
                </el-col>
                <el-col :span="5">
                  <el-select v-model="alarmForm.detection.stateCode" @change="codeChang">
                    <el-option
                      v-for="(items,index) in selfCheckingItemsData"
                      :key="index"
                      :value="items.code"
                      :label="items.name"></el-option>
                  </el-select>
                </el-col>
                <el-col :span="5">
                  <el-select v-model="alarmForm.detection.operators">
                    <el-option
                      v-for="ops in opsList.ops"
                      :label="ops.name"
                      :value="ops.value"
                      :key="ops.value">
                    </el-option>
                  </el-select>
                </el-col>
                <el-col :span="5">
                  <el-select
                    v-if="opsList.valueList"
                    v-model="alarmForm.detection.expectedValue">
                    <el-option
                      v-for="item in opsList.valueList"
                      :label="item.name"
                      :value="item.value"
                      :key="item.value">
                    </el-option>
                  </el-select>
                  <el-input v-else v-model="alarmForm.detection.expectedValue" type="text"></el-input>
                </el-col>
              </el-row>
            </el-form-item>
            <el-form-item prop="level" label="告警级别">
              <el-select
                v-model="alarmForm.level"
                class="search-select">
                <el-option value="high" class="font-color-danger" label="紧急"></el-option>
                <el-option value="low" label="一般"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item prop="runMode" label="异常条件">
              <el-select
                v-model="alarmForm.runMode"
                @change="abnormalChange">
                <el-option value="any" label="只要有异常"></el-option>
                <el-option value="duration" label="持续异常"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item v-if="isDuration" prop="duration" label="异常时间">
              <el-select
                v-model="alarmForm.duration">
                <el-option
                  v-for="(duration,index) in durationData"
                  :key="index"
                  :value="duration.value"
                  :label="duration.label"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item prop="isEnable" label="是否启用">
              <el-select
                v-model="alarmForm.isEnable"
                class="search-select">
                <el-option value="Y" label="启用"></el-option>
                <el-option value="N" label="禁用"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="告警解决方法">
              <el-input v-model="alarmForm.solutionName" type="textarea" placeholder="请输入告警解决方法"></el-input>
            </el-form-item>
            <el-form-item prop="remark" label="备注">
              <el-input v-model="alarmForm.remark" type="textarea" placeholder="请输入房间告警备注"></el-input>
            </el-form-item>
            <div class="header5 mar-top-40">告警通知</div>
            <div class="page-operation-divider"></div>
            <el-form-item prop="silenceCycle" label="沉默周期">
              <el-select
                v-model="alarmForm.silenceCycle"
                class="search-select">
                <el-option
                  v-for="(duration,index) in silenceCycleData"
                  :key="index"
                  :value="duration.value"
                  :label="duration.label"></el-option>
              </el-select>
              <div class="note">*注：指告警通知在该周期内只发生一次。</div>
            </el-form-item>
            <el-form-item label="通知方式">
              <div>
                <el-checkbox-group v-model="alarmForm.notificationWay">
                  <el-checkbox value="sms" label="sms" border>短信通知</el-checkbox>
                  <el-checkbox value="email" label="email" border>邮件通知</el-checkbox>
                  <el-checkbox value="tt" label="tt" border>TT通知</el-checkbox>
                </el-checkbox-group>
              </div>
            </el-form-item>
            <el-form-item label="通知日期">
              <el-checkbox-group v-model="alarmForm.daysOfWeek">
                <el-checkbox value="1" label="1">周一</el-checkbox>
                <el-checkbox value="2" label="2">周二</el-checkbox>
                <el-checkbox value="3" label="3">周三</el-checkbox>
                <el-checkbox value="4" label="4">周四</el-checkbox>
                <el-checkbox value="5" label="5">周五</el-checkbox>
                <el-checkbox value="6" label="6">周六</el-checkbox>
                <el-checkbox value="7" label="7">周天</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="通知时间">
              <el-time-picker
                v-model="alarmForm.startTime"
                is-range
                value-format="HH:mm:ss"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                placeholder="选择时间范围">
              </el-time-picker>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <FormOptBtn @formCancel="deviceClose" @formSubmit="alarmSubmit"></FormOptBtn>
    </div>
    <el-dialog :visible.sync="isSelfChecking" title="自检项" width="500px">
      <MultipleSelector
        :is-required="true"
        :check-leaf-only="true"
        :src-data="selfCheckingItemsData"
        :select-data="alarmForm.checkIds"
        title="自检项"></MultipleSelector>
      <FormOptBtn
        :is-in-dialog="true"
        class="mar-top-20"
        @formCancel="alarmCanceled"
        @formSubmit="alarmSubmitted"></FormOptBtn>
    </el-dialog>
  </div>
</template>

<script>
  import {routerMeta} from '../../../../router/routerMeta';
  import MultipleSelector from '../../../../components/MultipleSelector';
  import Breadcrumb from '../../../../components/breadcrumb/Breadcrumb';
  import FormOptBtn from '../../../../components/FormOptBtn';
  import {assembleTreeData, checkRespCorrect, getRoomByIdDetail, messageHandle, paramsTrim} from '../../../../utils';
  import {commonConfig} from '../../../../config/common';
  import {msgCode, msgContent} from '../../../../config/string';

  export default {
    name: 'MonitorRoomAlarmRuleOpt',
    components: {MultipleSelector, FormOptBtn, Breadcrumb},
    data() {
      return {
        routerMeta: routerMeta,
        breadcrumbHeight: 0,
        isPreconditions: false,
        isDuration: false,
        alarmId: '', // 告警ID
        selfCheckId: '', // 房间自检ID
        roomId: '', // 房间ID
        roomName: '',
        deviceData: [],
        sceneData: [],
        durationData: [],
        deviceStatusData: [
          {
            stateCode: '',
            operators: '',
            expectedValue: '',
            opsList: [],
            selfCheckingItemsData: [],
            deviceId: ''
          }
        ],
        opsList: [],
        timeType: '1', // 默认为全天
        alarmFormRef: 'alarmFormRef',
        alarmForm: {
          daysOfWeek: [],
          notificationWay: [],
          sceneCondition: '',
          detection: {
            stateCode: '',
            operators: '',
            expectedValue: '',
            deviceId: ''
          },
          startTime: [],
          existCondition: '',
          runMode: '',
          silenceCycle: '',
          level: '',
          isEnable: '',
          duration: ''
          // checkIds: []
          // cycle: '',
          // times: '',
        },
        tagList: [],
        silenceCycleData: [],
        isFormLoading: false,
        isSelfChecking: false,
        alarmFormRules: {
          name: [{required: true, message: '请输入告警名称', trigger: 'blur'},
            {
              max: commonConfig.formMaxLength.inputMax,
              message: '告警名称不能超过' + commonConfig.formMaxLength.inputMax + '个字符',
              trigger: 'blur'
            }],
          checkIds: [{required: true, message: '请选择自检项', trigger: 'change'}],
          triggerConditions: [{required: true, message: '请选择触发条件', trigger: 'change'}],
          silenceCycle: [{required: true, message: '请选择沉默周期', trigger: 'change'}],
          level: [{required: true, message: '请选择告警级别', trigger: 'change'}],
          isEnable: [{required: true, message: '请选择是否启用', trigger: 'blur'}],
          // notificationWay: [{required: true, message: '请选择通知方式', trigger: 'blur'}],
          remark: [
            {
              max: commonConfig.formMaxLength.inputMax,
              message: '备注不能超过' + commonConfig.formMaxLength.inputMax + '个字符',
              trigger: 'blur'
            }
          ]
        },
        // 自检下拉框
        selfCheckingItemsData: [],
        isCheck: ''
      };
    },
    watch: {
      'alarmForm.existCondition'() {
        this.isPreconditions = this.alarmForm.existCondition === 'Y';
      }
    },
    created() {
      this.initData();
    },
    methods: {
      initData() {
        this.alarmId = this.$route.params.aid || ''; // 当前告警规则ID
        this.selfCheckId = this.$route.params.sid || ''; // 自检项ID,用户房间自检和全局自检设为告警使用
        this.roomId = this.$route.params.rid || ''; // 房间ID，用判断面包屑跳转和删除房间告警规则
        this.isCheck = this.$route.params.isCheck || ''; // 用于判断是不是自检规则菜单跳过来的
        getRoomByIdDetail(this.roomId).then(item => {
          this.roomName = item || '';
        });
        // this.selfCheckList();
        this.getSilenceCycle();
        this.getRoomDeviceList();
        this.getRoomSceneList();
        this.getDuration();
        if (this.alarmId && this.alarmId !== '0') {
          this.alarmById();
        } else {
          // 新增时默认赋值
          this.alarmForm = {
            // checkIds: [],
            // cycle: '',
            // times: '',
            sceneCondition: '',
            detection: {
              deviceId: '',
              stateCode: '',
              operators: '',
              expectedValue: ''
            },
            daysOfWeek: ['1', '2', '3', '4', '5', '6', '7'],
            startTime: ['00:00:00', '23:59:59'],
            existCondition: 'N',
            runMode: 'any',
            silenceCycle: '',
            level: 'high',
            isEnable: 'Y',
            duration: '',
            notificationWay: ['sms', 'email', 'tt']
          };
        }
      },
      // 添加设备状态行
      deviceStatusAdd() {
        this.deviceStatusData.push({
          stateCode: '',
          operators: '',
          expectedValue: '',
          opsList: [],
          selfCheckingItemsData: [],
          deviceId: ''
        });
      },
      // 删除设备状态行
      deviceStatusDelete(index) {
        this.$confirm(`确定删除该条设备状态？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }).then(() => {
          this.deviceStatusData.splice(index, 1);
        }).catch(err => {
        });
      },
      // 切换异常条件
      abnormalChange() {
        if (this.alarmForm.runMode === 'any') {
          this.isDuration = false;
          this.alarmForm.duration = '';
        } else {
          this.isDuration = true;
          (!this.alarmForm.duration) && (this.alarmForm.duration = (this.durationData.length > 0 ? this.durationData[0].value : ''));
        }
      },
      // 切换设备
      categoryChang(row) {
        if (Object.prototype.toString.call(row) === '[object Object]') {
          row.expectedValue = '';
          row.operators = '';
          row.stateCode = '';
          row.selfCheckingItemsData = [];
          row.opsList = [];
          this.getSelfCheckList(row);
        } else {
          this.alarmForm.detection.expectedValue = '';
          this.alarmForm.detection.operators = '';
          this.alarmForm.detection.stateCode = '';
          this.getSelfCheckList();
        }
      },
      // 切换检测项
      codeChang(row) {
        if (Object.prototype.toString.call(row) === '[object Object]') {
          row.expectedValue = '';
          row.operators = '';
          row.opsList = (row.selfCheckingItemsData || []).find(item => item.code === row.stateCode);
        } else {
          this.alarmForm.detection.expectedValue = '';
          this.alarmForm.detection.operators = '';
          this.opsList = (this.selfCheckingItemsData || []).find(item => item.code === this.alarmForm.detection.stateCode);
        }
      },
      // 根据房间ID获取设备
      getRoomDeviceList() {
        API.device.deviceListByRoomId({roomId: this.roomId}).then(resp => {
          if (checkRespCorrect(resp)) {
            this.deviceData = resp.data || [];
          } else {
            messageHandle({code: resp.code, msg: resp.message || msgContent.QUERY});
          }
        }).catch(err => {
          messageHandle({code: msgCode.SYSTEM});
        });
      },
      // 根据设备ID获取自检项
      getSelfCheckList(row) {
        let deviceId = this.alarmForm.detection.deviceId;
        if (row) {
          deviceId = row.deviceId || '';
        }
        API.selfCheckRule.selfCheckItemListByDeviceId({deviceId: deviceId}).then(resp => {
          if (row) {
            if (checkRespCorrect(resp)) {
              row.selfCheckingItemsData = resp.data || [];
            } else {
              row.selfCheckingItemsData = [];
              row.opsList = [];
              messageHandle({code: resp.code, msg: resp.message || msgContent.QUERY});
            }
          } else {
            if (checkRespCorrect(resp)) {
              this.selfCheckingItemsData = resp.data || [];
            } else {
              this.selfCheckingItemsData = [];
              this.opsList = [];
              messageHandle({code: resp.code, msg: resp.message || msgContent.QUERY});
            }
          }
        }).catch(err => {
          messageHandle({code: msgCode.SYSTEM});
        });
      },
      // 根据房间ID获取情景
      getRoomSceneList() {
        API.room.roomSceneAll({roomId: this.roomId}).then(resp => {
          if (checkRespCorrect(resp)) {
            this.sceneData = resp.data || [];
            this.sceneData.push({code: 'empty', name: '无'});
          } else {
            messageHandle({code: resp.code, msg: resp.message || msgContent.QUERY});
          }
        }).catch(err => {
          messageHandle({code: msgCode.SYSTEM});
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
            messageHandle({code: resp.code, msg: resp.message || msgContent.QUERY});
          }
        }).catch(err => {
          messageHandle({code: msgCode.SYSTEM});
        });
      },
      // 房间告警处理
      roomAlarmHandle() {
        if (this.selfCheckId) { // 根据自检ID判断是否默认选择
          this.alarmForm.checkIds.push(this.selfCheckId);
          this.packageTag();
        }
      },
      getSilenceCycle() { // 沉默周期
        API.alarmRule.alarmRuleSilenceCycle().then(resp => {
          if (checkRespCorrect(resp)) {
            this.silenceCycleData = (resp.data || []).map(item => {
              return {
                value: item,
                label: item + '分钟'
              };
            });
            if (!this.alarmId) { // 新增时默认给沉默周期赋值为数组的第一个值
              if (this.silenceCycleData.length > 0) {
                this.alarmForm.silenceCycle = this.silenceCycleData[0].value || '';
              }
            }
          } else {
            messageHandle({code: resp.code, msg: resp.message || msgContent.QUERY});
          }
        }).catch(err => {
          messageHandle({code: msgCode.SYSTEM});
        });
      },
      deviceClose(isShow = true) {
        this.$router.go(-1);
      },
      getTimeType() { // 根据选中的时间类型默认赋值时间控件
        switch (this.timeType) {
          case '1':
            this.alarmForm.startTime = ['00:00:00', '23:59:59'];
            break;
          case '2':
            this.alarmForm.startTime = ['00:00:00', '00:00:00'];
            break;
          case '3':
            this.alarmForm.startTime = ['12:00:00', '18:00:00'];
            break;
          default:
            this.alarmForm.startTime = ['18:00:00', '23:59:59'];
            break;
        }
      },
      alarmCanceled() { // 关闭自检项弹窗
        this.isSelfChecking = false;
      },
      selfChecking() { // 触发自检项弹窗
        this.isSelfChecking = true;
      },
      tagRemover(tag) { // 移除tag
        this.alarmForm.checkIds.splice(this.alarmForm.checkIds.indexOf(tag.id), 1);
        this.tagList.splice(this.tagList.indexOf(tag), 1);
      },
      alarmSubmitted() { // 点击自检项确定按钮
        this.packageTag();
        this.isSelfChecking = false;
      },
      packageTag() { // 组装Tag数据源
        this.tagList = []; // 先清空tag数据源
        (this.alarmForm.checkIds || []).forEach(item => {
          if (__.pluck(this.tagList || [], 'id').indexOf(item) >= 0) return; // 已存在就不在执行下面的
          (this.selfCheckingItemsData || []).forEach(itemData => {
            if (this.roomId) { // 房间告警
              if ((itemData.id === parseInt(item))) {
                this.tagList.push({id: item, name: itemData.name});
              }
            } else { // 全局告警
              if ((itemData.children || []).find(i => i.id === item)) {
                this.tagList.push({id: item, name: (itemData.children || []).find(i => i.id === item).name});
              }
            }
          });
        });
      },
      selfCheckList() { // 获取自检列表
        API.selfCheckRule.selfCheckItemByRoomId({roomId: this.roomId}).then(resp => {
          if (checkRespCorrect(resp)) {
            this.selfCheckingItemsData = (resp.data || []).map(item => {
              return {
                ...item,
                name: item.name,
                id: item.id,
                children: item.items
              };
            });
            this.selfCheckingItemsData = assembleTreeData(this.selfCheckingItemsData);
            this.roomAlarmHandle();
          } else {
            messageHandle({code: resp.code, msg: resp.message || msgContent.QUERY});
          }
        }).catch(err => {
          messageHandle({code: msgContent.SYSTEM});
        });
      },
      alarmById() { // 根据ID获取告警规则详情
        API.alarmRule.roomAlarmRuleDetail({id: this.alarmId, roomId: this.roomId}).then(resp => {
          if (checkRespCorrect(resp)) {
            const {data = {}} = resp;
            const {solution = {}, detection = {}, deviceCondition = []} = data;
            this.alarmForm = {
              ...data,
              // times: (data.times || '').toString(),
              silenceCycle: data.silenceCycle || '',
              // cycle: (data.cycle || '').toString(),
              notificationWay: data.notificationWay || [],
              startTime: [data.startTime, data.endTime] || [],
              runMode: data.duration ? 'duration' : 'any',
              // checkIds: __.pluck(data.ruleList || [], 'id'),
              solutionName: solution.description || '',
              sceneCondition: data.sceneCondition || ''
            };
            this.selfCheckingItemsData = detection.state || [];
            this.opsList = (this.selfCheckingItemsData || []).find(item => item.code === this.alarmForm.detection.stateCode);
            this.abnormalChange();
            this.deviceStatusData = (deviceCondition).map(item => {
              item.selfCheckingItemsData = item.state || [];
              item.opsList = (item.selfCheckingItemsData || []).find(items => items.code === item.stateCode);
              return {
                ...item
              };
            });
            // this.tagList = data.ruleList || [];
          } else {
            messageHandle({code: resp.code, msg: resp.message || msgContent.QUERY});
          }
        }).catch(err => {
          messageHandle({code: msgContent.SYSTEM});
        });
      },
      alarmSubmit() { // 提交告警
        const par = {
          // ...this.alarmForm,
          // notificationWay: JSON.stringify(this.alarmForm.notificationWay),
          daysOfWeek: this.alarmForm.daysOfWeek || [],
          existCondition: this.alarmForm.existCondition || '',
          startTime: (this.alarmForm.startTime || [])[0],
          endTime: (this.alarmForm.startTime || [])[1],
          isEnable: this.alarmForm.isEnable || '',
          level: this.alarmForm.level || '',
          name: this.alarmForm.name || '',
          notificationWay: this.alarmForm.notificationWay || [],
          remark: this.alarmForm.remark || '',
          sceneCondition: this.alarmForm.sceneCondition || '',
          silenceCycle: this.alarmForm.silenceCycle || '',
          solution: {
            description: this.alarmForm.solutionName
          },
          duration: this.alarmForm.duration ? parseInt(this.alarmForm.duration) : 0,
          roomId: this.roomId,
          detection: {
            deviceId: this.alarmForm.detection.deviceId || '',
            expectedValue: this.alarmForm.detection.expectedValue || '',
            operators: this.alarmForm.detection.operators || '',
            stateCode: this.alarmForm.detection.stateCode || ''
          },
          deviceCondition: (this.deviceStatusData || []).map(item => {
            if (!item.deviceId && !item.expectedValue && !item.operators && !item.stateCode) return '';
            return {
              deviceId: item.deviceId || '',
              expectedValue: item.expectedValue || '',
              operators: item.operators || '',
              stateCode: item.stateCode || ''
            };
          }).filter(Boolean)
        };
        this.$refs[this.alarmFormRef].validate((valid) => {
          if (!valid) return;
          this.isFormLoading = true;
          paramsTrim(par);
          if (this.alarmId) {
            const params = {
              ...par,
              id: this.alarmId
            };
            // params['solution'].id = this.alarmForm.solution.id || '';
            API.alarmRule.roomAlarmRuleEdit(params).then(resp => {
              this.isFormLoading = false;
              if (checkRespCorrect(resp)) {
                this.deviceClose(false);
                messageHandle({code: msgCode.EDIT_SAVE, msg: '告警规则修改成功'});
              } else {
                messageHandle({code: resp.code, msg: resp.message || msgContent.MUTATION});
              }
            }).catch(err => {
              this.isFormLoading = false;
              messageHandle({code: msgCode.SYSTEM});
            });
          } else {
            API.alarmRule.roomAlarmRuleAdd(par).then(resp => {
              this.isFormLoading = false;
              if (checkRespCorrect(resp)) {
                this.deviceClose(false);
                messageHandle({code: msgCode.ADD_SAVE, msg: '告警规则新增成功'});
              } else {
                messageHandle({code: resp.code, msg: resp.message || msgContent.MUTATION});
              }
            }).catch(err => {
              this.isFormLoading = false;
              messageHandle({code: msgCode.SYSTEM});
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

  .alarm-rule-operation-page {
    .el-checkbox.is-bordered {
      min-width: 164px;
    }

    .el-checkbox.is-bordered + .el-checkbox.is-bordered {
      margin-left: 0 !important;
    }
  }

  .page-operation-alarm {
    .el-input, .el-textarea, .el-select,
    .el-cascader, .el-input-number,
    .el-upload, .el-upload__tip, .el-upload-list {
      width: 40% !important;
      min-width: 300px;
      max-width: 450px;
    }

    .el-select, .el-cascader, .el-input-number {
      .el-input {
        width: 100% !important;
      }
    }

    .el-row {

      .el-col {
        min-width: 230px;
        padding-right: 5px;
      }

      .el-input, .el-select {
        min-width: 220px;
        max-width: 220px
      }
    }
  }
</style>
