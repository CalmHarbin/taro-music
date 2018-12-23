import Taro from '@tarojs/taro'
import { View, Image, Text } from '@tarojs/components'
import { getSongList, getSong } from '../../api/index'
import { setglobalData, getglobalData } from '../../redux/global_data'
import './index.scss'
import play_cell from '../../assets/images/play-cell.png'
import play_list from '../../assets/images/play-list.png'
import pause_item from '../../assets/images/pause-item.png'

export default class SongList extends Taro.Component {
    config = {
        navigationBarTitleText: '歌单',
    }
    constructor () {
        super(...arguments)
        this.state = {
            subscribedCount: 0,//收藏数量
            SongList: [],
            audio: null,
        }
    }
    componentWillMount() {
        getSongList({id: this.$router.params.id}).then(res => {
            this.setState({
                subscribedCount: res.playlist.subscribedCount,
                SongList: res.playlist.tracks,
            })
        })
    }
    //页面显示时触发
    componentDidShow() {
        let audio = getglobalData('audio');
        console.log(audio.paused)
        if(audio.paused) {
            this.setState({
                isPlay: true,
                audioId: audio.id,
                audio: audio
            })
        } else {
            this.setState({
                isPlay: false,
                audioId: audio.id,
                audio: audio
            })
        }
    }
    /** 
     * 跳转到歌曲详情页
     * @method go
     * @param {Object} item 当前歌曲的详细信息
     * @return {undefined}
    */
    go(item) {
        setglobalData('song',item);
        Taro.navigateTo({
            url: `/pages/Song/index?id=${item.id}`
        })
    }
    /** 
     * 播放当前歌曲
     * @method play
     * @param {Object} item 当前歌曲的详细信息
     * @return {undefined}
    */
    play(item,e) {
        setglobalData('song',item);
        let audio = getglobalData('audio');
        getSong({id: item.id}).then(res => {
            if(audio.id === item.id) {
                if(audio.paused) {
                    audio.play();
                } else {
                    audio.pause();
                }
                this.setState({
                    audio: audio
                })
                return;
            }
            audio.src = res.data[0].url;
            audio.coverImgUrl = item.al.picUrl;
            audio.singer  = item.ar.map(i => {return i.name}).join(' / ');
            audio.title   = item.name;
            audio.id = item.id;
            audio.onCanplay(() => {
                this.setState({
                    audio: audio
                })
            })
            
        })
        e.stopPropagation()
    }

    render () {
        let paused = this.state.audio && this.state.audio.paused;
        let audioId =this.state.audio && this.state.audio.id;
        return (
            <View className='SongList'>
                <View className='header'>
                    <Image src={play_cell} />
                    <View className='left'>播放全部<Text>(共{this.state.SongList.length}首)</Text></View>
                    <View className='right'>+ 收藏({this.state.subscribedCount})</View>
                </View>
                {   
                    this.state.SongList.map((item, index) => {
                        return (
                            <View className='item' key='index' onClick={this.go.bind(this, item)}>
                                <View className='left'>{index + 1}</View>
                                <View className='box'>
                                    <View className='middle'>
                                        <View className='ellipsis'>{item.name}</View>
                                        <Text className='ellipsis'>{
                                            item.ar.map(i => {
                                                return i.name
                                            }).join(' / ')
                                        } - {item.al.name}</Text>
                                    </View>
                                    <View className='right' onClick={this.play.bind(this, item)}>
                                    <Image src={(!paused && item.id == audioId) ? pause_item : play_list} />
                                    </View>
                                </View>
                            </View>
                        )
                    })
                }
            </View>
        )
    }
}