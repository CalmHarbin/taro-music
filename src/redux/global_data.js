import Taro from '@tarojs/taro'
import { getSong, getLyric } from '../api/index'

const backgroundAudioManager = Taro.getBackgroundAudioManager();//当前播放的音频
const globalData = {
    song: null,//当前播放歌曲数据
    audio: backgroundAudioManager,
    mode: 2,//当前播放模式,1-单曲循环,2-顺序播放,3-随机播放
    songList: [],//播放列表
}
//更新歌词
function updateLyric(id) {
    getLyric({id: id}).then(res => {
        let LyricList = res.lrc.lyric.split('\n').map(item => {
            let arr = item.split(']');
            return {
                time: arr[0].substr(1),
                Text: arr[1]
            }
        })
        backgroundAudioManager._picUrl = LyricList;//歌词
    })
}
//更新歌曲
function update(item) {
    return new Promise(resolve => {
        getSong({id: item.id}).then((res) => {
            backgroundAudioManager.src = res.data[0].url;
            backgroundAudioManager.coverImgUrl = item.al.picUrl;
            backgroundAudioManager.singer  = item.ar.map(i => {return i.name}).join(' / ');
            backgroundAudioManager.title   = item.name;
            backgroundAudioManager.id = item.id;
            backgroundAudioManager._name = item.name;//歌曲名
            backgroundAudioManager._singer = item.ar.map(i => {return i.name}).join(' / ');//歌曲名
            backgroundAudioManager._picUrl = item.al.picUrl;//图片地址
    
            globalData.song = item;
            globalData.song.src = res.data[0].url;

            resolve(res)
        })
    })
}

backgroundAudioManager.onEnded(() => {
    if(globalData.mode === 1) {
        //单曲循环则重新播放;
        backgroundAudioManager.src = globalData.song.src;
        backgroundAudioManager.coverImgUrl = globalData.song.al.picUrl;
        backgroundAudioManager.singer  = globalData.song.ar.map(i => {return i.name}).join(' / ');
        backgroundAudioManager.title   = globalData.song.name;
        backgroundAudioManager.id = globalData.song.id;
    } else if(globalData.mode === 2) {
        //顺序播放则播放下一首
        for(let [index,item] of globalData.songList.entries()) {
            if(item.id === globalData.song.id) {
                //如果当前歌曲是播放列表最后一首则播放第一首;
                if(index === globalData.songList.length - 1) {
                    updateLyric(globalData.songList[0].id)
                    update(globalData.songList[0])
                } else {
                    updateLyric(globalData.songList[index + 1].id)
                    update(globalData.songList[index + 1])
                }
                return;
            }
        }
    } else if(globalData.mode === 3) {
        //随机播放
        let random = Math.floor(Math.random() * globalData.songList.length);//随机产生一个索引
        if(globalData.songList[random].id === globalData.song.id) {
            //如果随机歌曲与当前歌曲相同
            backgroundAudioManager.src = globalData.song.src;
            backgroundAudioManager.coverImgUrl = globalData.song.al.picUrl;
            backgroundAudioManager.singer  = globalData.song.ar.map(i => {return i.name}).join(' / ');
            backgroundAudioManager.title   = globalData.song.name;
            backgroundAudioManager.id = globalData.song.id;
        } else {
            updateLyric(globalData.songList[random].id)
            update(globalData.songList[random])
        }
    }
})

export function prevSong() {
    return new Promise(resolve => {
        for(let [index,item] of globalData.songList.entries()) {
            if(item.id === globalData.song.id) {
                if(index === 0) {
                    Taro.showToast({
                        title: '没有了 o(╥﹏╥)o ',
                        icon: 'none',
                        duration: 1000
                    })
                    return;
                }
                updateLyric(globalData.songList[index - 1].id);
                update(globalData.songList[index - 1]).then(() => {
                    resolve(backgroundAudioManager);
                });
                return;
            }
        }
    })
    
}

export function nextSong() {
    return new Promise(resolve => {
        for(let [index,item] of globalData.songList.entries()) {
            console.log(item.id, globalData.song.id, item.id === globalData.song.id)
            if(item.id === globalData.song.id) {
                console.log(index, globalData.songList.length - 1)
                if(index === globalData.songList.length - 1) {
                    Taro.showToast({
                        title: '没有了 o(╥﹏╥)o ',
                        icon: 'none',
                        duration: 1000
                    })
                    return;
                }
                updateLyric(globalData.songList[index + 1].id);
                update(globalData.songList[index + 1]).then(() => {
                    resolve(backgroundAudioManager);
                });
                return;
            }
        }
    })
}

export function setglobalData (key, val) {
    globalData[key] = val
}

export function getglobalData (key) {
    return globalData[key]
}