import Taro, { Component } from '@tarojs/taro';
import { Provider } from '@tarojs/redux';
import Index from './pages/index';
import './app.scss';
import configStore from './redux/store';

const store = configStore();

class App extends Component {
  componentDidMount() {}
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
    requiredBackgroundModes: ['audio']
  };

  render() {
    return (
      <Provider store={store}>
        <Index />
      </Provider>
    );
  }
}

Taro.render(<App />, document.getElementById('app'));
