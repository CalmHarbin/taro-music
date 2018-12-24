import Taro from '@tarojs/taro'
import { getSong } from '../api/index'

const backgroundAudioManager = Taro.getBackgroundAudioManager();//当前播放的音频
const globalData = {
    song: null,//当前播放歌曲数据
    audio: backgroundAudioManager,
    mode: 2,//当前播放模式,1-单曲循环,2-顺序播放,3-随机播放
    songList: [],//播放列表
}

backgroundAudioManager.onEnded(() => {
    console.log(globalData.song.src)
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
                    getSong({id: globalData.songList[0].id}).then((res) => {
                        backgroundAudioManager.src = res.data[0].url;
                        backgroundAudioManager.coverImgUrl = globalData.songList[0].al.picUrl;
                        backgroundAudioManager.singer  = globalData.songList[0].ar.map(i => {return i.name}).join(' / ');
                        backgroundAudioManager.title   = globalData.songList[0].name;
                        backgroundAudioManager.id = globalData.songList[0].id;

                        globalData.song = globalData.songList[0];
                        globalData.song.src = res.data[0].url;
                    })
                } else {
                    getSong({id: globalData.songList[index + 1].id}).then((res) => {
                        backgroundAudioManager.src = res.data[0].url;
                        backgroundAudioManager.coverImgUrl = globalData.songList[index + 1].al.picUrl;
                        backgroundAudioManager.singer  = globalData.songList[index + 1].ar.map(i => {return i.name}).join(' / ');
                        backgroundAudioManager.title   = globalData.songList[index + 1].name;
                        backgroundAudioManager.id = globalData.songList[index + 1].id;

                        globalData.song = globalData.songList[index + 1];
                        globalData.song.src = res.data[0].url;
                    })
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
            getSong({id: globalData.songList[random].id}).then((res) => {
                backgroundAudioManager.src = res.data[0].url;
                backgroundAudioManager.coverImgUrl = globalData.songList[random].al.picUrl;
                backgroundAudioManager.singer  = globalData.songList[random].ar.map(i => {return i.name}).join(' / ');
                backgroundAudioManager.title   = globalData.songList[random].name;
                backgroundAudioManager.id = globalData.songList[random].id;

                globalData.song = globalData.songList[random];
                globalData.song.src = res.data[0].url;
            })
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
                //播放上一首
                getSong({id: globalData.songList[index - 1].id}).then((res) => {
                    backgroundAudioManager.src = res.data[0].url;
                    backgroundAudioManager.coverImgUrl = globalData.songList[index - 1].al.picUrl;
                    backgroundAudioManager.singer  = globalData.songList[index - 1].ar.map(i => {return i.name}).join(' / ');
                    backgroundAudioManager.title   = globalData.songList[index - 1].name;

                    backgroundAudioManager.id = globalData.songList[index - 1].id;
                    backgroundAudioManager._name = globalData.songList[index - 1].name;//歌曲名
                    backgroundAudioManager._singer = globalData.songList[index - 1].ar.map(i => {return i.name}).join(' / ');//歌曲名
                    backgroundAudioManager._picUrl = globalData.songList[index - 1].al.picUrl;//图片地址
    
                    globalData.song = globalData.songList[index - 1];
                    globalData.song.src = res.data[0].url;
                    resolve(backgroundAudioManager);
                })
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
                //播放下一首
                getSong({id: globalData.songList[index + 1].id}).then((res) => {
                    backgroundAudioManager.src = res.data[0].url;
                    backgroundAudioManager.coverImgUrl = globalData.songList[index + 1].al.picUrl;
                    backgroundAudioManager.singer  = globalData.songList[index + 1].ar.map(i => {return i.name}).join(' / ');
                    backgroundAudioManager.title   = globalData.songList[index + 1].name;
                    
                    backgroundAudioManager.id = globalData.songList[index + 1].id;
                    backgroundAudioManager._name = globalData.songList[index + 1].name;//歌曲名
                    backgroundAudioManager._singer = globalData.songList[index + 1].ar.map(i => {return i.name}).join(' / ');//歌曲名
                    backgroundAudioManager._picUrl = globalData.songList[index + 1].al.picUrl;//图片地址

                    globalData.song = globalData.songList[index + 1];
                    globalData.song.src = res.data[0].url;

                    resolve(backgroundAudioManager);
                })
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