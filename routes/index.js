const router = require('koa-router')()
const AdmZip = require('adm-zip')
const fs = require('fs')
const path = require('path')
const utils = require('./utils')

router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: 'Welcome to the world of converting word documents into Vue form files!'
  })
})

router.get('/xmlConvertVue', async (ctx, next) => {
  const docxData = fs.readFileSync(path.resolve(__dirname, '../public/zipResult/word/document.xml'), 'utf8') //读取word文件转换后的XML文件
  const matchTbl = docxData.toString().match(/<w:tbl>.*?<\/w:tbl>/gi) //匹配XML文件的<w:tbl>（表格）
  const array = utils.transXmlToArray(matchTbl)
  const lastList = utils.transArrayKey(array) //根据XML文件的内容，把表格转为vue文件格式

  for (let i = 0; i < lastList.length; i++) {
    fs.writeFile(`./pages/${lastList[i].name}.vue`, lastList[i].text, (err) => {  //创建的*.vue文件存放路径
    })
  }
  
  ctx.body = 'VUE文件创建成功'
})

router.get('/wordConvertXml', async (ctx, next) => {
  // const zip = new AdmZip()
  const zip = new AdmZip('C:/project/out/auto-vue-file/public/outFile/auto-test.docx') //需要转换的word文件地址
  zip.extractAllTo('C:/project/out/auto-vue-file/public/zipResult') //word文件转换后存放的位置
  const data = fs.readFileSync(path.resolve(__dirname, '../public/zipResult/word/document.xml')) //读取word文件转换后的XML文件
  if (data) {
    ctx.body = '文件解析成功'
  } else {
    ctx.body = '文件解析失败'
  }
})

module.exports = router
