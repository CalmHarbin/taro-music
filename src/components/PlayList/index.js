// 歌单
import Taro from '@tarojs/taro'
import { View, ScrollView, Text } from '@tarojs/components'
import { getglobalData, update, updateLyric } from '../../redux/global_data'
import './index.scss'

export default class PlayList extends Taro.Component {
    static defaultProps = {
        show: true,
        onClose: Function
    }
    constructor () {
        super(...arguments);
        this.state = {
            songList: [],
            id: null
        }
    }
    componentDidShow() {
        let songList = getglobalData('songList');
        let song = getglobalData('song');
        this.setState({
            songList: songList,
            id: song && song.id
        })
    }

    close() {
        this.props.onClose();
    }

    play(item) {
        console.log(item);
        update(item);
        updateLyric(item.id)
        this.setState({
            id: item.id
        })
    }

    render () {

        return (
            <View className='PlayList' style={this.props.show ? 'display: block' : 'display: none'}>
                <View className='mark' onClick={this.close}></View>
                <View className='PlayListWarp'>
                    <View className='top'>播放列表</View>
                    <ScrollView className='scrollview' scrollY scrollTop='0'>
                        {
                            this.state.songList.map((item, index) => {
                                return (
                                    <View onClick={this.play.bind(this,item)} className={`item ${this.state.id === item.id ? 'active' : ''}`} key={index}>{item.name}<Text className='ellipsis'> - {item.ar.map(i => {return i.name}).join(' / ')}</Text></View>
                                )
                            })
                        }
                    </ScrollView>
                    <View className='bottom' onClick={this.close}>关闭</View>
                </View>
            </View>
        )
    }
}