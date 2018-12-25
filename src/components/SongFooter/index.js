// 歌单
import Taro from '@tarojs/taro'
import { View, Image, Text, Canvas } from '@tarojs/components'
import { getglobalData } from '../../redux/global_data'
import './index.scss'
import play_icn_src_footer from '../../assets/images/play_icn_src_footer.png'
import pause_icon from '../../assets/images/pause_icon.png'
import play_icon from '../../assets/images/play_icon.png'

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
        this.Draw();
        //监听歌曲播放
        audio.onTimeUpdate(() => {
            //绘制进度
            this.Draw();
        })
        this.setState({
            name: song.name,
            picUrl: song.al.picUrl,
            singer: song.ar.map(i => {return i.name}).join(' / '),
            id: song.id
        })
    }

    Draw() {
        let audio = getglobalData('audio');
        let progress = audio.currentTime / audio.duration;
        const context = Taro.createCanvasContext('canvas', this.$scope);

        //画圆
        context.setStrokeStyle('#31c27c');
        context.setLineWidth(1);
        context.moveTo(28, 15)
        context.arc(15, 15, 13, Math.PI * 0, Math.PI * 2, false);
        context.stroke();
        //画圆弧
        context.setLineWidth(2);
        context.moveTo(15, 3)
        context.arc(15, 15, 11, Math.PI * 0 - Math.PI * 0.5, Math.PI * 2 * progress - Math.PI * 0.5, false);
        context.stroke();
        // context.translate(15,15);
        // context.rotate(90 * Math.PI / 180);
        if(audio.paused) {
            context.drawImage(play_icon,9,9,13,13)
        } else {
            context.drawImage(pause_icon,7,7,16,16)
        }
        context.draw();
    }

    go() {
        if(!this.state.id) return;
        Taro.navigateTo({
            url: `/pages/Song/index?id=${this.state.id}`
        })
    }

    /** 
     * 控制播放和暂停
     * @method turnState
     * @return {undefined}
    */
    turnState() {
        let audio = getglobalData('audio');
        if(audio.paused) {
            audio.play();
        } else {
            audio.pause();
        }
        this.Draw();
    }
    render () {
        let paused = getglobalData('audio').paused;
        return (
            <View className='SongFooter' style={this.state.id ? 'display: block' : 'display: none'} >
                <View className='box'>
                    <Image onClick={this.go} className={`avatar ${paused ? 'paused' : ''}`} src={this.state.picUrl} />
                    <View className='content' onClick={this.go}>
                        <View className='ellipsis'>{this.state.name}</View>
                        <Text className='ellipsis'>{this.state.singer}</Text>
                    </View>
                    <View onClick={this.turnState}><Canvas width='30Px' height='30Px' canvasId='canvas'></Canvas></View>
                    <Image className='list' src={play_icn_src_footer} />
                </View>
                <View className='Stance'></View>
            </View>
        )
    }
}