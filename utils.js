/*
  @ author: leeenx
  @ 微信手Q常用js
*/

// 封装微信手Q的 visibilitychange 事件
document.addEventListener("qbrowserVisibilityChange", function(e){
    var evt = document.createEvent("HTMLEvents"); 
    evt.initEvent("visibilitychange", false, false); 
    evt.hidden = e.hidden; 
    document.dispatchEvent(evt); 
}, true); 
document.addEventListener("visibilitychange", function(e) {
    e.hidden = e.hidden === undefined ? document.hidden : e.hidden; 
}, true); 
