import Taro from '@tarojs/taro';
import { getSong, getLyric } from '../api/index';

const backgroundAudioManager = Taro.getBackgroundAudioManager(); //当前播放的音频
const globalData = {
  song: null, //当前播放歌曲数据
  audio: backgroundAudioManager,
  mode: 1, //当前播放模式,1-单曲循环,2-顺序播放,3-随机播放
  songList: [] //播放列表
};
