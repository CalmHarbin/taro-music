import Taro from '@tarojs/taro'
import { View } from '@tarojs/components'
import { AtTabs, AtTabsPane } from 'taro-ui'
import Recommend from '../Recommend/index'
import './index.scss'

export default class Index extends Taro.Component {
  constructor () {
    super(...arguments)
    this.state = {
      current: 0,
    }
    
  }
  componentWillMount() {
      
  }
  handleClick (value) {
    this.setState({
      current: value
    })
  }
  render () {
    const tabList = [{ title: '推荐' }, { title: '搜索' }, { title: '我的' }]
    return (
        <AtTabs swipeable={false} current={this.state.current} tabList={tabList} onClick={this.handleClick.bind(this)}>
            <AtTabsPane current={this.state.current} index={0} >
                <Recommend />
            </AtTabsPane>
            <AtTabsPane current={this.state.current} index={1}>
                <View style='padding: 100px 50px;background-color: #FAFBFC;text-align: center;'>标签页二的内容</View>
            </AtTabsPane>
            <AtTabsPane current={this.state.current} index={2}>
                <View style='padding: 100px 50px;background-color: #FAFBFC;text-align: center;'>标签页三的内容</View>
            </AtTabsPane>
        </AtTabs>
    )
  }
}