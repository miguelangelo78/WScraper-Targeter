var data = require('sdk/self').data;
var pageMod = require("sdk/page-mod");

pageMod.PageMod({
  include: "*",
  contentScriptFile: [data.url('jquery.js'), data.url('data_script.js')]
});