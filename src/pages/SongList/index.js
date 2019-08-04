import Taro from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import { getSongList } from '../../api/index';
import { setGlobalData, update, updateLyric } from '../../redux/actions';
import SongFooter from '../../components/SongFooter/index';
import './index.scss';
import play_cell from '../../assets/images/play-cell.png';
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
export default class SongList extends Taro.Component {
  config = {
    navigationBarTitleText: '歌单'
  };
  constructor() {
    super(...arguments);
    this.state = {
      subscribedCount: 0, //收藏数量
      SongList: [] //展示列表
    };
  }
  componentWillMount() {
    Taro.showLoading({
      title: 'loading'
    });
    getSongList({ id: this.$router.params.id }).then(res => {
      try {
        let arr = [];
        for (let item of res.playlist.tracks) {
          arr.push({
            al: { picUrl: item.al.picUrl, name: item.al.name },
            ar: item.ar,
            name: item.name,
            id: item.id
          });
        }
        this.setState(
          {
            subscribedCount: res.playlist.subscribedCount,
            SongList: arr
          },
          () => {
            Taro.hideLoading();
          }
        );
      } catch (err) {}
    });
  }
  //页面显示时触发
  componentDidShow() {}
  /**
   * 跳转到歌曲详情页
   * @method go
   * @param {Object} item 当前歌曲的详细信息
   * @return {undefined}
   */
  go(item) {
    if (!this.props.global.song || this.props.global.song.id !== item.id) {
      this.props.dispatch(setGlobalData({ key: 'song', value: item }));
    }
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

    // 更新播放列表相关-start
    //获取播放列表
    let songList = this.props.global.songList;
    //先判断点击的歌曲是否在播放列表里面
    let isExist = false;
    songList.forEach(song_item => {
      if (song_item.id === song.id) {
        isExist = true;
      }
    });
    //将点击的歌曲插入到正在播放歌曲的后面
    if (!isExist) {
      let idx = 0; //默认当前播放的歌曲为0
      songList.forEach((song_item, index) => {
        if (song_item.id === audio.id) {
          idx = index;
        }
      });
      songList.splice(idx + 1, 0, song);
    }
    // 更新播放列表相关-end

    //更新播放为当前歌曲
    this.props.dispatch(update({ item }));
    //更新歌词
    this.props.dispatch(updateLyric({ id: item.id }));

    audio.onCanplay(() => {
      //更新底部播放的状态
      this.refs.SongFooter.update();
    });
    e.stopPropagation();
  }
  /**
   * 播放全部
   * @method playAll
   * @return {undefined}
   */
  playAll() {
    if (!this.state.SongList.length) return;
    let audio = this.props.global.audio;

    //切换为顺序播放
    this.props.dispatch(setGlobalData({ key: 'mode', value: 2 }));
    //更新播放列表
    this.props.dispatch(setGlobalData({ key: 'songList', value: this.state.SongList }));
    this.props.dispatch(setGlobalData({ key: 'song', value: this.state.SongList[0] }));
    //播放第一首歌
    //更新播放为当前歌曲
    this.props.dispatch(update({ item: this.state.SongList[0] }));
    //更新歌词
    this.props.dispatch(updateLyric({ id: this.state.SongList[0].id }));

    audio.onCanplay(() => {
      //更新底部播放的状态
      this.refs.SongFooter.update();
    });
  }
  /**
   * 收藏全部
   * @method Collection
   * @return {undefined}
   */
  Collection() {
    Taro.showToast({
      title: '暂不支持收藏',
      icon: 'none',
      duration: 1000
    });
  }

  render() {
    let paused = this.props.global.audio && this.props.global.audio.paused;
    let audioId = this.props.global.audio && this.props.global.audio.id;

    return (
      <View className='SongList'>
        <View className='header'>
          <Image src={play_cell} onClick={this.playAll.bind(this)} />
          <View className='left' onClick={this.playAll.bind(this)}>
            播放全部<Text>(共{this.state.SongList.length}首)</Text>
          </View>
          <View className='right' onClick={this.Collection.bind(this)}>
            + 收藏({this.state.subscribedCount})
          </View>
        </View>
        {this.state.SongList.map((item, index) => {
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
        <SongFooter ref='SongFooter' />
      </View>
    );
  }
}
