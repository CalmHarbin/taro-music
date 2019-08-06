import Taro from '@tarojs/taro';
import { UPDATELYRIC, UPDATE, SETGLOBALDATA, PREVSONG, NEXTSONG } from './constants';
import {} from './actions';
// import configStore from './store';

// const store = configStore();
// console.log(Taro.Component);

// const backgroundAudioManager = Taro.getBackgroundAudioManager(); //当前播放的音频
const STATE = {
  song: null, //当前播放歌曲数据
  song: {
    al: {
      picUrl: 'http://p1.music.126.net/gk7CUPP62r9bidqVJwgNhQ==/109951163375219616.jpg', //图片
      name: 'PIT' //名字
    },
    id: null, //id
    src: '', //地址
    _singer: '' //歌手
  }, //当前播放歌曲数据
  audio: null,
  mode: 1, //当前播放模式,1-单曲循环,2-顺序播放,3-随机播放
  songList: [] //播放列表
};

export default function counter(state = STATE, action) {
  let audio = state.audio;
  let songs = state.song;
  switch (action.type) {
    case UPDATELYRIC:
      //更新歌词

      audio._picUrl = action.payload.LyricList;

      console.log('更新歌词', action.payload.LyricList);
      return {
        ...state,
        audio
      };
    case UPDATE:
      let { src, coverImgUrl, singer, title, id, _name, _singer, _picUrl, song } = action.payload;

      audio.src = src;
      audio.coverImgUrl = coverImgUrl;
      audio.singer = singer;
      audio.title = title;
      audio.id = id;
      audio._name = _name;
      audio._singer = _singer;
      audio._picUrl = _picUrl;
      songs = song;
      songs.src = src;
      console.log(action.payload.callback);
      action.payload.callback && action.payload.callback();
      return {
        ...state,
        audio,
        song: songs
      };
    case SETGLOBALDATA:
      let { key, value } = action.payload;
      state[key] = value;
      return {
        ...state
      };
    case PREVSONG:
      for (let [index, item] of state.songList.entries()) {
        if (item.id === state.song.id) {
          if (index === 0) {
            Taro.showToast({
              title: '没有了 o(╥﹏╥)o ',
              icon: 'none',
              duration: 1000
            });
            return {
              ...state,
              audio
            };
          }
          action.payload.callback(state.songList[index - 1]);
        }
      }
      return {
        ...state,
        audio
      };
    case NEXTSONG:
      for (let [index, item] of state.songList.entries()) {
        if (item.id === state.song.id) {
          console.log(item.id);
          if (index === state.songList.length - 1) {
            Taro.showToast({
              title: '没有了 o(╥﹏╥)o ',
              icon: 'none',
              duration: 1000
            });
          }
          action.payload.callback(state.songList[index + 1]);
          return {
            ...state,
            audio
          };
        }
      }
      return {
        ...state,
        audio
      };
    default:
      return state;
  }
}
