// 歌曲详情页
import Taro from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import { AtSlider } from 'taro-ui';
import { setGlobalData, update, updateLyric, prev, next } from '../../redux/actions';
import { $GetDateTime } from '../../utils/index';
import PlayList from '../../components/PlayList/index';
import './index.scss';
import play_icn_loop from '../../assets/images/play_icn_loop.png';
import play_icn_one from '../../assets/images/play_icn_one.png';
import play_icn_shuffle from '../../assets/images/play_icn_shuffle.png';
import play_btn_prev from '../../assets/images/play_btn_prev.png';
import play_btn_next from '../../assets/images/play_btn_next.png';
import play_icn_src from '../../assets/images/play_icn_src.png';
import play_btn_play from '../../assets/images/play_btn_play.png';
import play_btn_pause from '../../assets/images/play_btn_pause.png';
import defaultMusicAvatar from '../../assets/images/defaultMusicAvatar.jpg';

@connect(
  ({ global }) => ({
    global
  }),
  dispatch => ({
    setGlobalData() {
      dispatch(setGlobalData());
    },
    prev() {
      dispatch(prev());
    },
    next() {
      dispatch(next());
    },
    update() {
      dispatch(update());
    },
    updateLyric() {
      dispatch(updateLyric());
    }
  })
)
export default class Song extends Taro.Component {
  constructor() {
    super(...arguments);
    this.state = {
      sliderValue: 0, //进度条当前位置,0~100
      show: false //控制播放列表是否显示
    };
  }
  componentWillMount() {
    let songData = this.props.global.song;
    let audio = this.props.global.audio;

    if (songData.id !== audio.id) {
      //矫正当前播放的src
      songData.src = audio.src;
      this.props.dispatch(setGlobalData({ key: 'song', value: songData }));
      //更新播放为当前歌曲
      this.props.dispatch(update({ item: songData }));
      //更新歌词
      this.props.dispatch(updateLyric({ id: songData.id }));
      //更新title
      Taro.setNavigationBarTitle({
        title: songData.name
      });
    }
    //更新进度条
    audio.onTimeUpdate(() => {
      this.setState({
        sliderValue: (100 * audio.currentTime) / audio.duration
      });
    });
  }
  /**
   * 控制播放和暂停
   * @method turnState
   * @return {undefined}
   */
  turnState() {
    let audio = this.props.global.audio;
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  }
  /**
   * 滑动进度条控制播放位置
   * @method sliderChange
   * @param {Number} position.value 当前位置 0~100
   * @return {undefined}
   */
  sliderChange(position) {
    let audio = this.props.global.audio;
    audio.seek((audio.duration * position.value) / 100);
  }
  /**
   * 切换播放模式
   * @method switch
   * @return {undefined}
   */
  switch() {
    let mode = this.props.global.mode;
    if (mode === 1) {
      this.props.dispatch(setGlobalData({ key: 'mode', value: 2 }));
      Taro.showToast({
        title: '已切换到循环播放',
        icon: 'none',
        duration: 1000
      });
    } else if (mode === 2) {
      this.props.dispatch(setGlobalData({ key: 'mode', value: 3 }));
      Taro.showToast({
        title: '已切换到随机播放',
        icon: 'none',
        duration: 1000
      });
    } else if (mode === 3) {
      this.props.dispatch(setGlobalData({ key: 'mode', value: 1 }));
      Taro.showToast({
        title: '已切换到单曲循环',
        icon: 'none',
        duration: 1000
      });
    }
  }

  show() {
    this.setState({
      show: true
    });
  }

  close() {
    this.setState({
      show: false
    });
  }

  prev() {
    this.props.dispatch(
      prev({
        callback: item => {
          this.props.dispatch(update({ item }));
          this.props.dispatch(updateLyric({ id: item.id }));
          //更新进度条
        }
      })
    );
  }
  next() {
    this.props.dispatch(
      next({
        callback: item => {
          this.props.dispatch(
            update({
              item,
              callback: () => {
                console.log(111111111111111);
                let audio = this.props.global.audio;

                audio.onTimeUpdate(() => {
                  this.setState({
                    sliderValue: (100 * audio.currentTime) / audio.duration
                  });
                });
              }
            })
          );
          this.props.dispatch(updateLyric({ id: item.id }));
        }
      })
    );
  }

  render() {
    let paused = this.props.global.audio && this.props.global.audio.paused;
    let mode = this.props.global.mode;
    let modeImg = null;
    if (mode === 1) {
      modeImg = play_icn_one; //单曲循环
    } else if (mode === 2) {
      modeImg = play_icn_loop; //循环播放
    } else if (mode === 3) {
      modeImg = play_icn_shuffle; //随机播放
    }
    console.log(this.props.global.audio.currentTime);
    return (
      <View className='Song'>
        <View
          className='bg'
          style={
            'background:url(' +
            (this.props.global.song.al.picUrl
              ? this.props.global.song.al.picUrl + '?imageView&thumbnail=480x0'
              : defaultMusicAvatar) +
            ')'
          }
        />
        <View className='bgBlank' />

        <View className='info'>
          <Text>{this.props.global.song.al.name}</Text>
          <View>{this.props.global.song._singer}</View>
        </View>
        <View className='img-box'>
          <Image
            className={`rotate ${paused ? 'paused' : ''}`}
            src={
              this.props.global.song.al.picUrl
                ? this.props.global.song.al.picUrl + '?imageView&thumbnail=480x0'
                : defaultMusicAvatar
            }
          />
        </View>

        <View className='range-box'>
          <Text>
            {this.props.global.audio.currentTime > 60 * 60
              ? $GetDateTime(new Date(this.props.global.audio.currentTime * 1000), 'h:i:s')
              : $GetDateTime(new Date(this.props.global.audio.currentTime * 1000), 'i:s')}
          </Text>
          <AtSlider
            value={this.state.sliderValue}
            activeColor='#31c27c'
            backgroundColor='rgba(255,255,255,0.4)'
            blockColor='#31c27c'
            blockSize={14}
            onChange={this.sliderChange.bind(this)}
          />
          <Text>
            {this.props.global.audio.duration > 60 * 60
              ? $GetDateTime(new Date(this.props.global.audio.duration * 1000), 'h:i:s')
              : $GetDateTime(new Date(this.props.global.audio.duration * 1000), 'i:s')}
          </Text>
        </View>
        <View className='btn-box'>
          <Image className='switch' onClick={this.switch.bind(this)} src={modeImg} />
          <Image src={play_btn_prev} onClick={this.prev.bind(this)} className='prev' />

          <Image
            onClick={this.turnState.bind(this)}
            src={paused ? play_btn_play : play_btn_pause}
            className='play'
          />
          <Image src={play_btn_next} onClick={this.next.bind(this)} className='next' />
          <Image src={play_icn_src} onClick={this.show.bind(this)} className='see' />
        </View>
        <PlayList show={this.state.show} onClose={this.close.bind(this)} />
      </View>
    );
  }
}
