const utils = {}

utils.transXmlToArray = function (matchTbl) {
  const matchTblList = []
  const firstLevel = []
  if (matchTbl) {
    matchTbl.forEach((tblItem, index) => {
      matchTblList.push(tblItem)
      firstLevel.push({
       name: index + '.vue',
       children: [] 
      })
      let matchWtr = tblItem.match(/<w:tr.*?>.*?<\/w:tr>/gi)
      if (matchWtr) {
        matchWtr.forEach((tcItem, tcIndex) => {
          let matchWtc = tcItem.match(/<w:tc>.*?<\/w:tc>/gi)
          // matchTblList.children.push(tcItem)
          firstLevel[index].children.push({
            row: tcIndex,
            children: []
          })

          matchWtc.forEach((ttItem, ttIndex) => {
            if (ttItem) {
              let matchWtt = ttItem.match(/(<w:t>.*?<\/w:t>)|(<w:t\s.[^>]*?>.*?<\/w:t>)/gi)
              // let matchWtt = ttItem.match(/<w:t>.*?<\/w:t>/gi)
              // firstLevel[index].children[tcIndex].children.push({
              //   col: ttIndex,
              //   children: []
              // })
              if (!matchWtt) {
                matchWtt = ['<w:t>非必选</w:t>']
              }
              if (matchWtt.length > 1) {
                let textContent = ''
                for (let i = 0; i < matchWtt.length; i++) {
                  textContent+=matchWtt[i].slice(5,-6)
                }
                let str = '<w:t>' + textContent + '</w:t>'
                matchWtt = [str]
              }
              matchWtt.forEach((tItem, tIndex) => {
                let textContent = ''
                firstLevel[index].children[tcIndex].children.push({
                  col: ttIndex,
                  text: textContent+=tItem.slice(5,-6)
                })
              })
            }
          })

        })
      }
    })
  }
  return firstLevel
}

utils.getFileName = function (arr) {
  const fileNames = []
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].children.length > 0 && arr[i].children[0].children.length > 1) {
      fileNames.push(arr[i].children[0].children[1].text)
    }
  }
  return fileNames
}

//XML表格转换为对应的“行”数据、“列”数据，再根据行、列生成表单。
utils.transArrayKey = function (arr) {
  const fileNames = this.getFileName(arr) //获取word表格中第一行第二列字段作为文件名
  const innerArr = JSON.parse(JSON.stringify(arr))
  const explain = ['字段名称', '字段', '字段类型', '输入方式', '是否必填', '权限', '备注'] //表格每列的字段名
  for (let i = 0; i < innerArr.length; i++) {
    if (innerArr[i].children.length > 1) {
      innerArr[i].children.splice(0,1)
    }
  }
  for (let i = 0; i < innerArr.length; i++) {
    for (let j = 0; j < innerArr[i].children.length; j++) {
       for (let y = 0; y < innerArr[i].children[j].children.length; y++) {
         innerArr[i].children[j].children[y].mark = explain[y]
       }
    }
  }
  
  for (let i = 0; i < innerArr.length; i++) {
    for (let j = 0; j < innerArr[i].children.length; j++) {
      let obj = {}
       for (let y = 0; y < innerArr[i].children[j].children.length; y++) {
         if (innerArr[i].children[j].children[y].mark === '字段名称') {
           obj.lable = innerArr[i].children[j].children[y].text
         } else if (innerArr[i].children[j].children[y].mark === '字段') {
          obj.field = innerArr[i].children[j].children[y].text
         } else if (innerArr[i].children[j].children[y].mark === '字段类型') {
          obj.fieldType = innerArr[i].children[j].children[y].text
         } else if (innerArr[i].children[j].children[y].mark === '输入方式') {
          obj.inType = innerArr[i].children[j].children[y].text
         } else if (innerArr[i].children[j].children[y].mark === '是否必填') {
          obj.required = innerArr[i].children[j].children[y].text
         } else if (innerArr[i].children[j].children[y].mark === '权限') {
          obj.limits = innerArr[i].children[j].children[y].text
         } else if (innerArr[i].children[j].children[y].mark === '备注') {
          obj.remarks = innerArr[i].children[j].children[y].text
         }
       }
       innerArr[i].children[j].param = obj
    }
  }

  let lastList = []
  for (let j = 0; j < innerArr.length; j++) {
    const ItemArray = this.getText(innerArr[j])
    let pageItem = ''
    for (let i = 0; i < ItemArray.length; i++) {
      pageItem = pageItem + ItemArray[i] + '\n'
    }
    let obj = {
      name: fileNames[j],
      text: this.plate(pageItem, fileNames[j])
    }
    lastList.push(obj)
  }
  
  return lastList
}

