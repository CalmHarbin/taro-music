import Taro from '@tarojs/taro'
import { View } from '@tarojs/components'
import { AtIcon  } from 'taro-ui'
import { getPersonalized, toplist } from '../../api/index'
import SongSheet from '../../components/SongSheet/index'
import './index.scss'

export default class Recommend extends Taro.Component {
    constructor () {
        super(...arguments)
        this.state = {
            list: [],
            title: '',
        }
    }
    componentWillMount() {
        Taro.showLoading({
            title: 'loading'
        })
        if(this.$router.params.name === '推荐歌单') {
            this.getPersonalized();
        } else if (this.$router.params.name === '排行榜') {
            this.toplist();
        }
    }
    getPersonalized() {
        getPersonalized().then(res => {
            try{
                let arr = [];
                for(let item of res.result) {
                    arr.push({
                        id: item.id,
                        name: item.name,
                        picUrl: item.picUrl,
                        playCount: item.playCount
                    })
                }
                this.setState({
                    list: arr,
                    title: '推荐音乐'
                })
            } catch (err) {}
            Taro.hideLoading()
        })
    }
    
    toplist() {
        toplist().then(res => {
            try{
                let arr = [];
                for(let item of res.list) {
                    arr.push({
                        id: item.id,
                        name: item.name,
                        picUrl: item.coverImgUrl,
                        playCount: item.playCount
                    })
                }
                this.setState({
                    list: arr,
                    title: '排行榜'
                })
            }  catch (err) {}
            Taro.hideLoading()
        })
    }

    render () {
        return (
            <View className='PersonalizedList'>
                {/* 推荐歌单 */}
                <View className='cell-title'>{this.state.title}<AtIcon value='chevron-right' size='20' color='#999'></AtIcon></View>
                <View className='cell-SongSheet'>
                    {
                        this.state.list.map((item, index) => {
                            return <SongSheet key={index} Oid={item.id} name={item.name} picUrl={item.picUrl + '?imageView&thumbnail=250x0'} playCount={item.playCount} />
                        })
                    }
                </View>
            </View>
        )
    }
}