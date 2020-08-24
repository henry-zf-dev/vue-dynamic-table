<template>
  <el-cascader
    v-model="model"
    :props="{
      checkStrictly: true,
      label: 'name',
      value: 'id',
      lazy: true,
      lazyLoad: loadAreaData
    }"
    size="small"
    show-all-levels
    clearable
    @change="areaChange">
  </el-cascader>
</template>

<script>
  import {checkRespCorrect, messageHandle} from '../utils';
  import {msgCode, msgContent} from '../config/string';

  export default {
    name: 'AreaCascadeComp',
    model: {
      event: 'change'
    },
    props: {
      areaPath: {
        type: Array,
        default: () => {
          return [];
        }
      },
      size: {
        type: String,
        default: () => {
          return 'medium';
        }
      }
    },
    data() {
      return {
        model: []
      };
    },
    created() {
      this.model = this.areaPath;
    },
    methods: {
      getAreaByPid(pid) {
        return new Promise(function(resolve, reject) {
          API.area.areaByPid({pid: pid || 0}).then(resp => {
            if (checkRespCorrect(resp)) {
              resolve(resp.data || []);
            } else {
              messageHandle({code: resp.code, msg: resp.message || msgContent.QUERY});
              reject();
            }
          }).catch(err => {
            messageHandle({code: msgCode.SYSTEM});
            reject();
          });
        });
      },
      loadAreaData(node, resolve) {
        const {level = 0, data = {}} = node;
        this.getAreaByPid(data.id).then((area = []) => {
          resolve(area.map(a => {
            return {
              ...a,
              leaf: a.hasChild === 'N'
            };
          }));
        }).catch(err => {
          resolve([]);
        });
      },
      areaChange(val = []) {
        this.$emit('change', __.last(val) || '');
      }
    }
  };
</script>

<style scoped>

</style>
