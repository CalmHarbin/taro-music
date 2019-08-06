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
      show: false, //控制播放列表是否显示
      isGtTime: null, //是否超过1s, 超过一秒未播放则显示loading
      timer: null
    };
    this.setTime = this.setTime.bind(this);
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
    this.setTime();
    //监听播放时间,使用函数节流,防止短时间内多次渲染
    let TimeUpdate = this.debounce(() => {
      if (this.state.isGtTime) {
        clearInterval(this.state.isGtTime);
        this.setState({
          isGtTime: null
        });
      } else {
        Taro.hideLoading();
      }
      this.setState({
        sliderValue: (100 * audio.currentTime) / audio.duration
      });
    }, 700);
    // 更新进度条;
    audio.onTimeUpdate(TimeUpdate);
  }

  componentDidUpdate() {
    // console.log(111);
    let audio = this.props.global.audio;
    audio.onCanplay(() => {
      console.log('歌曲准备完成,可以播放了');
      this.setTime();
    });
    audio.onWaiting(() => {
      let isGtTime = setTimeout(() => {
        Taro.showLoading({
          title: 'loading'
        });
        this.setState({
          isGtTime: null
        });
      }, 1000);
      this.setState({
        isGtTime: isGtTime
      });
    });
  }

  setTime() {
    // clearInterval(this.state.timer);
    // let time = Math.round(this.props.global.audio.currentTime) | 0;
    // let timer = setInterval(() => {
    //   console.log(this.props.global.audio.duration);
    //   console.log((100 * (this.state.time + 1)) / this.props.global.audio.duration);
    //   this.setState({
    //     time: this.state.time + 1,
    //     sliderValue: (100 * (this.state.time + 1)) / this.props.global.audio.duration
    //   });
    // }, 1000);
    // this.setState({
    //   time: time,
    //   timer: timer,
    //   sliderValue: (100 * (this.state.time + 1)) / this.props.global.audio.duration
    // });
  }
  /*
   * 函数防抖
   * @method debounce
   * @param {funciton} fn   需要执行的函数
   * @param {Number} wait   需要等待的时间,毫秒
   * @returns {undefined}
   */
  debounce(fn, wait) {
    var timeout;
    return function() {
      var context = this;
      var args = arguments;
      if (!timeout) {
        timeout = setTimeout(function() {
          timeout = null;
          fn.apply(context, args);
        }, wait);
      }
    };
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
    this.setTime();
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
    this.setTime();
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
          this.setTime();
        }
      })
    );
  }
  next() {
    this.props.dispatch(
      next({
        callback: item => {
          this.props.dispatch(update({ item }));
          this.props.dispatch(updateLyric({ id: item.id }));
          this.setTime();
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
    let currentTime = this.props.global.audio.currentTime | 0;
    // let currentTime = this.state.time;
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
            {currentTime > 60 * 60
              ? $GetDateTime(new Date(currentTime * 1000), 'h:i:s')
              : $GetDateTime(new Date(currentTime * 1000), 'i:s')}
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
