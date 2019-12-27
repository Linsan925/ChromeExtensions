//= ==猎聘===
// 兼容不支持根据className获取节点
if (!document.getElementsByClassName) {
  document.getElementsByClassName = function (className, element) {
    var children = (element || document).getElementsByTagName('*')
    var elements = new Array()
    for (var i = 0; i < children.length; i++) {
      var child = children[i]
      var classNames = child.className.split(' ')
      for (var j = 0; j < classNames.length; j++) {
        if (classNames[j] == className) {
          elements.push(child)
          break
        }
      }
    }
    return elements
  }
}

const Storage = {}

Storage.get = function (name) {
  return JSON.parse(localStorage.getItem(name))
}

Storage.set = function (name, val) {
  localStorage.setItem(name, JSON.stringify(val))
}

Storage.add = function (name, addVal) {
  let oldVal = Storage.get(name)
  let newVal = oldVal.concat(addVal)
  Storage.set(name, newVal)
}
function getHrUserCode () {
  const user = Storage.get('ck_fe_h_ko')
  if (user) {
    const info = JSON.parse(user.v)
    if (info) {
      return info[0]
    }
  }
  return ''
}
function getCookie () {
  var cookies = document.cookie
  // console.log(cookies)
  return cookies
}
// 简历解析
const config = {
  baseUrl: 'https://robot.risfond.com/' // 必须https
}
var hrusercode = getHrUserCode()
if (hrusercode) {
  grasp()
}
function grasp () {
  let totalUrl = config.baseUrl + 'api/liepin/gettotal/' + hrusercode
  $.get(totalUrl, function (data) {
    if (data && data.success) {
      const renumber = data.data
      let listUrl =
        'https://h.liepin.com/talentresume/getmytalentpagelist.json?traceId=50455217686'
      $.post(listUrl, { curPage: 0 }, function (data) {
        if (data && data.flag == 1 && data.data) {
          const total = data.data.totalCount
          const pageSize = data.data.pageSize

          let synumber = total - renumber
          console.log('剩余需要抓取的数量：' + synumber)
          if (synumber <= 0) return
          let pageTotal =
            synumber % pageSize == 0
              ? synumber / pageSize
              : parseInt(synumber / pageSize) + 1
          createDisplay(function () {
            excute(pageTotal,total)
          })
        }
      })
    }
  })
}
let sleepTime = 60000;
// if (document.URL.indexOf('resumemanage/showmytalentlist' >= 0)) {
//   grasp()
// }
function excute (pageTotal,total) {
  var base = new Base64()
  let listUrl =
    'https://h.liepin.com/talentresume/getmytalentpagelist.json?traceId=50455217686'
  var loopPageTotal = pageIndex => {
    if (pageIndex <= 0) {
      console.log('抓取结束')
      return
    }
    console.log('current page index:', pageIndex)
    $.post(listUrl, { curPage: pageIndex - 1 }, function (data) {
      if (data && data.flag == 1 && data.data) {
        let list = data.data.list
        if (list) {
          // 循环调用明细
          var loopItem = index => {
            console.log('index:', index)
            if (index >= 0) {
              let url = 'https://h.liepin.com' + list[index].detailUrl
              console.log('url', url)
              $.get(url, function (html) {
                console.log('html')
                if (html) {
                  html = html.replace(/<script[\s\S]+?<\/script>/g, '')
                  $('.divdisext').html(html)
                  var emailurl = $(html)
                    .find('.email')
                    .attr('src')
                  var telphoneurl = $(html)
                    .find('.telphone')
                    .attr('src')
                  console.log('email:', emailurl)
                  console.log('phone:', telphoneurl)
                  if (emailurl) {
                    getImg(emailurl, function (email) {
                      if (email) {
                        console.log('email')
                        if (telphoneurl) {
                          getImg(telphoneurl, function (telphone) {
                            if (telphone) {
                              console.log('phone')
                              getWork(
                                list[index].simpleResumeForm.resIdEncode,
                                function (workItem) {
                                  console.log('work')
                                  if (workItem) {
                                    $('.divdisext')
                                      .find('.resume-work')
                                      .html(workItem)
                                  }
                                  let param = {
                                    total: total,
                                    hrCode: hrusercode,
                                    userEmailImage: email,
                                    userPhoneImage: telphone,
                                    userPhotoUrl:
                                      list[index].simpleResumeForm.cPhoto,
                                    userName:
                                      list[index].simpleResumeForm.resName,
                                    userSex:
                                      list[index].simpleResumeForm.resSexName,
                                    birthday:
                                      list[index].simpleResumeForm.resBirthYear,
                                    resumeDetailUrl: url,
                                    resumeDetailHtml: base.encode(
                                      $('.divdisext')
                                        .html()
                                        .replace('+', '%2B')
                                    )
                                  }
                                  $.ajax({
                                    url:
                                    config.baseUrl + 'api/LiePin/addResume',
                                    type: 'post',
                                    data: JSON.stringify(param),
                                    contentType: 'application/json',
                                    success: function (data) {
                                      console.log('next page')
                                      setTimeout(_ => {
                                        index--
                                        loopItem(index)
                                      }, (sleepTime + Math.ceil(Math.random() * 10) * 1000))
                                    },
                                    error: function (err) {
                                      console.log(err)
                                    }
                                  })
                                }
                              )
                            }
                          })
                        } else {
                          getWork(
                            list[index].simpleResumeForm.resIdEncode,
                            function (workItem) {
                              console.log('work')
                              if (workItem) {
                                $('.divdisext')
                                  .find('.resume-work')
                                  .html(workItem)
                              }
                              let param = {
                                total: total,
                                hrCode: hrusercode,
                                userEmailImage: email,
                                userPhoneImage: '',
                                userPhotoUrl:
                                  list[index].simpleResumeForm.cPhoto,
                                userName: list[index].simpleResumeForm.resName,
                                userSex:
                                  list[index].simpleResumeForm.resSexName,
                                birthday:
                                  list[index].simpleResumeForm.resBirthYear,
                                resumeDetailUrl: url,
                                resumeDetailHtml: base.encode(
                                  $('.divdisext')
                                    .html()
                                    .replace('+', '%2B')
                                )
                              }
                              $.ajax({
                                url:
                                config.baseUrl + 'api/LiePin/addResume',
                                type: 'post',
                                data: JSON.stringify(param),
                                contentType: 'application/json',
                                success: function (data) {
                                  console.log('next page')
                                  index--
                                  setTimeout(_ => {
                                    loopItem(index)
                                  }, (sleepTime + Math.ceil(Math.random() * 10) * 1000))
                                },
                                error: function (err) {
                                  console.log(err)
                                }
                              })
                            }
                          )
                        }
                      }
                    })
                  } else {
                    if (telphoneurl) {
                      getImg(telphoneurl, function (telphone) {
                        if (telphone) {
                          console.log('phone')
                          getWork(
                            list[index].simpleResumeForm.resIdEncode,
                            function (workItem) {
                              console.log('work')
                              if (workItem) {
                                $('.divdisext')
                                  .find('.resume-work')
                                  .html(workItem)
                              }
                              let param = {
                                total: total,
                                hrCode: hrusercode,
                                userEmailImage: '',
                                userPhoneImage: telphone,
                                userPhotoUrl:
                                  list[index].simpleResumeForm.cPhoto,
                                userName: list[index].simpleResumeForm.resName,
                                userSex:
                                  list[index].simpleResumeForm.resSexName,
                                birthday:
                                  list[index].simpleResumeForm.resBirthYear,
                                resumeDetailUrl: url,
                                resumeDetailHtml: base.encode(
                                  $('.divdisext')
                                    .html()
                                    .replace('+', '%2B')
                                )
                              }
                              $.ajax({
                                url:
                                config.baseUrl + 'api/LiePin/addResume',
                                type: 'post',
                                data: JSON.stringify(param),
                                contentType: 'application/json',
                                success: function (data) {
                                  console.log('next page')
                                  setTimeout(_ => {
                                    index--
                                    loopItem(index)
                                  }, (sleepTime + Math.ceil(Math.random() * 10) * 1000))
                                },
                                error: function (err) {
                                  console.log(err)
                                }
                              })
                            }
                          )
                        }
                      })
                    } else {
                      getWork(
                        list[index].simpleResumeForm.resIdEncode,
                        function (workItem) {
                          console.log('work')
                          if (workItem) {
                            $('.divdisext')
                              .find('.resume-work')
                              .html(workItem)
                          }
                          let param = {
                            total: total,
                            hrCode: hrusercode,
                            userEmailImage: '',
                            userPhoneImage: '',
                            userPhotoUrl: list[index].simpleResumeForm.cPhoto,
                            userName: list[index].simpleResumeForm.resName,
                            userSex: list[index].simpleResumeForm.resSexName,
                            birthday: list[index].simpleResumeForm.resBirthYear,
                            resumeDetailUrl: url,
                            resumeDetailHtml: base.encode(
                              $('.divdisext')
                                .html()
                                .replace('+', '%2B')
                            )
                          }
                          $.ajax({
                            url: config.baseUrl + 'api/LiePin/addResume',
                            type: 'post',
                            data: JSON.stringify(param),
                            contentType: 'application/json',
                            success: function (data) {
                              console.log('next page')
                              setTimeout(_ => {
                                index--
                                loopItem(index)
                              }, (sleepTime + Math.ceil(Math.random() * 10) * 1000))
                            },
                            error: function (err) {
                              console.log(err)
                            }
                          })
                        }
                      )
                    }
                  }
                } else {
                  console.log('get detail fail')
                }
              }).error(e => {
                console.log(e)
              })
            } else {
              // 继续循环
              if (pageIndex > 0) {
                console.log('=======next=======')
                setTimeout(_ => {
                  pageIndex--
                  loopPageTotal(pageIndex)
                }, 2000) // 调用频率
              }
              console.log('=======end======')
            }
          }
          loopItem(list.length - 1)
        }
      } else {
        console.log('get list fail')
      }
    }).error(e => {
      console.log(e)
    })
  }
  loopPageTotal(pageTotal)
}
function transformArrayBufferToBase64 (buffer) {
  var binary = ''
  var bytes = new Uint8Array(buffer)
  for (var len = bytes.byteLength, i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return window.btoa(binary)
}
var getImg = function (url, call) {
  url = 'https://h.liepin.com' + url
  var xhr = new XMLHttpRequest()
  xhr.open('get', url, true)
  xhr.responseType = 'arraybuffer'
  xhr.onload = function () {
    if (this.status == 200) {
      var blob = transformArrayBufferToBase64(this.response)
      // if (blob.indexOf('data:image/png;base64') < 0) {
      //   blob = 'data:image/png;base64,' + blob
      // }
      call(blob)
    }
  }
  xhr.send()
}
var getWork = function (key, call) {
  $.post(
    'https://h.liepin.com/resume/showresumedetail/showworkexps',
    { res_id_encode: key },
    call
  )
}

var createDisplay = function (call) {
  var container = `<div style="display:none" class="divdisext"></div>`
  $('body').append(container)
  setTimeout(_ => {
    call()
  }, 0)
}
