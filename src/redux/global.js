import Taro from '@tarojs/taro';
import { UPDATELYRIC, UPDATE, SETGLOBALDATA, PREVSONG, NEXTSONG } from './constants';
import { updateLyric, update } from './actions';

const backgroundAudioManager = Taro.getBackgroundAudioManager(); //当前播放的音频
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
  audio: backgroundAudioManager,
  mode: 1, //当前播放模式,1-单曲循环,2-顺序播放,3-随机播放
  songList: [] //播放列表
};

// //播放完毕事假
// backgroundAudioManager.onEnded(() => {
//     if (STATE.mode === 1) {
//       //单曲循环则重新播放;

//       backgroundAudioManager.src = STATE.song.src;
//       backgroundAudioManager.coverImgUrl = STATE.song.al.picUrl;
//       backgroundAudioManager.singer = STATE.song.ar
//         .map(i => {
//           return i.name;
//         })
//         .join(' / ');
//       backgroundAudioManager.title = STATE.song.name;
//       backgroundAudioManager.id = STATE.song.id;
//     } else if (STATE.mode === 2) {
//       //顺序播放则播放下一首
//       for (let [index, item] of STATE.songList.entries()) {
//         if (item.id === STATE.song.id) {
//           //如果当前歌曲是播放列表最后一首则播放第一首;
//           if (index === STATE.songList.length - 1) {
//             updateLyric(STATE.songList[0].id);
//             update(STATE.songList[0]);
//           } else {
//             updateLyric(STATE.songList[index + 1].id);
//             update(STATE.songList[index + 1]);
//           }
//           return;
//         }
//       }
//     } else if (STATE.mode === 3) {
//       //随机播放
//       let random = Math.floor(Math.random() * STATE.songList.length); //随机产生一个索引
//       if (STATE.songList[random].id === STATE.song.id) {
//         //如果随机歌曲与当前歌曲相同
//         backgroundAudioManager.src = STATE.song.src;
//         backgroundAudioManager.coverImgUrl = STATE.song.al.picUrl;
//         backgroundAudioManager.singer = STATE.song.ar
//           .map(i => {
//             return i.name;
//           })
//           .join(' / ');
//         backgroundAudioManager.title = STATE.song.name;
//         backgroundAudioManager.id = STATE.song.id;
//       } else {
//         updateLyric(STATE.songList[random].id);
//         update(STATE.songList[random]);
//       }
//     }
//   });

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
              ...state
            };
          }
          action.payload.callback(state.songList[index - 1]);
        }
      }
      return {
        ...state
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
            ...state
          };
        }
      }
      return {
        ...state
      };
    default:
      return state;
  }
}
