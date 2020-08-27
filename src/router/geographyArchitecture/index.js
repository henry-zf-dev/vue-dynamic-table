import {tableIdConfig} from '../../config/common';

export default {
  // 地理建筑
  geographyArchitecture: {
    path: '/geography-architecture',
    name: 'culture.geographyArchitecture',
    parent: 'culture.home',
    relation: 'culture.home',
    meta: {
      title: '地理建筑 | 中华文化',
      label: '地理建筑',
      icon: 'icon-nav-gaojing'
    }
  },
  // 名山大川
  mountainsRivers: {
    path: '/geography-architecture/mountains-rivers',
    name: 'culture.geographyArchitecture.mountainsRivers',
    parent: 'culture.home',
    relation: 'culture.geographyArchitecture',
    meta: {
      title: '名山大川 | 地理建筑',
      label: '名山大川',
      icon: 'icon-nav-gaojing',
      breadcrumb: [
        {
          title: '地理建筑：名山大川'
        }
      ],
      table: [tableIdConfig.mountainsRivers]
    },
    component: () => import('../../pages/geographyArchitecture/mountainsRivers/MountainsRivers.vue')
  },

  // 著名建筑
  famousArchitecture: {
    path: '/geography-architecture/famous-architecture',
    name: 'culture.geographyArchitecture.famousArchitecture',
    parent: 'culture.home',
    relation: 'culture.geographyArchitecture',
    meta: {
      title: '著名建筑 | 地理建筑',
      label: '著名建筑',
      icon: 'icon-nav-gaojing',
      breadcrumb: [
        {
          title: '地理建筑：著名建筑'
        }
      ],
      table: [tableIdConfig.famousArchitecture]
    },
    component: () => import('../../pages/geographyArchitecture/famousArchitecture/FamousArchitecture.vue')
  },
  // 著名建筑详情
  famousArchitectureDetail: {
    path: '/geography-architecture/famous-architecture/:id/detail',
    name: 'culture.geographyArchitecture.famousArchitecture.detail',
    parent: 'culture.home',
    relation: 'culture.geographyArchitecture.famousArchitecture',
    meta: {
      title: '著名建筑详情 | 著名建筑',
      label: '著名建筑详情',
      icon: 'icon-nav-gaojing',
      breadcrumb: [
        {
          title: '地理建筑：著名建筑',
          name: 'culture.geographyArchitecture.famousArchitecture'
        },
        {
          title: '著名建筑详情'
        }
      ]
    },
    component: () => import('../../pages/geographyArchitecture/famousArchitecture/FamousArchitectureDetail.vue')
  },
  // 著名建筑新增
  famousArchitectureAdd: {
    path: '/geography-architecture/famous-architecture/add',
    name: 'culture.geographyArchitecture.famousArchitecture.add',
    parent: 'culture.home',
    relation: 'culture.geographyArchitecture.famousArchitecture',
    meta: {
      title: '著名建筑新增 | 著名建筑',
      label: '著名建筑新增',
      icon: 'icon-nav-gaojing',
      breadcrumb: [
        {
          title: '地理建筑：著名建筑',
          name: 'culture.geographyArchitecture.famousArchitecture'
        },
        {
          title: '著名建筑新增'
        }
      ]
    },
    component: () => import('../../pages/geographyArchitecture/famousArchitecture/FamousArchitectureOpt.vue')
  },
  // 著名建筑编辑
  famousArchitectureEdit: {
    path: '/geography-architecture/famous-architecture/:id/edit',
    name: 'culture.geographyArchitecture.famousArchitecture.edit',
    parent: 'culture.home',
    relation: 'culture.geographyArchitecture.famousArchitecture',
    meta: {
      title: '著名建筑编辑 | 著名建筑',
      label: '著名建筑编辑',
      icon: 'icon-nav-gaojing',
      breadcrumb: [
        {
          title: '地理建筑：著名建筑',
          name: 'culture.geographyArchitecture.famousArchitecture'
        },
        {
          title: '著名建筑编辑'
        }
      ]
    },
    component: () => import('../../pages/geographyArchitecture/famousArchitecture/FamousArchitectureOpt.vue')
  },

  // 地域文化
  regionalCulture: {
    path: '/geography-architecture/regional-culture',
    name: 'culture.geographyArchitecture.regionalCulture',
    parent: 'culture.home',
    relation: 'culture.geographyArchitecture',
    meta: {
      title: '地域文化 | 地理建筑',
      label: '地域文化',
      icon: 'icon-nav-gaojing',
      breadcrumb: [
        {
          title: '地理建筑：地域文化'
        }
      ],
      table: [tableIdConfig.regionalCulture]
    },
    component: () => import('../../pages/geographyArchitecture/regionalCulture/RegionalCulture.vue')
  }
};
