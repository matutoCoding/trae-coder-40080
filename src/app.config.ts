export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/cage/index',
    'pages/reagent/index',
    'pages/outbound/index',
    'pages/mine/index',
    'pages/cage-detail/index',
    'pages/booking-confirm/index',
    'pages/my-booking/index',
    'pages/reagent-detail/index',
    'pages/outbound-confirm/index',
    'pages/batch-inbound/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#165dff',
    navigationBarTitleText: '实验动物房管理系统',
    navigationBarTextStyle: 'white',
    backgroundColor: '#f5f6f7'
  },
  tabBar: {
    color: '#86909c',
    selectedColor: '#165dff',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/cage/index',
        text: '笼位预约'
      },
      {
        pagePath: 'pages/reagent/index',
        text: '耗材管理'
      },
      {
        pagePath: 'pages/outbound/index',
        text: '出库管理'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
