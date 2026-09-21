import type { Region, Spot, UserProfile } from '../types/travel'

export const regionList: Region[] = [
  {
    id: 'west-sichuan',
    name: '川西小环线',
    desc: '雪山、草原、异域石林，3天高原山野自驾路线',
    coverImg: '/assets/region/chuanxi.jpg',
    spotCount: 6,
    spots: [
      {
        id: 'spot1',
        regionId: 'west-sichuan',
        name: '四姑娘山双桥沟',
        coverImg: '/assets/images/siguniang.jpg',
        price: 380,
        typeTags: ['雪山', '徒步'],
        bestSeason: '6-10月',
        recommendDuration: 480,
        altitude: '3200m',
        suitablePeople: '自驾/徒步爱好者',
        location: {
          lng: 102.91,
          lat: 31.11,
          address: '阿坝小金县四姑娘山镇'
        },
        driveTime: {
          spot2: 120,
          spot3: 180
        },
        intro:
          '四姑娘山双桥沟以连绵雪山与高山草甸闻名，公路直达景区深处，难度友好，适合初次高原出行。',
        tips: ['高原注意防晒，备薄羽绒服', '不要剧烈奔跑，预防高反', '景区内主要靠观光车，预留充足时间。']
      },
      {
        id: 'spot2',
        regionId: 'west-sichuan',
        name: '墨石公园',
        coverImg: '/assets/images/moshi.jpg',
        price: 120,
        typeTags: ['山野', '徒步'],
        bestSeason: '4-11月',
        recommendDuration: 210,
        altitude: '3500m',
        suitablePeople: '摄影爱好者',
        location: {
          lng: 101.81,
          lat: 30.99,
          address: '道孚八美镇'
        },
        driveTime: {
          spot1: 120,
          spot3: 60
        },
        intro:
          '国内罕见糜棱岩石林，黑色嶙峋岩体仿佛异域星球，拍照出片。',
        tips: ['风大，戴好帽子', '石林区域路面凹凸不平，穿防滑鞋', '正午光线强，建议下午游玩。']
      },
      {
        id: 'spot3',
        regionId: 'west-sichuan',
        name: '鱼子西星空营地',
        coverImg: '/assets/images/yuzixi.jpg',
        price: 80,
        typeTags: ['草原', '露营'],
        bestSeason: '5-10月',
        recommendDuration: 240,
        altitude: '4200m',
        suitablePeople: '星空摄影爱好者',
        location: {
          lng: 101.64,
          lat: 30.21,
          address: '新都桥鱼子西'
        },
        driveTime: {
          spot1: 180,
          spot2: 60,
          spot4: 40
        },
        intro: '360°观景平台，可远眺贡嘎雪山，日落与星空是核心看点。',
        tips: ['夜晚温度极低，务必带厚外套', '天气多变，提前查天气预报', '尽量不要独自露营。']
      },
      {
        id: 'spot4',
        regionId: 'west-sichuan',
        name: '塔公草原',
        coverImg: '/assets/images/tagong.jpg',
        price: 100,
        typeTags: ['草原', '山野'],
        bestSeason: '6-9月',
        recommendDuration: 240,
        altitude: '3730m',
        suitablePeople: '自驾休闲游客',
        location: {
          lng: 101.53,
          lat: 30.32,
          address: '塔公镇'
        },
        driveTime: {
          spot3: 40,
          spot12: 30
        },
        intro:
          '背靠雅拉雪山的高山草原，搭配藏式寺庙，感受川西藏地风光。',
        tips: ['尊重当地藏族习俗，不随意踩踏经幡', '夏季草原蚊虫多，备好驱蚊液', '骑马提前谈好价格。']
      },
      {
        id: 'spot12',
        regionId: 'west-sichuan',
        name: '新都桥',
        coverImg: '/assets/images/xinduqiao.jpg',
        price: 0,
        typeTags: ['草原', '人文', '摄影'],
        bestSeason: '9-10月秋季',
        recommendDuration: 240,
        altitude: '3300m',
        suitablePeople: '摄影与自驾游客',
        location: {
          lng: 101.48,
          lat: 30.04,
          address: '新都桥镇'
        },
        driveTime: {
          spot4: 30,
          spot13: 90
        },
        intro: '摄影师天堂，柏杨、藏寨、远山，秋季黄叶绝美。',
        tips: ['沿途路边风景免费，不要随意进入私人藏寨。']
      },
      {
        id: 'spot13',
        regionId: 'west-sichuan',
        name: '木格措',
        coverImg: '/assets/images/mugecuo.jpg',
        price: 195,
        typeTags: ['雪山', '湖泊'],
        bestSeason: '6-10月',
        recommendDuration: 480,
        altitude: '3700m',
        suitablePeople: '家庭自驾游客',
        location: {
          lng: 101.83,
          lat: 30.17,
          address: '康定木格措'
        },
        driveTime: {
          spot1: 200,
          spot12: 90
        },
        intro: '高原大型高山湖泊，湖水碧蓝，搭配雪山森林。',
        tips: ['景区很大，观光车时间久，预留一整天。']
      }
    ]
  },
  {
    id: 'yangshuo',
    name: '桂北阳朔',
    desc: '喀斯特山水田园，竹筏漂流，慢游漓江',
    coverImg: '/assets/region/yangshuo.jpg',
    spotCount: 7,
    spots: [
      {
        id: 'spot5',
        regionId: 'yangshuo',
        name: '漓江竹筏段（兴坪-九马画山）',
        coverImg: '/assets/images/lijiang.jpg',
        price: 190,
        typeTags: ['喀斯特', '漂流', '徒步'],
        bestSeason: '3-5月、9-11月',
        recommendDuration: 120,
        altitude: '低海拔',
        suitablePeople: '全年龄段',
        location: {
          lng: 110.49,
          lat: 24.89,
          address: '桂林阳朔兴坪镇'
        },
        driveTime: {
          spot6: 25,
          spot7: 40,
          spot8: 5
        },
        intro:
          '两岸连绵喀斯特峰林，山水如画，竹筏慢游感受漓江精华。',
        tips: ['带雨衣，江上容易遇阵雨', '竹筏上手机做好防水', '水位随季节变化。']
      },
      {
        id: 'spot6',
        regionId: 'yangshuo',
        name: '遇龙河竹筏漂流',
        coverImg: '/assets/images/yulonghe.jpg',
        price: 160,
        typeTags: ['喀斯特', '漂流'],
        bestSeason: '4-10月',
        recommendDuration: 90,
        altitude: '低海拔',
        suitablePeople: '家庭休闲游客',
        location: {
          lng: 110.42,
          lat: 24.77,
          address: '阳朔遇龙河'
        },
        driveTime: {
          spot5: 25,
          spot7: 20,
          spot11: 15
        },
        intro:
          '人工竹筏，安静田园风光，两岸稻田和小山，比漓江更静谧。',
        tips: ['竹筏限2人，体重差不能过大；雨季水位上涨会停漂。']
      },
      {
        id: 'spot7',
        regionId: 'yangshuo',
        name: '十里画廊',
        coverImg: '/assets/images/shili.jpg',
        price: 0,
        typeTags: ['喀斯特', '骑行'],
        bestSeason: '全年',
        recommendDuration: 240,
        altitude: '低海拔',
        suitablePeople: '骑行与休闲游客',
        location: {
          lng: 110.48,
          lat: 24.76,
          address: '阳朔十里画廊'
        },
        driveTime: {
          spot5: 40,
          spot9: 25,
          spot11: 12
        },
        intro: '沿着公路骑行，沿路分布多个小景点，适合半日休闲。',
        tips: ['租电动车注意电量，路边很多收费小景点按需选择。']
      },
      {
        id: 'spot8',
        regionId: 'yangshuo',
        name: '兴坪古镇',
        coverImg: '/assets/images/xingping.jpg',
        price: 0,
        typeTags: ['古镇', '人文'],
        bestSeason: '全年',
        recommendDuration: 120,
        altitude: '低海拔',
        suitablePeople: '人文与摄影爱好者',
        location: {
          lng: 110.51,
          lat: 24.88,
          address: '兴坪古镇'
        },
        driveTime: {
          spot5: 5,
          spot10: 10
        },
        intro: '千年古镇，20元人民币背景就在古镇附近。',
        tips: ['傍晚人少，拍照更好看，古镇不需要门票。']
      },
      {
        id: 'spot9',
        regionId: 'yangshuo',
        name: '银子岩溶洞',
        coverImg: '/assets/images/yinziyan.jpg',
        price: 110,
        typeTags: ['喀斯特', '溶洞'],
        bestSeason: '全年',
        recommendDuration: 90,
        altitude: '低海拔',
        suitablePeople: '亲子与休闲游客',
        location: {
          lng: 110.44,
          lat: 24.72,
          address: '银子岩'
        },
        driveTime: {
          spot5: 50,
          spot7: 25
        },
        intro: '大型喀斯特溶洞，钟乳石晶莹闪亮，洞内恒温。',
        tips: ['洞内温度低，带薄外套；跟着导游路线走，不要脱离队伍。']
      },
      {
        id: 'spot10',
        regionId: 'yangshuo',
        name: '老寨山',
        coverImg: '/assets/images/laozhaishan.jpg',
        price: 0,
        typeTags: ['徒步', '喀斯特'],
        bestSeason: '3-11月',
        recommendDuration: 120,
        altitude: '低海拔',
        suitablePeople: '轻户外爱好者',
        location: {
          lng: 110.5,
          lat: 24.89,
          address: '兴坪老寨山'
        },
        driveTime: {
          spot5: 10,
          spot8: 10
        },
        intro: '登高俯瞰漓江湾，免费徒步点，日落观景绝佳。',
        tips: ['山路陡峭，下山注意安全，不建议天黑登山。']
      },
      {
        id: 'spot11',
        regionId: 'yangshuo',
        name: '西街',
        coverImg: '/assets/images/xijie.jpg',
        price: 0,
        typeTags: ['古镇', '人文'],
        bestSeason: '全年',
        recommendDuration: 120,
        altitude: '低海拔',
        suitablePeople: '夜间休闲游客',
        location: {
          lng: 110.5,
          lat: 24.77,
          address: '阳朔西街'
        },
        driveTime: {
          spot5: 45,
          spot6: 15
        },
        intro: '阳朔老牌商业街，夜晚热闹，适合逛吃。',
        tips: ['晚上游客多，注意随身财物。']
      }
    ]
  },
  {
    id: 'chenzhou',
    name: '郴州山野',
    desc: '雾漫东江，丹霞红岩，南方高山草原',
    coverImg: '/assets/region/chenzhou.jpg',
    spotCount: 5,
    spots: [
      {
        id: 'spot14',
        regionId: 'chenzhou',
        name: '东江湖',
        coverImg: '/assets/images/xiaodongjiang.jpg',
        price: 128,
        typeTags: ['湖泊', '徒步'],
        bestSeason: '4-10月清晨',
        recommendDuration: 240,
        altitude: '低海拔',
        suitablePeople: '摄影爱好者',
        location: {
          lng: 113.28,
          lat: 25.79,
          address: '郴州资兴东江湖'
        },
        driveTime: {
          'cz-gaoyiling': 80,
          'cz-bianjiang': 35
        },
        intro: '清晨湖面起雾，渔夫撒网，国内知名山水晨景。',
        tips: ['看雾需要早起，清晨气温偏低', '坐船注意救生衣', '旺季提前预约门票。']
      },
      {
        id: 'cz-gaoyiling',
        regionId: 'chenzhou',
        name: '高椅岭',
        coverImg: '/assets/images/gaoyiling.jpg',
        price: 0,
        typeTags: ['丹霞', '徒步'],
        bestSeason: '3-11月',
        recommendDuration: 210,
        altitude: '中低海拔',
        suitablePeople: '户外徒步爱好者',
        location: {
          lng: 113.18,
          lat: 25.84,
          address: '苏仙区高椅岭'
        },
        driveTime: {
          spot14: 80,
          'cz-yangtianhu': 120
        },
        intro: '红岩绿水交错，山脊线条鲜明，是郴州极具辨识度的丹霞徒步地。',
        tips: ['山脊无遮挡，做好防晒', '雨后岩面湿滑', '不要跨越安全围栏。']
      },
      {
        id: 'cz-yangtianhu',
        regionId: 'chenzhou',
        name: '仰天湖大草原',
        coverImg: '/assets/images/yangtianhu.jpg',
        price: 120,
        typeTags: ['草原', '露营'],
        bestSeason: '5-10月',
        recommendDuration: 240,
        altitude: '1350m',
        suitablePeople: '亲子与露营游客',
        location: {
          lng: 112.93,
          lat: 25.55,
          address: '北湖区仰天湖'
        },
        driveTime: {
          'cz-gaoyiling': 120,
          'cz-huilongshan': 100
        },
        intro: '南方少见的高山草原，风车、云海与起伏草甸构成开阔视野。',
        tips: ['山顶天气变化快，备防风外套', '露营提前确认营位', '不要进入未开放草场。']
      },
      {
        id: 'cz-bianjiang',
        regionId: 'chenzhou',
        name: '便江风景区',
        coverImg: '/assets/images/bianjiang.jpg',
        price: 60,
        typeTags: ['山水', '摄影'],
        bestSeason: '4-11月',
        recommendDuration: 180,
        altitude: '低海拔',
        suitablePeople: '休闲摄影游客',
        location: {
          lng: 113.11,
          lat: 26.13,
          address: '永兴县便江'
        },
        driveTime: {
          spot14: 35,
          'cz-huilongshan': 90
        },
        intro: '丹霞地貌沿江铺展，乘船慢游可看到红岩、峡谷与古村。',
        tips: ['船程受水位影响，出发前确认班次。']
      },
      {
        id: 'cz-huilongshan',
        regionId: 'chenzhou',
        name: '回龙山',
        coverImg: '/assets/images/huilongshan.jpg',
        price: 45,
        typeTags: ['山野', '云海'],
        bestSeason: '4-10月',
        recommendDuration: 180,
        altitude: '1420m',
        suitablePeople: '登山观景游客',
        location: {
          lng: 113.27,
          lat: 25.62,
          address: '资兴回龙山'
        },
        driveTime: {
          'cz-yangtianhu': 100,
          'cz-bianjiang': 90
        },
        intro: '山势开阔，清晨常见云海，是郴州周边轻登山目的地。',
        tips: ['山上温度低，日出前登山需带保暖衣物。']
      }
    ]
  },
  {
    id: 'linan',
    name: '浙西临安',
    desc: '江南峡谷溪流，竹海森林，轻松轻徒步',
    coverImg: '/assets/region/linan.jpg',
    spotCount: 5,
    spots: [
      {
        id: 'spot15',
        regionId: 'linan',
        name: '太湖源',
        coverImg: '/assets/images/taihuyuan.jpg',
        price: 85,
        typeTags: ['森林', '徒步'],
        bestSeason: '5-10月',
        recommendDuration: 180,
        altitude: '中低海拔',
        suitablePeople: '亲子轻徒步',
        location: {
          lng: 119.47,
          lat: 30.18,
          address: '临安太湖源'
        },
        driveTime: {
          'la-damingshan': 55,
          'la-zhuhai': 70
        },
        intro: '茂密竹海、山涧溪流，难度低，适合短途休闲徒步。',
        tips: ['雨后山路湿滑，穿防滑鞋', '夏季注意防蛇虫', '沿着步道不要进入未开发野路。']
      },
      {
        id: 'la-zhexidaxiagu',
        regionId: 'linan',
        name: '浙西大峡谷',
        coverImg: '/assets/images/zhexidaxiagu.jpg',
        price: 130,
        typeTags: ['峡谷', '徒步'],
        bestSeason: '5-10月',
        recommendDuration: 240,
        altitude: '中低海拔',
        suitablePeople: '轻户外爱好者',
        location: {
          lng: 119.17,
          lat: 30.31,
          address: '临安龙岗镇'
        },
        driveTime: {
          spot15: 75,
          'la-damingshan': 65
        },
        intro: '峡谷、溪流与瀑布串联成清凉步道，夏季避暑体验突出。',
        tips: ['溪谷湿度高，穿防滑鞋', '暴雨天气不要进入峡谷', '备一套替换衣物。']
      },
      {
        id: 'la-zhuhai',
        regionId: 'linan',
        name: '万亩竹海',
        coverImg: '/assets/images/zhuhai.jpg',
        price: 40,
        typeTags: ['森林', '竹海'],
        bestSeason: '4-11月',
        recommendDuration: 150,
        altitude: '中低海拔',
        suitablePeople: '休闲散步游客',
        location: {
          lng: 119.6,
          lat: 30.4,
          address: '临安太湖源镇'
        },
        driveTime: {
          spot15: 70,
          'la-qingshanhu': 45
        },
        intro: '大片竹林覆盖山丘，林间步道清凉安静，适合慢慢步行与拍照。',
        tips: ['林间蚊虫较多', '雨后竹叶湿滑', '不要偏离开放步道。']
      },
      {
        id: 'la-damingshan',
        regionId: 'linan',
        name: '大明山',
        coverImg: '/assets/images/damingshan.jpg',
        price: 110,
        typeTags: ['山野', '徒步', '森林'],
        bestSeason: '4-11月',
        recommendDuration: 480,
        altitude: '1200m',
        suitablePeople: '登山与摄影游客',
        location: {
          lng: 118.99,
          lat: 30.03,
          address: '临安清凉峰镇'
        },
        driveTime: {
          spot15: 55,
          'la-zhexidaxiagu': 65
        },
        intro: '峡谷、草甸与森林层次丰富，是临安代表性山野目的地。',
        tips: ['索道和步道组合游玩，预留大半天时间。']
      },
      {
        id: 'la-qingshanhu',
        regionId: 'linan',
        name: '青山湖水上森林',
        coverImg: '/assets/images/qingshanhu.jpg',
        price: 50,
        typeTags: ['森林', '湖泊'],
        bestSeason: '3-11月',
        recommendDuration: 180,
        altitude: '低海拔',
        suitablePeople: '亲子与休闲游客',
        location: {
          lng: 119.72,
          lat: 30.26,
          address: '临安青山湖'
        },
        driveTime: {
          'la-zhuhai': 45,
          spot15: 60
        },
        intro: '水上森林与环湖绿道相连，适合轻松散步、骑行和亲子游。',
        tips: ['环湖区域较大，骑行比步行更省力。']
      }
    ]
  }
]

export const destinationList: Spot[] = regionList.flatMap((region) => region.spots)

export const mockUser: UserProfile = {
  id: 'u001',
  nickname: '山野旅行者',
  avatar: '/assets/region/chuanxi.jpg',
  favoriteSpotIds: [],
  tripList: [],
  packingList: [],
  customItems: []
}

export function getSpotById(spotId: string): Spot | undefined {
  return destinationList.find((spot) => spot.id === spotId)
}

export function getRegionById(regionId: string): Region | undefined {
  return regionList.find((region) => region.id === regionId)
}

export function getRegionBySpotId(spotId: string): Region | undefined {
  return regionList.find((region) =>
    region.spots.some((spot) => spot.id === spotId)
  )
}
