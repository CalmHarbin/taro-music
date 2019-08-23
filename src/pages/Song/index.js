// 歌曲详情页
import Taro from '@tarojs/taro'
import { View, Image, Text } from '@tarojs/components'
import { connect } from '@tarojs/redux'
import { AtSlider } from 'taro-ui'
import { setGlobalData, update, updateLyric, prev, next } from '../../redux/actions'
import { $GetDateTime } from '../../utils/index'
import PlayList from '../../components/PlayList/index'
import './index.scss'
import play_icn_loop from '../../assets/images/play_icn_loop.png'
import play_icn_one from '../../assets/images/play_icn_one.png'
import play_icn_shuffle from '../../assets/images/play_icn_shuffle.png'
import play_btn_prev from '../../assets/images/play_btn_prev.png'
import play_btn_next from '../../assets/images/play_btn_next.png'
import play_icn_src from '../../assets/images/play_icn_src.png'
import play_btn_play from '../../assets/images/play_btn_play.png'
import play_btn_pause from '../../assets/images/play_btn_pause.png'
import defaultMusicAvatar from '../../assets/images/defaultMusicAvatar.jpg'

let timer = null
let isGtTime = null //是否超过1s, 超过一秒未播放则显示loading
let change = false //是不是切换歌曲了

@connect(
  ({ global }) => ({
    global
  }),
  dispatch => ({
    setGlobalData() {
      dispatch(setGlobalData())
    },
    prev() {
      dispatch(prev())
    },
    next() {
      dispatch(next())
    },
    update() {
      dispatch(update())
    },
    updateLyric() {
      dispatch(updateLyric())
    }
  })
)
export default class Song extends Taro.Component {
  constructor() {
    super(...arguments)
    this.state = {
      sliderValue: 0, //进度条当前位置,0~100
      show: false, //控制播放列表是否显示
      time: 0
    }
    this.setTime = this.setTime.bind(this)
  }

  componentWillMount() {
    let songData = this.props.global.song
    let audio = this.props.global.audio

    if (songData.id !== audio.id) {
      //矫正当前播放的src
      songData.src = audio.src
      this.props.dispatch(setGlobalData({ key: 'song', value: songData }))
      //更新播放为当前歌曲
      this.props.dispatch(update({ item: songData }))
      //更新歌词
      this.props.dispatch(updateLyric({ id: songData.id }))
      //更新title
      Taro.setNavigationBarTitle({
        title: songData.name
      })
      change = true
      this.setState({
        time: 0,
        sliderValue: 0
      })
    }
    //如果是播放状态则更新时间
    if (!audio.paused) {
      this.setTime()
    }
    //矫正时间和进度
    this.setState({
      time: audio.currentTime,
      sliderValue: (100 * (audio.currentTime + 1)) / this.props.global.audio.duration
    })

    //监听播放时间,使用函数节流,防止短时间内多次渲染
    // let TimeUpdate = this.debounce(() => {
    //   if (isGtTime) {
    //     clearInterval(isGtTime);
    // isGtTime = null;
    //   } else {
    //     Taro.hideLoading();
    //   }
    //   this.setState({
    //     sliderValue: (100 * audio.currentTime) / audio.duration
    //   });
    // }, 700);
    // // 更新进度条;
    // audio.onTimeUpdate(TimeUpdate);
  }

  componentDidUpdate() {
    // console.log(111);
    let audio = this.props.global.audio
    audio.onCanplay(() => {
      console.log('歌曲准备完成,可以播放了')
      if (!audio.paused) this.setTime()
      else if (change) this.setTime()
    })
    audio.onWaiting(() => {
      isGtTime = setTimeout(() => {
        Taro.showLoading({
          title: 'loading'
        })
      }, 2000)
    })
  }

  //页面显示时触发
  componentDidShow() {
    //监听播放和暂停事件
    this.props.global.audio.onPlay(() => {
      this.forceUpdate()
      //播放时间继续
      this.setTime()
    })
    this.props.global.audio.onPause(() => {
      this.forceUpdate()
      //停止播放时间
      clearInterval(timer)
    })
  }

