import React from 'react'
import _ from 'lodash'
import AV from 'leancloud-storage/live-query'

const {UserLabel} = require('../common')

export default class SettingMembers extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      customerServiceRole: null,
      customerServices: [],
      username: ''
    }
  }

  componentDidMount() {
    this.getRoleAndUsers('customerService')
    .then((data) => {
      this.setState({
        customerServiceRole: data.role,
        customerServices: data.users,
      })
    })
  }

  getRoleAndUsers(role) {
    return new AV.Query(AV.Role)
    .equalTo('name', role)
    .first()
    .then((role) => {
      return role.getUsers().query().find()
      .then((users) => {
        return { role, users }
      })
    })
  }

  handleUsernameChange(e) {
    this.setState({username: e.target.value})
  }

  handleSubmit(e) {
    e.preventDefault()
    AV.Cloud.run('getUserInfo', {username: this.state.username})
    .then((user) => {
      const role = this.state.customerServiceRole
      role.getUsers().add(AV.Object.createWithoutData('_User', user.objectId))
      return role.save()
      .then((role) => {
        return this.getRoleAndUsers(role.get('name'))
      }).then((data) => {
        this.setState({
          customerServiceRole: data.role,
          customerServices: data.users,
          username: '',
        })
      })
    })
  }

  handleRemoveCustomerService(id) {
    this.state.customerServiceRole.getUsers().remove(AV.Object.createWithoutData('_User', id))
    this.state.customerServiceRole.save()
    .then((role) => {
      return this.getRoleAndUsers(role.get('name'))
    }).then((data) => {
      this.setState({
        customerServiceRole: data.role,
        customerServices: data.users,
      })
    })
  }

  render() {
    const customerServices = this.state.customerServices.map((customerService) => {
      const categories = _.map(customerService.get('categories'), (category) => {
        return <span key={category.objectId}>{category.name} </span>
      })
      return (
        <tr key={customerService.id}>
          <td>
            <UserLabel user={customerService} />
          </td>
          <td>
            {categories}
          </td>
          <td>
            <input type='button' className='btn btn-default' value='移除' onClick={() => this.handleRemoveCustomerService(customerService.id)} />
          </td>
        </tr>
      )
    })
    return (
      <div>
        <form className="form-group form-inline" onSubmit={this.handleSubmit.bind(this)}>
          <div className="form-group">
            <input type="text" className="form-control" placeholder="用户名" value={this.state.username} onChange={this.handleUsernameChange.bind(this)} />
          </div>
          {' '}
          <button type="submit" className="btn btn-primary">添加为技术支持人员</button>
        </form>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>用户名</th>
              <th>负责分类</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {customerServices}
          </tbody>
        </table>
      </div>
    )
  }

}
