import Taro from '@tarojs/taro'
import { View, Image } from '@tarojs/components'
import { Swiper, SwiperItem, AtIcon  } from 'taro-ui'
import { getBanner, getPersonalized, toplist } from '../../api/index'
import SongSheet from '../../components/SongSheet/index'
import './index.scss'

export default class Recommend extends Taro.Component {
    constructor () {
        super(...arguments)
        this.state = {
            banner: [],//轮播图
            PersonalizedList: [],//推荐歌单
            toplist: [],//排行榜   
            current: 0,
            show: [0],//表示已经显示过的banner
        }
    }
    componentWillMount() {
        Taro.showLoading({
            title: 'loading'
        })
        Promise.all([
            getBanner().then(res => {
                let arr = [];
                for (let item of res.banners) {
                    arr.push(item.imageUrl)
                }
                this.setState({
                    banner: arr
                })
            }),
            getPersonalized().then(res => {
                try{
                    let random = Math.floor(Math.random() * (res.result.length - 5));
                    let arr = [];
                    for(let item of res.result.slice(random, random + 6)) {
                        arr.push({
                            id: item.id,
                            name: item.name,
                            picUrl: item.picUrl,
                            playCount: item.playCount
                        })
                    }
                    this.setState({
                        PersonalizedList: arr
                    })
                } catch (err) {}
            }),
            toplist().then(res => {
                let random = Math.floor(Math.random() * (res.list.length - 5));
                let arr = [];
                for(let item of res.list.slice(random, random + 6)) {
                    arr.push({
                        id: item.id,
                        name: item.name,
                        picUrl: item.coverImgUrl,
                        playCount: item.playCount
                    })
                }
                this.setState({
                    toplist: arr
                })
            })
        ]).then(() => {
            Taro.hideLoading()
        }) 
    }

    swiperChange(e) {
        if(this.state.show.includes(e.detail.current)) return;
        this.setState({
            show: this.state.show.concat([e.detail.current])
        })
    }

    go(title) {
        Taro.navigateTo({
            url: `/pages/PersonalizedList/index?name=${title}`
        })
    }

    render () {
        return (
            <View className='Recommend'>
                {/* banner  */}
                <Swiper onChange={this.swiperChange} current={this.state.current} indicatorColor='#fff' indicatorActiveColor='#31c27c' circular indicatorDots autoplay>
                    {
                        this.state.banner.map((item, index) => {
                            return (
                                <SwiperItem key={index}>
                                    <Image lazyLoad style='' src={this.state.show.includes(index) ? item  + '?imageView&thumbnail=480x0' : ''} />
                                </SwiperItem>
                            )
                        })
                    }
                </Swiper>

                {/* 推荐歌单 */}
                <View onClick={this.go.bind(this,'推荐歌单')} className='cell-title'>推荐歌单<AtIcon value='chevron-right' size='20' color='#999'></AtIcon></View>
                <View className='cell-SongSheet'>
                    {
                        this.state.PersonalizedList.map((item, index) => {
                            return <SongSheet key={index} Oid={item.id} name={item.name} picUrl={item.picUrl + '?imageView&thumbnail=250x0'} playCount={item.playCount} />
                        })
                    }
                </View>
                {/* 排行榜 */}
                <View onClick={this.go.bind(this,'排行榜')} className='cell-title'>排行榜<AtIcon value='chevron-right' size='20' color='#999'></AtIcon></View>
                <View className='cell-SongSheet'>
                    {
                        this.state.toplist.map((item, index) => {
                            return <SongSheet key={index} Oid={item.id} name={item.name} picUrl={item.picUrl + '?imageView&thumbnail=250x0'} playCount={item.playCount} />
                        })
                    }
                </View>
                
            </View>
        )
    }
}