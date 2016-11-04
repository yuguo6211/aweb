var APP;
var baseUrl = 'http://192.168.26.128:2000/'
var keymap = {
  'top': listTop,
  's': listSubject
}
$(function () {
  APP = new Vue({
    el: 'body',
    data: {
      repos: [],
      subs: [],
      isring: false,
      view: 'help'
    },
    methods: {
      submit () {
        var keyword = APP.keyword
        if (keyword.trim() === '') {
          listLatest()
        } else {
          listSearch()
        }
      }
    },
    watch: {
      keyword: function () {
        if (APP.keyword[0] === ':') {
          var func = keymap[APP.keyword.substring(1)]
          if (typeof func === 'function') {
            func()
          } else {
            APP.view = 'help'
          }
        }
      }
    }
  })


  listLatest()
})

/**
 * 获取最新的框架
 */
function listLatest () {
  APP.view = 'repos'
  var storeList = store.get('latestrepos')
  if (storeList) {
    APP.repos = storeList
  } else {
    APP.isring = true
  }
  
  $.get(baseUrl + 'api/latest', {}, function(data) {
    data.items.forEach(function(item) {
       processRepo(item)
    })
    if (!storeList) {
      APP.repos = data.items
      APP.isring = false
    }
    store.set('latestrepos', data.items)
    
  })
}


/**
 * 搜索结果
 */
function listSearch () {
  APP.view = 'repos'
  APP.isring = true
  $.get(baseUrl + 'api/search?q=' + APP.keyword, {}, function(data) {
    data.items.forEach(function(item) {
       processRepo(item)
    })
    APP.repos = data.items
    APP.isring = false
  })
}

/**
 * 获取前端top 100
 */
function listTop () {
  APP.view = 'repos'
  APP.isring = true
  $.get(baseUrl + 'api/top', {}, function(data) {
    data.items.forEach(function(item) {
      processRepo(item)
    })
    APP.repos = data.items
    APP.isring = false
  })
}

/**
 * 获取专题列表
 */
function listSubject () {
  APP.view = 'subject'
  APP.isring = true
  $.get(baseUrl + 'api/subjects', {}, function(data) {
    APP.subs = data.items
    APP.isring = false
  })
}
/**
 * 获取专题详情
 */


/**
 * 处理框架列表的每一项
 */
function processRepo (item) {
  item.fresh = freshData(item.pushed_at)
  item.trend = trendData(item.trend)
}

// 计算更新频率
function freshData (time) {
  var diff = (Date.now() - Date.parse(time)) / 3600000
  if (diff > 60) {
    return ['outdated', '过期']
  }

  if (_val < 7) {
    return ['often', '频繁']
  }
  

  return ['normal', '正常']
}


// 计算趋势
function trendData (trend) {
  if(trend >= 60) {
    return 3
  }

  if(trend >= 30) {
    return 2
  }

  if(trend > 0) {
    return 1
  }

  return 0
}

