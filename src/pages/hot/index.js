import Taro from '@tarojs/taro';
import { View, Text, Image } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import { getHot } from '../../api/index';
import { setGlobalData, update, updateLyric } from '../../redux/actions';
import { $GetDateTime } from '../../utils/index'
import './index.scss';
import '../SongList/index.scss';
import play_list from '../../assets/images/play-list.png';
import pause_item from '../../assets/images/pause-item.png';

@connect(
  ({ global }) => ({
    global
  }),
  dispatch => ({
    setGlobalData() {
      dispatch(setGlobalData());
    },
    update() {
      dispatch(update());
    },
    updateLyric() {
      dispatch(updateLyric());
    }
  })
)
export default class HotList extends Taro.Component {
  constructor() {
    super(...arguments);
    this.state = {
      hotList: [], //歌
      time: new Date().getTime()
    };
    this.insert_list = this.insert_list.bind(this);
  }

  componentWillMount() {
    getHot({ idx: 1 }).then(res => {
      let arr = [];
      for (let item of res.playlist.tracks) {
        arr.push({
          al: { picUrl: item.al.picUrl, name: item.al.name },
          ar: item.ar,
          name: item.name,
          id: item.id
        });
      }
      this.setState({
        hotList: arr,
        time: res.playlist.updateTime
      });
    });
  }

  /**
   * 跳转到歌曲详情页
   * @method go
   * @param {Object} item 当前歌曲的详细信息
   * @return {undefined}
   */
  go(item) {
    //如歌没有播放歌曲 或者 播放的不是当前歌曲,则播放当前歌曲
    if (!this.props.global.song || this.props.global.song.id !== item.id) {
      this.props.dispatch(setGlobalData({ key: 'song', value: item }));
    }
    //改变播放列表
    this.insert_list(item);
    Taro.navigateTo({
      url: `/pages/Song/index?id=${item.id}`
    });
  }
  /**
   * 播放当前歌曲
   * @method play
   * @param {Object} item 当前歌曲的详细信息
   * @return {undefined}
   */
  play(item, e) {
    //获取播放器
    let audio = this.props.global.audio;
    //如果点击的是当前歌曲,则仅改变播放状态
    if (this.props.global.song && this.props.global.song.id === item.id) {
      if (audio.paused) {
        audio.play();
      } else {
        audio.pause();
      }
      //更新歌曲的全局变量
      this.props.dispatch(setGlobalData({ key: 'audio', value: audio }));
      return;
    }
    //更新歌曲的全局变量
    this.props.dispatch(setGlobalData({ key: 'song', value: item }));

    //获取当前播放的歌曲
    let song = this.props.global.song;
    //改变播放列表
    this.insert_list(song);

    //更新播放为当前歌曲
    this.props.dispatch(update({ item }));
    //更新歌词
    this.props.dispatch(updateLyric({ id: item.id }));

    e.stopPropagation();
  }

  /**
   * 将歌曲插入到正在播放歌曲的后面
   * @method playAll
   * @return {undefined}
   */
  insert_list() {
      // 将热歌全部添加到播放列表里面
      this.props.dispatch(setGlobalData({ key: 'songList', value: this.state.hotList }))
      //播放模式切换为顺序播放
      this.props.dispatch(setGlobalData({ key: 'mode', value: 2 }))
  }

  render() {
    let paused = this.props.global.audio && this.props.global.audio.paused;
    let audioId = this.props.global.audio && this.props.global.audio.id;
    return (
      <View className='Hot SongList'>
        <View className='coverBox'>
          <View className='cover' />
          <Text className='time'>更新日期 {$GetDateTime(new Date(this.state.time), 'm月d日')}</Text>
        </View>
        {this.state.hotList.map((item, index) => {
          return (
            <View className='item' key='index' onClick={this.go.bind(this, item)}>
              <View className='left'>{index + 1}</View>
              <View className='box'>
                <View className='middle'>
                  <View className='ellipsis'>{item.name}</View>
                  <Text className='ellipsis'>
                    {item.ar
                      .map(i => {
                        return i.name;
                      })
                      .join(' / ')}{' '}
                    - {item.al.name}
                  </Text>
                </View>
                <View className='right' onClick={this.play.bind(this, item)}>
                  <Image src={!paused && item.id == audioId ? pause_item : play_list} />
                </View>
              </View>
            </View>
          );
        })}
      </View>
    );
  }
}
