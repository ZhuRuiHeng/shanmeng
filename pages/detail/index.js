//index.js
//获取应用实例
const app = getApp();
let sign = wx.getStorageSync('sign');
//form_type:1   // 1照片，2姓氏、头像、背景，3姓名
Page({
  data: {
    detail: [],
    url: 'shanmeng/detail/index?id={id}',
    related: [],
    relatedUrl: 'shanmeng/detail/related?id={id}',
    scrollTop: 0,
    scrollHeight: 0,
    type: '',
    nextPage: 0,
    noMore: false
  },
  loadDetail: function () {
    var that = this;
    let sign = wx.getStorageSync('sign');
    wx.showLoading({
      title: '加载中',
    });
    app.showLoading();
    var url = app.globalData.baseUrl + this.data.url;
    wx.request({
      url: url + '&sign=' + sign + '&operator_id=' + app.data.kid,
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        var result = res.data;
        console.log("detail:", result);
        if (result.status == 1) {

          that.setData({
            detail: result.data.detail
          });
        }

      },
      complete: function (res) {
        app.hideLoading();
      }
    });
    wx.hideLoading()
  },
  loadRelated: function () {
    wx.showLoading({
      title: '加载中',
    });
    var that = this;
    let sign = wx.getStorageSync('sign');
    var url = app.globalData.baseUrl + this.data.relatedUrl;
    console.log(url);
    wx.request({
      url: url + '&sign=' + sign + '&operator_id=' + app.data.kid,
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        var result = res.data;
        console.log("related:", result);
        if (result.status == 1) {
          that.setData({
            related: result.data.related
          });
        }

      },
      complete: function (res) {

      }
    });
    wx.hideLoading()
  },
  onLoad: function (options) {
    var that = this;
    wx.setNavigationBarTitle({
      title: "图片详情"
    })
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          scrollHeight: res.windowHeight
        });
      }
    });

    var url = this.data.url.replace(/\{id\}/, options.id);
    var relatedUrl = this.data.relatedUrl.replace(/\{id\}/, options.id);
    that.setData({
      url: url,
      relatedUrl: relatedUrl
    });
    this.loadDetail();
    this.loadRelated();
  },
  aut: function () {
    //授权
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {

            }
          })
        }
      }
    })
  },
  saveImage: function (e) {
    wx.showLoading({
      title: '加载中',
    });
    var imgSrc = e.currentTarget.dataset.src;
    wx.downloadFile({
      url: imgSrc,
      success:function (res) {
        console.log(res);
        //图片保存到本地
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success:function (data) {
            console.log(data);
            wx.showToast({
              title: '图片下载成功，请去相册查看',
              icon: 'success',
              duration: 800
            })
          },
          fail:function (err) {
            console.log(err);
            if (err.errMsg === "saveImageToPhotosAlbum:fail auth deny") {
              console.log("用户一开始拒绝了，我们想再次发起授权")
              console.log('打开设置窗口')
              wx.openSetting({
                success(settingdata) {
                  console.log(settingdata)
                  if (settingdata.authSetting['scope.writePhotosAlbum']) {
                    console.log('获取权限成功，给出再次点击图片保存到相册的提示。')
                  }
                  else {
                    console.log('获取权限失败，给出不给权限就无法正常使用的提示')
                  }
                }
              })
            }
          }
        })
      }
    })
    wx.hideLoading()
  },
  share: function (e) {
    wx.showLoading({
      title: '加载中',
    });
    var imgSrc = e.currentTarget.dataset.src;
    wx.previewImage({
      current: imgSrc, // 当前显示图片的http链接
      urls: [imgSrc] // 需要预览的图片http链接列表
    })
    wx.hideLoading()
  }

})
