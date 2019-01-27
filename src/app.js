import Taro, { Component } from '@tarojs/taro'
import Index from './pages/index'
import './app.scss'

class App extends Component {

    config = {
        pages: [
            'pages/index/index',
            'pages/Song/index',
            'pages/PersonalizedList/index',
            'pages/SongList/index'
        ],
        window: {
            backgroundTextStyle: 'light',
            navigationBarBackgroundColor: '#31c27c',
            navigationBarTitleText: '音乐达人范',
            navigationBarTextStyle: 'white'
        },
        "requiredBackgroundModes": ["audio"]
    }

    render () {
        return (
            <Index />
        )
    }
}

Taro.render(<App />, document.getElementById('app'))
