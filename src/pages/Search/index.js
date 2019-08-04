import Taro from '@tarojs/taro';
import { View, ScrollView, Text } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import { AtSearchBar, AtTag } from 'taro-ui';
import { search, searchHot } from '../../api/index';
import { setGlobalData } from '../../redux/actions';
import './index.scss';

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
export default class Search extends Taro.Component {
  constructor() {
    super(...arguments);
    this.state = {
      search: '',
      rows: 100, //每页数量
      page: 1, //当前页
      total: 0, //总数
      SongList: [],
      hotList: []
    };
  }

  componentWillMount() {
    searchHot().then(res => {
      let arr = [];
      for (let item of res.result.hots) {
        arr.push(item.first);
      }
      this.setState({
        hotList: arr
      });
    });
  }

  onChange(value) {
    this.setState({
      search: value
    });
  }

  onConfirm() {
    if (!this.state.search) {
      this.setState({
        SongList: []
      });
      return;
    }
    Taro.showLoading({
      title: 'loading'
    });
    search({ keywords: this.state.search, limit: this.state.rows, offset: 1 }).then(res => {
      let arr = [];
      if (!res.result.songs) {
        Taro.hideLoading();
        Taro.showToast({
          title: '没有找到歌曲',
          icon: 'none',
          duration: 1000
        });
        return;
      }
      for (let item of res.result.songs) {
        arr.push({
          al: { picUrl: item.album.artist.img1v1Url, name: item.album.name },
          ar: item.artists,
          name: item.name,
          id: item.id
        });
      }
      this.setState({
        total: res.result.songCount,
        page: 2,
        SongList: arr
      });
      Taro.hideLoading();
    });
  }

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
    this.onConfirm();
  }

  scroll(e) {
    console.log(e);
    if (Math.ceil(this.state.total / this.state.rows) < this.state.page) {
      Taro.showToast({
        title: '没有更多了',
        icon: 'none',
        duration: 1000
      });
      return;
    }
    Taro.showLoading({
      title: 'loading'
    });
    search({ keywords: this.state.search, limit: this.state.rows, offset: this.state.page }).then(
      res => {
        if (!res.result.songs) {
          Taro.hideLoading();
          Taro.showToast({
            title: '没有找到歌曲',
            icon: 'none',
            duration: 1000
          });
          return;
        }
        let arr = [...this.state.SongList];
        for (let item of res.result.songs) {
          arr.push({
            al: { picUrl: item.album.artist.img1v1Url, name: item.album.name },
            ar: item.artists,
            name: item.name,
            id: item.id
          });
        }
        this.setState({
          total: res.result.songCount,
          page: this.state.page + 1,
          SongList: arr
        });
        Taro.hideLoading();
      }
    );
  }

  hotSearch(text) {
    Taro.showLoading({
      title: 'loading'
    });
    search({ keywords: text, limit: this.state.rows, offset: 1 }).then(res => {
      if (!res.result.songs) {
        Taro.hideLoading();
        Taro.showToast({
          title: '没有找到歌曲',
          icon: 'none',
          duration: 1000
        });
        return;
      }
      let arr = [...this.state.SongList];
      for (let item of res.result.songs) {
        arr.push({
          al: { picUrl: item.album.artist.img1v1Url, name: item.album.name },
          ar: item.artists,
          name: item.name,
          id: item.id
        });
      }
      this.setState({
        total: res.result.songCount,
        page: 2,
        SongList: arr,
        search: text
      });
      Taro.hideLoading();
    });
  }
  render() {
    let hot = null;
    if (this.state.SongList.length === 0) {
      hot = (
        <View>
          <View className='hot'>热门搜索</View>
          <View>
            {this.state.hotList.map((item, index) => {
              return (
                <AtTag circle key={index} onClick={this.hotSearch.bind(this, item)}>
                  {item}
                </AtTag>
              );
            })}
          </View>
        </View>
      );
    }
    return (
      <View className='Search'>
        <AtSearchBar
          value={this.state.search}
          onChange={this.onChange.bind(this)}
          onConfirm={this.onConfirm}
          onActionClick={this.onConfirm}
        />
        <ScrollView
          className='scrollview'
          scrollY
          scrollWithAnimation
          scrollTop='0'
          lowerThreshold='20'
          onScrolltolower={this.scroll}
        >
          {hot}

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
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  }
}
