//index.js
//获取应用实例
const app = getApp();
let sign = wx.getStorageSync('sign');
Page({
  data: {
    url: app.globalData.baseUrl + 'shanmeng/search/index?keyword={keyword}&type={type}&offset={offset}',
    keyword: '',
    newList: {
      hiddenNewList: true,
      offset: 0,
      loadingOffset: '',
      data: []
    },
    hot: {
      hiddenHotList: true,
      hiddenPkgList: false,
      data: []
    },
    hasResult: true,
    scrollTop: 0,
    scrollHeight: 0,
    type: '',
    nextPage: 0,
    currentPage: 0,
    isLoading: false
  },
  loadHot: function () {
    let that = this;
    let sign = wx.getStorageSync('sign');
    that.setData({
      isLoading: true
    });
    app.showLoading('加载');
    var url = this.data.url.replace("\{keyword\}", that.data.keyword).replace("\{type\}", 1).replace("\{offset\}", 0);
    wx.request({
      url: url + '&sign=' + sign + '&operator_id=' + app.data.kid,
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        var result = res.data;
        if (result.status == 1) {
          that.setData({
            "hot.data": result.data
          });
          console.log(that.data.hot.data.pkg_list);
          that.setData({
            "hot.hiddenHotList": result.data.hot_list.length == 0
          });
          that.setData({
            "hot.hiddenPkgList": result.data.pkg_list.length == 0
          });

        }
        that.setData({
          isLoading: false
        });
        that.setResultStatus();

      },
      complete: function (res) {
        app.hideLoading();
      }
    });
  },
  loadNewList: function () {
    let that = this;
    let sign = wx.getStorageSync('sign');
    if (that.data.newList.offset === that.data.newList.loadingOffset) {
      return false;
    }
    app.showLoading();
    that.setData({
      isLoading: true
    });
    var url = this.data.url.replace("\{keyword\}", that.data.keyword).replace("\{type\}", 2).replace("\{offset\}", that.data.newList.offset);
    that.data.newList.loadingOffset = that.data.newList.offset;
    wx.request({
      url: url + '&sign=' + sign + '&operator_id=' + app.data.kid,
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        var result = res.data;
        if (result.status == 1) {
          var responseData = that.data.newList.data;
          for (var i = 0; i < result.data.length; i++) {
            responseData.push(result.data[i]);
          }


          that.setData({
            "newList.data": responseData
          });
          that.setData({
            "newList.offset": result.pagination.offset
          });
          console.log(responseData.length);
          that.setData({
            "newList.hiddenNewList": responseData.length == 0
          });
        }
        that.setData({
          isLoading: false
        });
        that.setResultStatus();

      },
      complete: function (res) {
        app.hideLoading();
        //that.data.newList.offset
      }
    });
  },
  onLoad: function (options) {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          scrollHeight: res.windowHeight
        });
      }
    });
    that.setData({ 'keyword': options.kw });
    this.loadHot();
    this.loadNewList();
  },

  pullUpLoad: function (e) {
    var that = this;
    that.loadNewList();
  },
  setResultStatus: function () {

    let that = this;
    that.setData({
      'hasResult': !(that.data.hot.hiddenHotList && that.data.hot.hiddenPkgList && that.data.newList.hiddenNewList)
    })

  }
})

