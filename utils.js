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
                that[i] = audio[i]; 
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
        if(audio.readyState <= 1 && this.loadStart !== true) {  
            audio.load(); 
            // 标记已经触发下载事件
            this.loadStart = true; 
        }
    }

    // 默认是暂停
    this.paused = true; 

    // 重写方法 play
    this.play = function() { 
        if(that.paused !== true) return; 
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
                    that.play(); 
                }
            }, 100); 
        }
        // 正常播放
        else {
            // 如果是静音恢复自动更新 currentTime， 如果非静音 audio 直接播放 
            that.isMuted === true ? this.updateCurrentTime() : audio.play(); 
            that.paused = false; 
        }
    }
    // 重写方法 pause
    this.pause = function() { 
        if(that.paused === true) return; 
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
            // 如果是静音取消自动更新 currentTime；如果非静音 audio 直接暂停
            that.isMuted === true ? this.stopUpdateCurrentTime() : audio.pause(); 
            that.paused = true; 
        } 
    }

    // 默认非静音
    this.isMuted = false; 

    // 静音属性
    Object.defineProperty(this, "muted", { 
        set: function(value) { 
            if(this.isMuted === value) return; 
            this.isMuted = value; 
            // 设置静音
            if(true === value) {
                // 如果系统不处于暂停状态下，暂停 audio 同时更新 currentTime
                this.paused !== true && audio.pause() & this.updateCurrentTime(); 
            }
            // 取消静音
            else { 
                // 如果系统不处于暂停状态下，播放 audio 同时取消更新 currentTime
                this.paused !== true && audio.play() & this.stopUpdateCurrentTime(); 
            }
        }, 
        get: function() {
            return this.isMuted; 
        }
    }); 

    // 更新当前时间
    this.updateCurrentTime = function() { 
        if(typeof(requestAnimationFrame) !== "undefined") { 
            that.autoUpdateCurrentTime(0); 
        }
    }

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

    // 停止更新当前时间
    this.stopUpdateCurrentTime = function() { 
        if(typeof(cancelAnimationFrame) !== "undefined") { 
            cancelAnimationFrame(that.RAF); 
        }
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

