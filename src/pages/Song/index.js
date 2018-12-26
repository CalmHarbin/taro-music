// 歌曲详情页
import Taro from '@tarojs/taro'
import { View, Image, Text } from '@tarojs/components'
import { AtSlider } from 'taro-ui'
import { getSong, getLyric } from '../../api/index'
import { getglobalData, setglobalData, prevSong, nextSong } from '../../redux/global_data'
import { $GetDateTime } from '../../utils/index'
import './index.scss'
import play_icn_loop from '../../assets/images/play_icn_loop.png'
import play_icn_one from '../../assets/images/play_icn_one.png'
import play_icn_shuffle from '../../assets/images/play_icn_shuffle.png'
import play_btn_prev from '../../assets/images/play_btn_prev.png'
import play_btn_next from '../../assets/images/play_btn_next.png'
import play_icn_src from '../../assets/images/play_icn_src.png'
import play_btn_play from '../../assets/images/play_btn_play.png'
import play_btn_pause from '../../assets/images/play_btn_pause.png'


export default class Song extends Taro.Component {

    constructor () {
        super(...arguments)
        this.state = {
            img: '',//图片
            name: '',//歌曲名称
            singer: '',//歌手
            currentTime: 0,//当前进度,ms
            longTime: 0,//歌曲时长,ms
            audio: null,
            sliderValue: 0,//进度条当前位置,0~100
            LyricList: [],//歌词
        }
    }
    componentWillMount() {
        let songData = getglobalData('song');
        let audio = getglobalData('audio');

        //如果播放的是当前歌曲,则不请求
        if(audio.id == this.$router.params.id) {
            songData.src = audio.src;
            //设置title为当前歌曲名
            Taro.setNavigationBarTitle({
                title: songData.name
            })
            //初始化歌曲的时长
            audio.onCanplay(() => {
                this.setState({
                    currentTime: audio.currentTime * 1000,
                    longTime: audio.duration * 1000
                }) 
            })
            //监听歌曲播放
            audio.onTimeUpdate(() => {
                if(this.state.name === audio._name) {
                    this.setState({
                        sliderValue: 100 * audio.currentTime / audio.duration,
                        currentTime: audio.currentTime * 1000,
                    })
                    return;
                }
                this.setState({
                    sliderValue: 100 * audio.currentTime / audio.duration,
                    currentTime: audio.currentTime * 1000,
                    longTime: audio.duration * 1000,
                    img: audio._picUrl,
                    name: audio._name,
                    singer: audio._singer,
                    LyricList: audio._LyricList,
                })
            })

            this.setState({
                img: songData.al.picUrl,
                name: songData.name,
                singer: songData.ar.map(i => {return i.name}).join(' / '),
                audio: audio,
            })
            return;
        }
        Taro.showLoading({
            title: 'loading'
        })
        Promise.all([
            //获取歌曲详情
            getSong({id: this.$router.params.id}).then(res => {
                //如果播放的不是当前歌曲,则播放当前歌曲;
                // if(audio.id !== this.$router.params.id) {
                    audio.src = res.data[0].url;
                    audio.coverImgUrl = songData.al.picUrl;
                    audio.singer  = songData.ar.map(i => {return i.name}).join(' / ');
                    audio.title   = songData.name;
                    audio.id = this.$router.params.id;
                    audio._picUrl = songData.al.picUrl;
                    audio._name = songData.name;
                    audio._singer = songData.ar.map(i => {return i.name}).join(' / ');
                // }
                songData.src = res.data[0].url;
                //设置title为当前歌曲名
                Taro.setNavigationBarTitle({
                    title: songData.name
                })
                //初始化歌曲的时长
                audio.onCanplay(() => {
                    this.setState({
                        currentTime: audio.currentTime * 1000,
                        longTime: audio.duration * 1000
                    }) 
                })
                //监听歌曲播放
                audio.onTimeUpdate(() => {
                    if(this.state.name === audio._name) {
                        this.setState({
                            sliderValue: 100 * audio.currentTime / audio.duration,
                            currentTime: audio.currentTime * 1000,
                        })
                        return;
                    }
                    this.setState({
                        sliderValue: 100 * audio.currentTime / audio.duration,
                        currentTime: audio.currentTime * 1000,
                        longTime: audio.duration * 1000,
                        img: audio._picUrl,
                        name: audio._name,
                        singer: audio._singer,
                        LyricList: audio._LyricList,
                    })
                })

                this.setState({
                    img: songData.al.picUrl,
                    name: songData.name,
                    singer: songData.ar.map(i => {return i.name}).join(' / '),
                    audio: audio,
                })
            }),
            //获取歌词
            getLyric({id: this.$router.params.id}).then(res => {
                let LyricList = res.lrc.lyric.split('\n').map(item => {
                    let arr = item.split(']');
                    return {
                        time: arr[0].substr(1),
                        Text: arr[1]
                    }
                })
                audio._LyricList = LyricList;
                this.setState({
                    LyricList: LyricList
                })
            })
        ]).then(() => {
            Taro.hideLoading()
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
    /** 
     * 滑动进度条控制播放位置
     * @method sliderChange
     * @param {Number} position.value 当前位置 0~100
     * @return {undefined}
    */
    sliderChange(position) {
        let audio = getglobalData('audio');
        audio.seek(audio.duration * position.value / 100);
    }
    /** 
     * 切换播放模式
     * @method switch
     * @return {undefined}
    */
    switch() {
        let mode = getglobalData('mode');
        if(mode === 1) {
            setglobalData('mode', 2);
            Taro.showToast({
                title: '已切换到循环播放',
                icon: 'none',
                duration: 1000
            })
        } else if (mode === 2) {
            setglobalData('mode', 3);
            Taro.showToast({
                title: '已切换到随机播放',
                icon: 'none',
                duration: 1000
            })
        } else if (mode === 3) {
            setglobalData('mode', 1);
            Taro.showToast({
                title: '已切换到单曲循环',
                icon: 'none',
                duration: 1000
            })
        }
    }
    /** 
     * 上一首
     * @method prev
     * @return {undefined}
    */
    prev() {
        prevSong().then(audio => {
            this.setState({
                img: audio._picUrl,
                name: audio._name,
                singer: audio._singer,
                LyricList: audio._LyricList,
                audio: audio,
                currentTime: 0,
                longTime: audio.duration * 1000,
                audio: audio,
                sliderValue: 0,
            })
        })
    }

    /** 
     * 下一首
     * @method next
     * @return {undefined}
    */
    next() {
        nextSong().then(audio => {
            this.setState({
                img: audio._picUrl,
                name: audio._name,
                singer: audio._singer,
                LyricList: audio._LyricList,
                audio: audio,
                currentTime: 0,
                longTime: audio.duration * 1000,
                audio: audio,
                sliderValue: 0,
            })
        })
    }

    render () {
        let paused = this.state.audio && this.state.audio.paused;
        let mode = getglobalData('mode');
        let modeImg = null;
        if(mode === 1) {
            modeImg = play_icn_one;//单曲循环
        } else if (mode === 2) {
            modeImg = play_icn_loop;//循环播放
        } else if (mode === 3) {
            modeImg = play_icn_shuffle;//随机播放
        }
        return (
            <View className='Song'>
                <View className='bg' style={'background:url('+ this.state.img + '?imageView&thumbnail=480x0' +')'}></View>
                <View className='bgBlank'></View>
                
                <View className='info'>
                    <Text>{this.state.name}</Text>
                    <View>{this.state.singer}</View>
                    </View>
                    <View className='img-box'>
                    <Image className={`rotate ${paused ? 'paused' : ''}`} src={this.state.img + '?imageView&thumbnail=480x0'}></Image>
                    </View>

                    <View className='range-box'>
                        <Text>{ this.state.currentTime > 1000*60*60 ? $GetDateTime(new Date(this.state.currentTime, ), 'h:i:s') : $GetDateTime(new Date(this.state.currentTime, ), 'i:s') }</Text>
                        <AtSlider value={this.state.sliderValue} activeColor='#31c27c' backgroundColor='rgba(255,255,255,0.4)' blockColor='#31c27c' blockSize={14} onChange={this.sliderChange}></AtSlider>
                        <Text>{ this.state.longTime > 1000*60*60 ? $GetDateTime(new Date(this.state.longTime, ), 'h:i:s') : $GetDateTime(new Date(this.state.longTime, ), 'i:s') }</Text>
                    </View>
                    <View className='btn-box'>
                        <Image className='switch' onClick={this.switch} src={modeImg}></Image>
                        <Image src={play_btn_prev} onClick={this.prev} className='prev'></Image>
                        
                        <Image onClick={this.turnState} src={paused ? play_btn_play : play_btn_pause} className='play'></Image>
                        <Image src={play_btn_next} onClick={this.next} className='next'></Image>
                        <Image src={play_icn_src} className='see'></Image>
                    </View> 
            </View>
        )
    }
}