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

// 定制的音频
var XAudio = function() { 
    // 创建一个音频对象
    var audio = new Audio(); 
    var that = this; 
    // 把音频的属性挂载到 this 上
    for(var i in audio) {
        ~function(i) {
            if("muted" === i || "paused" === i) return; 
            // 对象类型属性，直接挂载到 this
            if(typeof(audio[i]) === "object") {
                this[i] = audio[i]; 
            }
            // 函数类型属性，间接挂载
            else if(typeof(audio[i]) === "function") { 
                that[i] = function() { 
                audio[i].apply(audio, arguments); 
            } 
            }
            // 非引用类型
            else { 
                Object.defineProperty(that, i, 
                    {
                        get: function() { 
                            return audio[i]; 
                        }, 
                        set: function(value) {
                            audio[i] = value; 
                        }
                    }
                )
            }
        }(i); 
    }

    // 重写方法 load
    this.load = function() {
        // 如果状态为 0 执行下载
        if(audio.readyState === 0 && this.loadStart !== true) {
            audio.load(); 
            // 标记已经触发下载事件
            this.loadStart = true; 
        }
    }

    // 默认是暂停
    this.paused = true; 

    // 重写方法 play
    this.play = function() {
        // 未执行 load
        if(this.loadStart !== true) { 
            this.load(); 
            this.play(); 
        } 
        // 保证状态不为 0
        else if(audio.readyState === 0) { 
            var siv = setInterval(function() {
                if(audio.readyState > 0) { 
                    clearInterval(siv); 
                    // 非静音下操作 audio
                    that.muted === true || audio.play(); 
                    that.paused = false; 
                }
            }, 100); 
        }
    }
    // 重写方法 pause
    this.pause = function() {
        // 保证状态不为 0
        if(audio.readyState === 0) { 
            var siv = setInterval(function() {
                if(audio.readyState > 0) { 
                    clearInterval(siv); 
                    that.pause(); 
                }
            }, 100); 
        }
        else { 
            // 非静音下操作 audio
            that.muted === true || audio.pause(); 
            that.paused = true; 
        } 
    }

    // 默认非静音
    this.muted = false; 

    /* 
        @ 
        @ skipUpdate 参数表示是否跳过更新音频当前时间
        @ 为了性能默认跳过
        @ 需要注意的是 skipUpdate === true 时，timeupdate 事件不会被触发
    */
    this.mute = function(skipUpdate) { 
        if(that.muted === true) return;
        skipUpdate = typeof skipUpdate === "undefined" || skipUpdate; 
        // 如果系统处于暂停状态不操作 audio
        that.paused === true || audio.pause(); 
        that.muted = true; 
        // 不跳过更新时间
        if(skipUpdate !== true) {
            that.updateCurrentTime(); 
        }
    }

    // 取消静音方法 unmute 
    this.unmute = function() { 
        if(that.muted === false) return;
        // 如果系统处于暂停状态不操作 audio
        that.paused === true && audio.play(); 
        that.muted = false; 
        if(typeof(cancelAnimationFrame) !== "undefined") {
            cancelAnimationFrame(that.RAF); 
        }
    }

    // 更新当前时间
    this.updateCurrentTime = function() { 
        if(typeof(requestAnimationFrame) !== "undefined") { 
            that.RAF = that.autoUpdateCurrentTime(0); 
        }
    }

    var t = 0; 

    // 自动更新当前时间
    this.autoUpdateCurrentTime = function(timestamp) { 
        if(timestamp === 0) that.timestamp = timestamp; 
        else {
            var elapsed = timestamp - that.timestamp; 
            // 时间间隔超过 250ms 更新 currentTime
            if(elapsed >= 250) {
                audio.currentTime = audio.currentTime + elapsed / 1000; 
                that.timestamp = timestamp; 
            }
        }
        that.RAF = requestAnimationFrame(that.autoUpdateCurrentTime); 
    }

    // 与 audio.currentTime 做对比的参量
    that._currentTime = -1; 

    // 修正 timeupdate 多次触发
    audio.addEventListener("timeupdate", function(e) { 
        // 阻止重复事件
        if(that._currentTime === audio.currentTime) {
            e.stopImmediatePropagation(); 
        }
        // 重新赋值 that._currentTime
        else {
            that._currentTime = audio.currentTime; 
        }
    })
}; 

// 微信环境
if(/micromessenger/i.test(navigator.userAgent) === true) { 
	document.addEventListener("WeixinJSBridgeReady", function () { 
		// todo
	});
}
// 非微信环境
else {
	// todo
}