//根据数组元素“输入类型”生成对应表单组件
utils.getText = function (arr) {
  let ItemText = []
  const children = arr.children
  for (let i = 0; i < children.length; i++) {
    let num = children[i].param.remarks ? (children[i].param.remarks).replace(/[^0-9]/ig,"") : ''

    let InType = ''
    if (children[i].param.inType === '下拉选择' || children[i].param.inType === '单选框') {
      InType = '\u0020' + '\u0020' + '\u0020' + '\u0020' + '\u0020' + '\u0020'
      + '<a-select' + ` placeholder="请选择"` +
      ` option-filter-prop="children"` + ` style="width: 100%"` 
      + ` v-model="form.${children[i].param.field}"` + '>'
      + '\n' + '\u0020' + '\u0020' + '\u0020' + '\u0020' + '\u0020' + '\u0020' + '\u0020' + '\u0020'
      + '<a-select-option' + ` v-for="item in ${children[i].param.field}"` + ' :key="item.id"' + '>'
      + '\n' + '\u0020' + '\u0020' + '\u0020' + '\u0020' + '\u0020' + '\u0020' + '\u0020' + '\u0020' + '\u0020' + '\u0020' 
      + '{{item.name}}' + '\n' + '\u0020' + '\u0020' + '\u0020' + '\u0020' + '\u0020' + '\u0020' + '\u0020' + '\u0020'
      + '</a-select-option>'
      + '\n' + '\u0020' + '\u0020' + '\u0020' + '\u0020' + '\u0020' + '\u0020' 
      + '</a-select>'
    } else if (children[i].param.inType === '输入框' && children[i].param.fieldType === 'String') {
      InType = '\u0020' + '\u0020' + '\u0020' + '\u0020' + '\u0020' + '\u0020' 
      + '<a-input' + ` placeholder="请输入"` +
      ` :maxLength="${num}"` + ` style="width: 100%"` 
      + ` v-model="form.${children[i].param.field}"` + ' />'
    } else if (children[i].param.inType === '输入框' && children[i].param.fieldType === 'Integer') {
      let length = this.getNumLength(num)
      InType = '\u0020' + '\u0020' + '\u0020' + '\u0020' + '\u0020' + '\u0020'
      + '<a-input-number' + ` placeholder="请输入"` +
      ` :min="0"` + ` :max="${length}"` + ` :precision="0"` + ` style="width: 100%"`
      + ` v-model="form.${children[i].param.field}"` + ' />'
    } else if (children[i].param.inType === '输入框' && children[i].param.fieldType === 'Float') {
      let length = this.getNumLength(num)
      InType = '\u0020' + '\u0020' + '\u0020' + '\u0020' + '\u0020' + '\u0020'
      + '<a-input-number' + ` placeholder="请输入"` +
      ` :min="0"` + ` :max="${length}"` + ` style="width: 100%"`
      + ` v-model="form.${children[i].param.field}"` + ' />'
    } else if (children[i].param.inType === '时间控件') {
      InType = '\u0020' + '\u0020' + '\u0020' + '\u0020' + '\u0020' + '\u0020'
      + '<a-date-picker' + ' style="width: 100%"' + ` v-model="form.${children[i].param.field}"`
      + ' :valueFormat="`YYYY-MM-DD HH:mm:ss`"' + ` :show-time="{ defaultValue: moment('YYYY-MM-DD', 'HH:mm:ss') }"` + '>'
      + '\n' + '\u0020' + '\u0020' + '\u0020' + '\u0020' + '\u0020' + '\u0020'
      + '</a-date-picker>'
    }

    let text = '\u0020' + '\u0020' + '\u0020' + '\u0020'
    + '<a-form-model-item' + ` label="${children[i].param.lable}"` +
    ` ref="${children[i].param.field}"` + ` prop="${children[i].param.field}"` + '>'
    + '\n' + InType + '\n' 
    + '\u0020' + '\u0020' + '\u0020' + '\u0020' 
    + '</a-form-model-item>'
    ItemText.push(text)
  }
  return ItemText
}

utils.getNumLength = function (num) {
  let str = ''
  for (let i = 0; i < num; i++) {
    str = str + '9'
  }
  return str
}

//.vue文件模板
utils.plate = function (text, name) {
  let latsName = ''
  if (name.indexOf('Info') === (name.length - 4)) {
    latsName = name.substring(0, name.indexOf('Info')) + 'Form'
  }
  let template = '<template>' + '\n' + '\u0020' + '\u0020' + '<a-form-model' 
  + ' ref="form"' + ' :model="form"' + ' :rules="rules"' + '>'
  + '\n' + text +'\n' + '\u0020' + '\u0020' + '</a-form-model>'
  + '\n' + '</template>' + '\n' + '<script>' + '\n'
  + 'export default {' + '\n'
  + '\u0020' + '\u0020'
  + `name: "${latsName}",`
  +'\n' + '\u0020' + '\u0020'
  + 'components: {},' + '\n'
  + '\u0020' + '\u0020' 
  + 'props: {},' + '\n'
  + '\u0020' + '\u0020'
  + 'data () {' 
  + '\n' + '\u0020' + '\u0020' + '\u0020' + '\u0020'
  + 'return {' + '\n'
  + '\u0020' + '\u0020' + '\u0020' + '\u0020' + '\u0020' + '\u0020'
  + 'form: {},' + '\n'
  + '\u0020' + '\u0020' + '\u0020' + '\u0020' + '\u0020' + '\u0020'
  + 'rules: {}' + '\n'
  + '\u0020' + '\u0020' + '\u0020' + '\u0020' + '}' + '\n'
  + '\u0020' + '\u0020' + '},' + '\n' + '\u0020' + '\u0020'
  + 'created () {},' + '\n'
  + '\u0020' + '\u0020' + 'methods: {}' + '\n' + '}' + '\n' + '\n'
  + '</script>' + '\n' + '\n'
  + '<style>' + '</style>'
  return template
}

module.exports = utils