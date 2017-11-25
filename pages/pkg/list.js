//index.js
//获取应用实例
const app = getApp();
let sign = wx.getStorageSync('sign');
//form_type:1   // 1照片，2姓氏、头像、背景，3姓名
Page({
  data: {
      pkgList:[],
      url:'shanmeng/list/pkg-face-list?id={id}&page={page}&per-page=10',
      scrollTop : 0,
      scrollHeight:0,
      type:'',
      nextPage:0,
      noMore:false
  },
  loadList:function (page) {
      var that = this;
      let sign = wx.getStorageSync('sign');
      if(that.data.noMore || this.data.currentPage == page){
          return false;
      }
      this.data.currentPage = page;
      app.showLoading();
     
      var url = this.data.url.replace(/\{page\}/,page);
      url = app.globalData.baseUrl+url;
      console.log("detail:", url + '&sign=' + sign + '&operator_id=' + app.data.kid)
      wx.request({
        url: url + '&sign=' + sign + '&operator_id=' + app.data.kid,
          header: {
              'content-type': 'application/json' // 默认值
          },
          success: function(res) {
              var result = res.data;
              if(result.status ==1){
                  if(result.data.nextPage === ''){
                      that.data.noMore = true;
                  }
                  that.data.nextPage = result.data.nextPage;
                  var pkgList = that.data.pkgList;
                  for(var i=0;i < result.data.list.length;i++){
                      pkgList.push(result.data.list[i]);
                  }
                  that.setData({
                      pkgList:pkgList
                  });
              }

          },
          complete: function(res){
            app.hideLoading();
          }
      });
  },
  onLoad: function (options) {
     var that = this;
     let sign = wx.getStorageSync('sign');
      wx.setNavigationBarTitle({
          title: options.kw
      })
      wx.getSystemInfo({
          success:function(res){
              that.setData({
                  scrollHeight:res.windowHeight
              });
          }
      });
      console.log(options);
     var url = this.data.url.replace(/\{id\}/,options.id);
     that.setData({
         url:url
     });
     this.loadList(1);
  },
  //上拉加载数据
  pullUpLoad: function (e) {
      var that = this;
      if(that.data.nextPage){
          that.loadList(that.data.nextPage);
      }
  },
    // 下拉刷新数据
    pullDownRefresh: function() {
        var that = this;
        that.setData({
            content_items:[],
            nextPage:0,
            currentPage:0,
            scrollTop : 0,
            noMore:false
        });
        that.loadList(1);
    }
})
