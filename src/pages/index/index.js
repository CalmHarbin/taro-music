import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import { AtTabs, AtTabsPane } from 'taro-ui';
import Recommend from '../Recommend/index';
import Search from '../Search/index';
import HotList from '../hot/index';
import SongFooter from '../../components/SongFooter/index';
import { setGlobalData, updateLyric, update } from '../../redux/actions';
import './index.scss';

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
export default class Index extends Taro.Component {
  constructor() {
    super(...arguments);
    this.state = {
      current: 0
    };
  }
  componentWillMount() {
    let audio = Taro.getBackgroundAudioManager();

    //播放完毕事假
    audio.onEnded(() => {
      let STATE = this.props.global;
      if (STATE.mode === 1) {
        //单曲循环则重新播放;
        audio.src = STATE.song.src;
        audio.coverImgUrl = STATE.song.al.picUrl;
        audio.singer = STATE.song.ar
          .map(i => {
            return i.name;
          })
          .join(' / ');
        audio.title = STATE.song.name;
        audio.id = STATE.song.id;
      } else if (STATE.mode === 2) {
        //顺序播放则播放下一首
        for (let [index, item] of STATE.songList.entries()) {
          if (item.id === STATE.song.id) {
            //如果当前歌曲是播放列表最后一首则播放第一首;
            if (index === STATE.songList.length - 1) {
              //初始化全局的背景音频播放器
              this.props.dispatch(update({ item: STATE.songList[0] }));
              this.props.dispatch(updateLyric({ id: STATE.songList[0].id }));
            } else {
              this.props.dispatch(update({ item: STATE.songList[index + 1] }));
              this.props.dispatch(updateLyric({ id: STATE.songList[index + 1].id }));
            }
            return;
          }
        }
      } else if (STATE.mode === 3) {
        //随机播放
        let random = Math.floor(Math.random() * STATE.songList.length); //随机产生一个索引
        if (STATE.songList[random].id === STATE.song.id) {
          //如果随机歌曲与当前歌曲相同
          audio.src = STATE.song.src;
          audio.coverImgUrl = STATE.song.al.picUrl;
          audio.singer = STATE.song.ar
            .map(i => {
              return i.name;
            })
            .join(' / ');
          audio.title = STATE.song.name;
          audio.id = STATE.song.id;
        } else {
          this.props.dispatch(update({ item: STATE.songList[random] }));
          this.props.dispatch(updateLyric({ id: STATE.songList[random].id }));
        }
      }
    });
    //初始化全局的背景音频播放器
    this.props.dispatch(setGlobalData({ key: 'audio', value: audio }));

    audio.onCanplay(() => {
        //更新底部播放的状态
        this.refs.SongFooter.update()
    })
  }
  //页面显示时触发
  componentDidShow() {
    //   监听播放和暂停事件
    this.props.global.audio.onPlay(() => {
      this.refs.SongFooter.onPlay()
    })
    this.props.global.audio.onPause(() => {
      this.refs.SongFooter.onPause()
    })
  }
  handleClick(value) {
    this.setState({
      current: value
    });
  }

  render() {
    const tabList = [{ title: '推荐' }, { title: '热歌榜' }, { title: '搜索' }];
    return (
      <View>
        <AtTabs
          swipeable
          current={this.state.current}
          tabList={tabList}
          onClick={this.handleClick.bind(this)}
        >
          <AtTabsPane current={this.state.current} index={0}>
            <Recommend />
          </AtTabsPane>
          <AtTabsPane current={this.state.current} index={1}>
            <HotList />
          </AtTabsPane>
          <AtTabsPane current={this.state.current} index={2}>
            <Search />
          </AtTabsPane>
        </AtTabs>
        <SongFooter ref='SongFooter' />
      </View>
    );
  }
}