  setTime() {
      console.log('执行')
      console.log(this.props.global.audio.currentTime, this.props.global.audio.duration)
    clearInterval(timer)
    let time = Math.round(this.props.global.audio.currentTime) | 0
    timer = setInterval(() => {
      //此时表示歌曲已经播放完毕
      if (this.props.global.audio.duration === 0) {
        clearInterval(timer)
        this.setState({
          time: 0,
          sliderValue: 0
        })
      }
      //   console.log(this.props.global.audio.duration);
      //   console.log((100 * (this.state.time + 1)) / this.props.global.audio.duration);
      if (isGtTime) {
        clearInterval(isGtTime)
        isGtTime = null
      } else {
        Taro.hideLoading()
      }
      this.setState({
        time: this.state.time + 1,
        sliderValue: (100 * (this.state.time + 1)) / this.props.global.audio.duration
      })
    }, 1000)
    this.setState({
      time: time,
      sliderValue: (100 * (this.state.time + 1)) / this.props.global.audio.duration
    })
  }
  /*
   * 函数防抖
   * @method debounce
   * @param {funciton} fn   需要执行的函数
   * @param {Number} wait   需要等待的时间,毫秒
   * @returns {undefined}
   */
  debounce(fn, wait) {
    var timeout
    return function() {
      var context = this
      var args = arguments
      if (!timeout) {
        timeout = setTimeout(function() {
          timeout = null
          fn.apply(context, args)
        }, wait)
      }
    }
  }
  /**
   * 控制播放和暂停
   * @method turnState
   * @return {undefined}
   */
  turnState() {
    let audio = this.props.global.audio
    if (audio.paused) {
      audio.play()
      this.setTime()
    } else {
      audio.pause()
      clearInterval(timer)
    }
  }
  /**
   * 滑动进度条控制播放位置
   * @method sliderChange
   * @param {Number} position.value 当前位置 0~100
   * @return {undefined}
   */
  sliderChange(position) {
    let audio = this.props.global.audio
    let currentTime = (audio.duration * position.value) / 100

    audio.seek(currentTime)
    clearInterval(timer)
    this.setState({
      time: currentTime,
      sliderValue: (100 * (currentTime + 1)) / audio.duration
    })
    // this.setTime()
  }
  /**
   * 切换播放模式
   * @method switch
   * @return {undefined}
   */
  switch() {
    let mode = this.props.global.mode
    if (mode === 1) {
      this.props.dispatch(setGlobalData({ key: 'mode', value: 2 }))
      Taro.showToast({
        title: '已切换到循环播放',
        icon: 'none',
        duration: 1000
      })
    } else if (mode === 2) {
      this.props.dispatch(setGlobalData({ key: 'mode', value: 3 }))
      Taro.showToast({
        title: '已切换到随机播放',
        icon: 'none',
        duration: 1000
      })
    } else if (mode === 3) {
      this.props.dispatch(setGlobalData({ key: 'mode', value: 1 }))
      Taro.showToast({
        title: '已切换到单曲循环',
        icon: 'none',
        duration: 1000
      })
    }
  }

  show() {
    this.setState({
      show: true
    })
  }

  close() {
    this.setState({
      show: false
    })
  }

  prev() {
    this.props.dispatch(
      prev({
        callback: item => {
          this.props.dispatch(update({ item }))
          this.props.dispatch(updateLyric({ id: item.id }))
        }
      })
    )
  }
  next() {
    this.props.dispatch(
      next({
        callback: item => {
          this.props.dispatch(update({ item }))
          this.props.dispatch(updateLyric({ id: item.id }))
        }
      })
    )
  }

  render() {
    let paused = this.props.global.audio && this.props.global.audio.paused
    let mode = this.props.global.mode
    let modeImg = null
    if (mode === 1) {
      modeImg = play_icn_one //单曲循环
    } else if (mode === 2) {
      modeImg = play_icn_loop //循环播放
    } else if (mode === 3) {
      modeImg = play_icn_shuffle //随机播放
    }
    // let currentTime = this.props.global.audio.currentTime | 0;
    let currentTime = this.state.time
    // console.log(this.props.global.audio.currentTime);
    // console.log(this.props.global.audio && this.props.global.audio.LyricList)
    let style = 'bottom: 0px', LyricIndex
    this.props.global.audio && this.props.global.audio.LyricList && this.props.global.audio.LyricList.map((item, index) => {
        if (currentTime > item.time) {
            style = `bottom:${(index - 1) * 28}px`
            LyricIndex = index
        }
    })

    
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
          <Text>{this.props.global.song.name}</Text>
          <View>{this.props.global.audio._singer}</View>
        </View>
        <View className='img-box'>
          <Image
            className={`rotate ${paused ? 'paused' : ''}`}
            mode='widthFix'
            src={
              this.props.global.song.al.picUrl
                ? this.props.global.song.al.picUrl + '?imageView&thumbnail=480x0'
                : defaultMusicAvatar
            }
          />
        </View>
        
        <View className='footer'>
            <View className='Lyric'>
            <View className='content' style={style}>
                {this.props.global.audio && this.props.global.audio.LyricList.map((item, index) => {
                return <View className={index === LyricIndex ? 'active Lyric_item' : 'Lyric_item'} key={index}>{item.Text}</View>
                })}
            </View>
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
                {this.props.global.audio
                ? this.props.global.audio.duration > 60 * 60
                    ? $GetDateTime(new Date(this.props.global.audio.duration * 1000), 'h:i:s')
                    : $GetDateTime(new Date(this.props.global.audio.duration * 1000), 'i:s')
                : ''}
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
        </View>
        <PlayList show={this.state.show} onClose={this.close.bind(this)} />
      </View>
    )
  }
}
