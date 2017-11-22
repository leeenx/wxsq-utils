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

// 保证音频快速切换操作不报错
var audioProto = HTMLAudioElement.prototype; 
audioProto._play = audioProto.play; 
audioProto._load = audioProto.load; 
audioProto.play = function() { 
    // 保证状态为4
    if(this.readyState !== 4) {
    	var that = this; 
    	var siv = setInterval(function() {
    		if(that.readyState === 4) { 
    			clearInterval(siv); 
    			that._play(); 
    		}
    	}, 100); 
    }
    else {
    	this._play(); 
    }
}
audioProto.load = function() { 
    // 如果状态为 0 执行下载
    if(this.readyState === 0) {
        this._load(); 
    }
}

audioProto._pause = audioProto.pause; 
audioProto.pause = function() { 
    // 保证状态为4
	if(this.readyState !== 4) {
    	var that = this; 
    	var siv = setInterval(function() {
    		if(that.readyState === 4) { 
    			clearInterval(siv); 
    			that._pause(); 
    		}
    	}, 100); 
    }
    else {
    	this._pause(); 
    } 
}

