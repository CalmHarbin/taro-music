// 歌单
import Taro from '@tarojs/taro';
import { View, Image, Text, Canvas } from '@tarojs/components';
import { connect } from '@tarojs/redux';
// import Recommend from '../Recommend/index';
import { setGlobalData } from '../../redux/actions';
import PlayList from '../../components/PlayList/index';
import './index.scss';
import play_icn_src_footer from '../../assets/images/play_icn_src_footer.png';
import pause_icon from '../../assets/images/pause_icon.png';
import play_icon from '../../assets/images/play_icon.png';
import defaultMusicAvatar from '../../assets/images/defaultMusicAvatar.jpg';

@connect(
  ({ global }) => ({
    global
  }),
  dispatch => ({
    setGlobalData() {
      dispatch(setGlobalData());
    }
  })
)
export default class SongFooter extends Taro.Component {
  constructor() {
    super(...arguments);
    this.state = {
      show: false //控制播放列表是否显示
    };
  }
  componentDidShow() {
    this.update();
  }

  close() {
    this.setState({
      show: false
    });
  }

  show() {
    this.setState({
      show: true
    });
  }
  // 绘制进度
  Draw() {
    let audio = this.props.global.audio;
    let progress = audio.currentTime / audio.duration;
    const context = Taro.createCanvasContext('canvas', this.$scope);

    //画圆
    context.setStrokeStyle('#31c27c');
    context.setLineWidth(1);
    context.moveTo(28, 15);
    context.arc(15, 15, 13, Math.PI * 0, Math.PI * 2, false);
    context.stroke();
    //画圆弧
    context.setLineWidth(2);
    context.moveTo(15, 3);
    context.arc(
      15,
      15,
      11,
      Math.PI * 0 - Math.PI * 0.5,
      Math.PI * 2 * progress - Math.PI * 0.5,
      false
    );
    context.stroke();

    if (audio.paused) {
      context.drawImage(play_icon, 9, 9, 13, 13);
    } else {
      context.drawImage(pause_icon, 7, 7, 16, 16);
    }
    context.draw();
  }
  //跳转到详情页
  go() {
    if (!this.props.global.song.id) return;
    Taro.navigateTo({
      url: `/pages/Song/index?id=${this.state.id}`
    });
  }
  //更新当前播放的歌曲
  update() {
    //获取当前播放的歌曲
    let song = this.props.global.song;
    if (!song) return;
    //获取播放器
    let audio = this.props.global.audio;
    this.Draw();
    //监听歌曲播放
    audio.onTimeUpdate(() => {
      //绘制进度
      this.Draw();
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
    this.Draw();
    this.props.dispatch(setGlobalData({ key: 'audio', value: audio }));
  }
  render() {
    let paused = this.props.global.audio && this.props.global.audio.paused;

    return (
      <View
        className='SongFooter'
        style={
          this.props.global.song && this.props.global.song.id ? 'display: block' : 'display: none'
        }
      >
        <View className='box'>
          <Image
            onClick={this.go.bind(this)}
            className={`avatar ${paused ? 'paused' : ''}`}
            src={
              this.props.global.song.al.picUrl
                ? this.props.global.song.al.picUrl + '?imageView&thumbnail=38x0'
                : defaultMusicAvatar
            }
          />
          <View className='content' onClick={this.go.bind(this)}>
            <View className='ellipsis'>{this.props.global.song.al.name}</View>
            <Text className='ellipsis'>{this.props.global.song._singer}</Text>
          </View>
          <View onClick={this.turnState.bind(this)}>
            <Canvas width='30Px' height='30Px' canvasId='canvas' />
          </View>
          <Image className='list' onClick={this.show.bind(this)} src={play_icn_src_footer} />
        </View>
        <View className='Stance' />
        <PlayList show={this.state.show} onClose={this.close.bind(this)} />
      </View>
    );
  }
}
