import { UPDATELYRIC, UPDATE, SETGLOBALDATA, PREVSONG, NEXTSONG } from './constants';
import { getSong, getLyric } from '../api/index';

export const updateLyric = payload => dispatch => {
  let { id } = payload;
  getLyric({ id: id }).then(res => {
    let LyricList =
      res.lrc &&
      res.lrc.lyric.split('\n').map(item => {
        let arr = item.split(']');
        return {
          time: arr[0].substr(1),
          Text: arr[1]
        };
      });
    // backgroundAudioManager._picUrl = LyricList; //歌词
    dispatch({
      type: UPDATELYRIC,
      payload: {
        LyricList
      }
    });
  });
};

export const update = payload => dispatch => {
  let { item } = payload;
  getSong({ id: item.id }).then(res => {
    dispatch({
      type: UPDATE,
      payload: {
        src: res.data[0].url,
        coverImgUrl: item.al.picUrl,
        singer: item.ar
          .map(i => {
            return i.name;
          })
          .join(' / '),
        title: item.name,
        id: item.id,
        _name: item.name,
        _singer: item.ar
          .map(i => {
            return i.name;
          })
          .join(' / '),
        _picUrl: item.al.picUrl,
        song: item,
        callback: payload.callback
      }
    });
  });
};

export const setGlobalData = payload => dispatch => {
  dispatch({
    type: SETGLOBALDATA,
    payload
  });
};

export const prev = payload => dispatch => {
  dispatch({
    type: PREVSONG,
    payload
  });
};

export const next = payload => dispatch => {
  dispatch({
    type: NEXTSONG,
    payload
  });
};
