import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import { AtTabs, AtTabsPane } from 'taro-ui';
import Recommend from '../Recommend/index';
import Search from '../Search/index';
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
  }
  handleClick(value) {
    this.setState({
      current: value
    });
  }

  render() {
    const tabList = [{ title: '推荐' }, { title: '搜索' }, { title: '我的' }];
    return (
      <View>
        <AtTabs
          swipeable={false}
          current={this.state.current}
          tabList={tabList}
          onClick={this.handleClick.bind(this)}
        >
          <AtTabsPane current={this.state.current} index={0}>
            <Recommend />
          </AtTabsPane>
          <AtTabsPane current={this.state.current} index={1}>
            <Search />
          </AtTabsPane>
          <AtTabsPane current={this.state.current} index={2}>
            <View style='padding: 100px 50px;background-color: #FAFBFC;text-align: center;'>
              标签页三的内容
            </View>
          </AtTabsPane>
        </AtTabs>
        <SongFooter />
      </View>
    );
  }
}
