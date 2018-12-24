import Taro from '@tarojs/taro'
import { View, Image, Text } from '@tarojs/components'
import { getSongList, getSong } from '../../api/index'
import { setglobalData, getglobalData } from '../../redux/global_data'
import SongFooter from '../../components/SongFooter/index'
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
        Taro.showLoading({
            title: 'loading'
        })
        getSongList({id: this.$router.params.id}).then(res => {
            this.setState({
                subscribedCount: res.playlist.subscribedCount,
                SongList: res.playlist.tracks,
            },() => {
                Taro.hideLoading()
            })
        })
    }
    //页面显示时触发
    componentDidShow() {
        let audio = getglobalData('audio');
        this.setState({
            audio: audio
        }) 
    }
    /** 
     * 跳转到歌曲详情页
     * @method go
     * @param {Object} item 当前歌曲的详细信息
     * @return {undefined}
    */
    go(item) {
        if(!getglobalData('song') || getglobalData('song').id !== item.id) {
            setglobalData('song',item);
        }
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
        let song = getglobalData('song');
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
            song.src = res.data[0].url;
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
    /** 
     * 播放全部
     * @method playAll
     * @return {undefined}
    */
    playAll() {
        if(!this.state.SongList.length) return;
        let audio = getglobalData('audio');
        
        //更新播放列表
        setglobalData('songList', this.state.SongList);
        //播放第一首歌
        getSong({id: this.state.SongList[0].id}).then(res => {
            //如果当前播放的是第一首歌
            if(audio.id === this.state.SongList[0].id) {
                if(audio.paused) {
                    //如果是暂停状态则播放
                    audio.play();
                }
                return;
            }

            //播放第一首歌
            setglobalData('song', this.state.SongList[0]);
            let song = getglobalData('song');
            song.src = res.data[0].url;

            audio.src = res.data[0].url;
            audio.coverImgUrl = this.state.SongList[0].al.picUrl;
            audio.singer  = this.state.SongList[0].ar.map(i => {return i.name}).join(' / ');
            audio.title   = this.state.SongList[0].name;
            audio.id = this.state.SongList[0].id;

            audio.onCanplay(() => {
                this.setState({
                    audio: audio
                })
            })
        })
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
        })
    }

    render () {
        let paused = this.state.audio && this.state.audio.paused;
        let audioId =this.state.audio && this.state.audio.id;
        return (
            <View className='SongList'>
                <View className='header'>
                    <Image src={play_cell} onClick={this.playAll} />
                    <View className='left' onClick={this.playAll}>播放全部<Text>(共{this.state.SongList.length}首)</Text></View>
                    <View className='right' onClick={this.Collection}>+ 收藏({this.state.subscribedCount})</View>
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
                <SongFooter />
            </View>
        )
    }
}