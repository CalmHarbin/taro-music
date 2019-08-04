// 歌单
import Taro from '@tarojs/taro';
import { View, ScrollView, Text } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import { update, updateLyric } from '../../redux/actions';
import './index.scss';

@connect(
  ({ global }) => ({
    global
  }),
  dispatch => ({
    update() {
      dispatch(update());
    },
    updateLyric() {
      dispatch(updateLyric());
    }
  })
)
export default class PlayList extends Taro.Component {
  static defaultProps = {
    show: true,
    onClose: Function
  };
  constructor() {
    super(...arguments);
    this.state = {};
  }
  componentDidShow() {}

  close() {
    this.props.onClose();
  }
  //播放
  play(item) {
    //更新当前播放歌曲
    this.props.dispatch(update({ item }));
    //更新歌词
    this.props.dispatch(updateLyric({ id: item.id }));
  }

  render() {
    return (
      <View className='PlayList' style={this.props.show ? 'display: block' : 'display: none'}>
        <View className='mark' onClick={this.close.bind(this)} />
        <View className='PlayListWarp'>
          <View className='top'>播放列表</View>
          <ScrollView className='scrollview' scrollY scrollTop='0'>
            {this.props.global.songList.map((item, index) => {
              return (
                <View
                  onClick={this.play.bind(this, item)}
                  className={`item ${this.props.global.song.id === item.id ? 'active' : ''}`}
                  key={index}
                >
                  {item.name}
                  <Text className='ellipsis'>
                    {' '}
                    -{' '}
                    {item.ar
                      .map(i => {
                        return i.name;
                      })
                      .join(' / ')}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
          <View className='bottom' onClick={this.close.bind(this)}>
            关闭
          </View>
        </View>
      </View>
    );
  }
}
