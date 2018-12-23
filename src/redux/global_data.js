
import Taro from '@tarojs/taro'

const backgroundAudioManager = Taro.getBackgroundAudioManager();//当前播放的音频
const globalData = {
    song: null,//当前播放歌曲数据
    audio: backgroundAudioManager,
}

export function setglobalData (key, val) {
    globalData[key] = val
}

export function getglobalData (key) {
    return globalData[key]
}