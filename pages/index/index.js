//index.js
//获取应用实例
const app = getApp();
let sign = wx.getStorageSync('sign');
Page({
    data: {
        suggList:{
            hiddeSugglist:true,
            url:'shanmeng/list/sugg&kw={kw}',
            data:[]
        },
        recommendPackage:{
            url: 'shanmeng/list/recommend',
            data:[]
        },
        newList:{
          url:'shanmeng/list/index?is_new=1&page=1&per-page=63',
            data:[]
        },
        hotwordList:{
          url: 'shanmeng/list/hot-words?limit=9&offset={offset}',
            offset:0,
            data:[]
        },
        wordSearch:null,
        url:'shanmeng/list/index&is_new=1&page=1&per-page=60',
        colors:{
            'new':'新',
            'reco':'荐',
            'selfmade':'自制',
            'hot':'热'
        },
        timer:null,
        scrollTop : 0,
        scrollHeight:0,
        type:'',
        nextPage:0,
        currentPage:0,
        isLoading:false,
        navto: 1,  //是否跳转启动页 1跳转 0 不跳转
        marqueePace: 1,//滚动速度
        marqueeDistance: 0,//初始滚动距离
        marqueeDistance2: 0,
        marquee2copy_status: false,
        marquee2_margin: 60,
        size: 14,
        orientation: 'left',//滚动方向
        interval: 40 // 时间间隔
    },
    onShow:function(){
      let that = this;
      wx.showLoading({
        title: '加载中',
      });
      app.getAuth(function(){
        let userInfo = wx.getStorageSync('userInfo');
        let sign = wx.getStorageSync('sign');
        console.log(userInfo);
        that.setData({
          userInfo: userInfo
        })
      })
      // 广告
        if (wx.getStorageSync("navto")) {
          setTimeout(function () {
            wx.navigateTo({
              url: '../star/star'
            })
          }, 20)
        }
        //滚动文字
        wx.request({
          url: "https://unify.playonweixin.com/site/get-advertisements",
          success: function (res) {
            console.log(res);
            if (res.data.status) {
              var advers = res.data.adver.advers;
              var head_adver = res.data.adver.head_adver;
              var broadcasting = res.data.adver.broadcasting;
              wx.setStorageSync("advers", advers);
              wx.setStorageSync("broadcasting", broadcasting);
              that.setData({
                broadcasting
              })
            }
          }
        })
        var vm = this;
        console.log("length1:", vm.data.broadcasting.length);
        console.log("length2:", vm.data.size);
        var length = vm.data.broadcasting.length * vm.data.size;//文字长度
        console.log("length:", length);
        var windowWidth = wx.getSystemInfoSync().windowWidth;// 屏幕宽度
        console.log("windowWidth:", windowWidth);
        console.log("res:", vm.data.marquee2_margin)
        vm.setData({
          length: length,
          windowWidth: windowWidth,
          marquee2_margin: length < windowWidth ? windowWidth - length : vm.data.marquee2_margin//当文字长度小于屏幕长度时，需要增加补白
        });
        vm.run1();// 水平一行字滚动完了再按照原来的方向滚动
        vm.run2();// 第一个字消失后立即从右边出现
        wx.hideLoading()
      
    },
    // 方法1
    run1: function () {
      var vm = this;
      var interval = setInterval(function () {
        if (-vm.data.marqueeDistance < vm.data.length) {
          vm.setData({
            marqueeDistance: vm.data.marqueeDistance - vm.data.marqueePace,
          });
        } else {
          clearInterval(interval);
          vm.setData({
            marqueeDistance: vm.data.windowWidth
          });
          vm.run1();
        }
      }, vm.data.interval);
    },
    // 方法1
    run2: function () {
      var vm = this;
      var interval = setInterval(function () {
        //console.log("marquee2_margin",vm.data.marquee2_margin);
        if (-vm.data.marqueeDistance2 < vm.data.length) {
          // 如果文字滚动到出现marquee2_margin=30px的白边，就接着显示
          vm.setData({
            marqueeDistance2: vm.data.marqueeDistance2 - vm.data.marqueePace,
            marquee2copy_status: vm.data.length + vm.data.marqueeDistance2 <= vm.data.windowWidth + vm.data.marquee2_margin,
          });
        } else {
          if (-vm.data.marqueeDistance2 >= vm.data.marquee2_margin) { // 当第二条文字滚动到最左边时
            vm.setData({
              marqueeDistance2: vm.data.marquee2_margin // 直接重新滚动
            });
            clearInterval(interval);
            vm.run2();
          } else {
            clearInterval(interval);
            vm.setData({
              marqueeDistance2: -vm.data.windowWidth
            });
            vm.run2();
          }
        }
      }, vm.data.interval);
    },
    loadRecommend:function () {
        let that =this;
        let sign = wx.getStorageSync('sign');
        that.setData({
            isLoading:true
        });
        app.showLoading('加载');
        console.log(that.data.recommendPackage.url);
        wx.request({
          url: app.globalData.baseUrl + that.data.recommendPackage.url +'?sign=' + sign + '&operator_id=' + app.data.kid,
            header: {
                'content-type': 'application/json' // 默认值
            },
            success: function(res) {
                var result = res.data;
                console.log("loadRecommend:", result)
                if(result.status ==1){
                    that.setData({
                        "recommendPackage.data":result.data.list
                    });
                }
                that.setData({
                    isLoading:false
                });

            },
            complete: function(res){
                app.hideLoading();
            }
        });
    },
    loadNewList:function () {
        let that = this;
        let sign = wx.getStorageSync('sign');
        app.showLoading();
        that.setData({
            isLoading:true
        });

        wx.request({
          url: app.globalData.baseUrl + this.data.newList.url + '&sign=' + sign + '&operator_id=' + app.data.kid,
            header: {
                'content-type': 'application/json' // 默认值
            },
            success: function(res) {
                var result = res.data;
                console.log("newList:", result)
                that.setData({
                    "newList.data":result.list
                });
                that.setData({
                    isLoading:false
                });

            },
            complete: function(res){
                app.hideLoading();
            }
        });
    },
    refreshHotWordList:function () {
        let that = this;
        this.loadHotwordList(that.data.hotwordList.offset);
    },
    loadHotwordList:function (offset) {
        let that = this;
        var url = this.data.hotwordList.url.replace("\{offset\}",offset);
        wx.request({
          url: app.globalData.baseUrl + url + '&sign=' + sign + '&operator_id=' + app.data.kid,
            header: {
                'content-type': 'application/json' // 默认值
            },
            success: function(res) {
                var result = res.data;
                console.log('hotwordList:', result)
                if(result.status){
                   that.setData({
                       "hotwordList.data":result.data
                   });
                   if(result.data.length){
                       that.setData({
                           'wordSearch': result.data[Math.floor(Math.random()*result.data.length)]
                       });

                   }

                    that.setData({
                        "hotwordList.offset":result.pagination.offset
                    });

                }


            },
            complete: function(res){

            }
        });
    },
    onLoad: function (options) {
        var that = this;
        console.log(options)
        wx.setStorageSync("navto", 1)
        let sign = wx.getStorageSync('sign');
        let kid = wx.getStorageSync('kid');
        wx.showLoading({
          title: '加载中',
        });

        if (!wx.canIUse('web-view')) {
          // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
          wx.showModal({
            title: '提示',
            content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
          })
        }
        wx.getSystemInfo({
            success:function(res){
                that.setData({
                    scrollHeight:res.windowHeight
                });
            }
        });
        this.loadHotwordList(that.data.hotwordList.offset);
        this.loadRecommend();
        this.loadNewList();
    },
   
    loadSuggList:function (kw) {
        let that = this;
        this.data.timer && clearTimeout(this.data.timer);
        var timer = setTimeout(function(){
            var url = that.data.suggList.url.replace("\{kw\}",kw);
            wx.request({
              url: app.globalData.baseUrl + url + '&sign=' + sign + '&operator_id=' + app.data.kid,
                header: {
                    'content-type': 'application/json' // 默认值
                },
                success: function(res) {
                    var result = res.data;
                    console.log(result.data.hot_list);
                    console.log('hot_list:', result.data.hot_list)
                    if(result.status){
                        that.setData({
                            "suggList.data":result.data
                        });
                        that.setData({
                            "suggList.hiddeSugglist":result.data.length == 0
                        });

                    }


                },
                complete: function(res){

                }
            });

        }, 100);

        this.setData({timer:timer});


    },

    toSearchPage: function (e) {
        wx.navigateTo({
            url: '../search/index?kw='+this.data.wordSearch.word
        });
    },
    typeInput:function (e) {
        var that = this;
        var kw = e.detail.value;
        this.loadSuggList(kw);
        that.setData({"wordSearch.word":kw})
    },
    pullUpLoad: function (e) {
        var that = this;
        if(that.data.nextPage){
            that.loadList(that.data.nextPage);
        }
    },
    inputSearchBlur: function (e) {
        var that = this;
        that.setData({"suggList.hiddeSugglist":true})

    }
})

