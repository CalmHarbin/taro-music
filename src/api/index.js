import Taro from '@tarojs/taro'
import config from '../config/index'

function Api(path, data={}) {
    return new Promise((resolve,reject) => {
        Taro.request({
            url: config.serverUrl + path,
            data: data,
            header: {
            'content-type': 'application/json'
            }
        }).then(res => {
            if(res.statusCode >= 200 && res.statusCode<=300){
                resolve(res.data)
            } else {
                Taro.showToast({
                    title: res.errMsg,
                    icon: 'none',
                    duration: 1000
                })
            }
        }).catch(err => {
            Taro.showToast({
                title: err.errMsg,
                icon: 'none',
                duration: 1000
            })
            reject(err);
        })
    })
}
//首页轮播图
const getBanner = (data={}) => new Api('/banner', data);
//推荐歌单
const getPersonalized = (data={}) => new Api('/personalized', data);
//歌单详情
const getSongList = (data={}) => new Api('/playlist/detail', data);
//歌曲详情
const getSong = (data={}) => new Api('/song/url', data);
//获取歌词
const getLyric = (data={}) => new Api('/lyric', data);
export{
    getBanner,
    getPersonalized,
    getSongList,
    getSong,
    getLyric,
}