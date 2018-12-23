// 歌单
import Taro from '@tarojs/taro'
import { View, Image, Text } from '@tarojs/components'
import headset from '../../assets/images/headset.png'
import './index.scss'

export default class SongSheet extends Taro.Component {
    static defaultProps = {
        Oid: Number,
        name: String,
        picUrl: String,
        playCount: Number
    }
    constructor () {
        super(...arguments)
        this.state = {
            
        }
    }
    componentWillMount() {
        
    }

    go() {
        Taro.navigateTo({
            url: `/pages/SongList/index?id=${this.props.Oid}`
        })
    }
    render () {
        return (
            <View className='SongSheet item' onClick={ this.go } >
                <Image src={this.props.picUrl} />
                <Text className='name'>{this.props.name}</Text>
                <View className='playCount'><Image style='width: 10Px;height:10Px;margin: 3Px 3Px 0 0;display:inline-block;' src={headset} />{ Math.floor(this.props.playCount) > 100000 ? Math.floor(this.props.playCount/10000) + '万' : Math.floor(this.props.playCount) }</View>
                <View className='shadow'></View>
            </View>
        )
    }
}