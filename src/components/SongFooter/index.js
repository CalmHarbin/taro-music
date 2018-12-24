// 歌单
import Taro from '@tarojs/taro'
import { View, Image, Text, Canvas } from '@tarojs/components'
import { getglobalData } from '../../redux/global_data'
import './index.scss'
import play_icn_src_footer from '../../assets/images/play_icn_src_footer.png'

export default class SongFooter extends Taro.Component {

    constructor () {
        super(...arguments)
        this.state = {
            name: null,
            picUrl: null,
            singer: null,
            id: null,
        }
    }
    componentDidShow() {
        let song = getglobalData('song');
        if(!song) return;
        let audio = getglobalData('audio');
        //监听歌曲播放
        audio.onTimeUpdate(() => {
            //绘制进度
            this.Draw(audio.currentTime / audio.duration);
        })
        this.setState({
            name: song.name,
            picUrl: song.al.picUrl,
            singer: song.ar.map(i => {return i.name}).join(' / '),
            id: song.id
        })
    }

    Draw(progress) {
        
        const context = Taro.createCanvasContext('canvas');
        // context.fillRect(0, 0, 30, 30);
        //画圆
        context.setStrokeStyle('#31c27c');
        context.setLineWidth(2);
        context.moveTo(15, 2)
        context.arc(15, 15, 13, Math.PI * 0, Math.PI * 2, false);
        context.stroke();
        //画圆弧
        context.moveTo(15, 4)
        context.arc(15, 15, 11, Math.PI * 0, Math.PI * 1 * progress, false);
        context.stroke();
        context.draw();
    }

    go() {
        if(!this.state.id) return;
        Taro.navigateTo({
            url: `/pages/Song/index?id=${this.state.id}`
        })
    }
    render () {
        let paused = getglobalData('audio').paused;
        return (
            <View className='SongFooter' style={this.state.id ? 'display: block' : 'display: block'} onClick={ this.go } >
                <View className='box'>
                    <Image className={`avatar ${paused ? 'paused' : ''}`} src={this.state.picUrl} />
                    <View className='content'>
                        <View className='ellipsis'>{this.state.name}</View>
                        <Text className='ellipsis'>{this.state.singer}</Text>
                    </View>
                    <View><Canvas canvasId='canvas'></Canvas></View>
                    <Image className='list' src={play_icn_src_footer} />
                </View>
                <View className='Stance'></View>
            </View>
        )
    }
}