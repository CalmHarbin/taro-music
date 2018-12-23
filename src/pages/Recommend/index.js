import Taro from '@tarojs/taro'
import { View, Image } from '@tarojs/components'
import { Swiper, SwiperItem, AtIcon  } from 'taro-ui'
import { getBanner, getPersonalized } from '../../api/index'
import SongSheet from '../../components/SongSheet/index'
import './index.scss'

export default class Recommend extends Taro.Component {
    constructor () {
        super(...arguments)
        this.state = {
            banner: [],
            PersonalizedList: [],
        }
    }
    componentWillMount() {
        getBanner().then(res => {
            let arr = [];
            for (let item of res.banners) {
                arr.push(item.imageUrl)
            }
            this.setState({
                banner: arr
            })
        })

        getPersonalized().then(res => {
            let random = Math.floor(Math.random() * (res.result.length - 5));
            // .slice(random, random + 6)
            this.setState({
                PersonalizedList: res.result
            })
        })
    }

    render () {
        return (
            <View className='Recommend'>
                {/* banner  */}
                <Swiper indicatorColor='#fff' indicatorActiveColor='#31c27c' circular indicatorDots autoplay>
                    {
                        this.state.banner.map((item, index) => {
                            return (
                                <SwiperItem key={index}>
                                    <Image style='' src={item} />
                                </SwiperItem>
                            )
                        })
                    }
                </Swiper>

                {/* 推荐歌单 */}
                <View className='cell-title'>推荐歌单<AtIcon value='chevron-right' size='20' color='#999'></AtIcon></View>
                <View className='cell-SongSheet'>
                    {
                        this.state.PersonalizedList.map((item, index) => {
                            return <SongSheet key={index} Oid={item.id} name={item.name} picUrl={item.picUrl} playCount={item.playCount} />
                        })
                    }
                </View>

                {/* 最新音乐 */}
                {/* <View className='cell-title'>最新音乐<AtIcon value='chevron-right' size='20' color='#999'></AtIcon></View> */}
                


            </View>
        )
    }
}