// 歌曲详情页
import Taro from '@tarojs/taro'
import { View, Image, Text, Navigator } from '@tarojs/components'
import { AtSlider } from 'taro-ui'
import { getSong, getLyric } from '../../api/index'
import { getglobalData } from '../../redux/global_data'
import { $GetDateTime } from '../../utils/index'
import './index.scss'
import play_icn_loop from '../../assets/images/play_icn_loop.png'
import play_btn_prev from '../../assets/images/play_btn_prev.png'
import play_btn_next from '../../assets/images/play_btn_next.png'
import play_icn_src from '../../assets/images/play_icn_src.png'
import play_btn_play from '../../assets/images/play_btn_play.png'
import play_btn_pause from '../../assets/images/play_btn_pause.png'


export default class Song extends Taro.Component {
    // config = {
    //     navigationBarTitleText: this.state.name,
    // }
    constructor () {
        super(...arguments)
        this.state = {
            img: '',//图片
            name: null,//歌曲名称
            singer: null,//歌手
            currentTime: 0,//当前进度
            longTime: 0,//歌曲时长
            audio: null,
        }
    }
    componentWillMount() {
        let songData = getglobalData('song');
        let audio = getglobalData('audio');
        
        getSong({id: this.$router.params.id}).then(res => {
            //如果播放的不是当前歌曲,则播放当前歌曲;
            if(audio.id !== this.$router.params.id) {
                audio.src = res.data[0].url;
                audio.coverImgUrl = songData.al.picUrl;
                audio.singer  = songData.ar.map(i => {return i.name}).join(' / ');
                audio.title   = songData.name;
                audio.id = this.$router.params.id;
            }
            this.setState({
                img: songData.al.picUrl,
                name: songData.name,
                singer: songData.ar.map(i => {return i.name}).join(' / '),
                currentTime: 0,
                longTime: songData.dt,
                audio: audio,
            })
        })
        getLyric({id: this.$router.params.id}).then(res => {
            let LyricList = res.lrc.lyric.split('\n').map(item => {
                let arr = item.split(']');
                return {
                    time: arr[0].substr(1),
                    Text: arr[1]
                }
            })
            console.log(LyricList)
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
        this.setState({
            audio: audio
        })
    }

    render () {
        let paused = this.state.audio && this.state.audio.paused;
        return (
            <View className='Song'>
                <View className='bg' style={'background:url('+ this.state.img +')'}></View>
                <View className='alert'>已切换到单曲循环</View>
                
                <View className='info'>
                    <Text>{this.state.name}</Text>
                    <View>{this.state.singer}</View>
                    </View>
                    <View className='img-box'>
                    <Image className={`rotate ${paused ? 'paused' : ''}`} src={this.state.img}></Image>
                    </View>

                    <View className='range-box'>
                        <Text>{ this.state.currentTime > 1000*60*60 ? $GetDateTime(new Date(this.state.currentTime, ), 'h:i:s') : $GetDateTime(new Date(this.state.currentTime, ), 'i:s') }</Text>
                        {/* <View className='range'>
                            <View className='after'></View>
                            <View className='circular'></View>
                        </View> */}
                        <AtSlider step={1} value={50} activeColor='#31c27c' backgroundColor='rgba(255,255,255,0.4)' blockColor='#31c27c' blockSize={14}></AtSlider>
                        <Text>{ this.state.longTime > 1000*60*60 ? $GetDateTime(new Date(this.state.longTime, ), 'h:i:s') : $GetDateTime(new Date(this.state.longTime, ), 'i:s') }</Text>
                    </View>
                    <View className='btn-box'>
                    <Image className='switch' src={play_icn_loop}></Image>
                    <Navigator url='' hover-className='none'><Image src={play_btn_prev} className='prev'></Image></Navigator>
                    
                    <Image onClick={this.turnState} src={paused ? play_btn_play : play_btn_pause} className='play'></Image>
                    <Navigator url='' hover-className='none'><Image src={play_btn_next} className='next'></Image></Navigator>
                    <Image src={play_icn_src} className='see'></Image>
                    </View> 
            </View>
        )
    }
}