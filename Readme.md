# 识别word文档中的表格转换为.vue文件（主要是针对表单）

* 当表单数目比较多，手动创建各个表单文件费时、费力、费眼睛（挨个对字段）

## 使用说明

* 启动项目
* 项目启动后在浏览器调用：http://localhost:3000/wordConvertXml
* 然后再调用：http://localhost:3000/xmlConvertVue
* 在pages文件下会生成对应word表格中的.vue文件

## 注意事项

* 本项目使用表单模板为ant design的组件，如需更改请在utils中plate、getText方法中进行更改
* word文档中表格每列字段名称对应在utils文件中的transArrayKey方法中explain（目前是手动修改的），根据explain限制生成的表单是输入框/下拉选择/日期选择等