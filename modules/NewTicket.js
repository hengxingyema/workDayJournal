/*global $*/
import React from 'react'
import PropTypes from 'prop-types'
import {FormGroup, ControlLabel, FormControl, Button, Tooltip, OverlayTrigger} from 'react-bootstrap'
import AV from 'leancloud-storage/live-query'

const {uploadFiles, getTinyCategoryInfo} = require('./common')

export default class NewTicket extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      categories: [],
      apps: [],
      isCommitting: false,
      title: '',
      appId: '',
      categoryId: '',
      content: '',
    }
  }

  componentDidMount() {
    this.contentTextarea.addEventListener('paste', this.pasteEventListener.bind(this))
    Promise.all([
      new AV.Query('Category').find(),
      AV.Cloud.run('getLeanCloudApps')
      .catch((err) => {
        if (err.message.indexOf('Could not find LeanCloud authData:') === 0) {
          return []
        }
        throw err
      }),
    ])
    .then(([categories, apps]) => {
      let {
        title=(localStorage.getItem('ticket:new:title') || ''),
        appId='',
        categoryId='',
        content=(localStorage.getItem('ticket:new:content') || '')
      } = this.props.location.query
      const category = categories.find(c => c.id === categoryId)
      if (content === '' && category && category.get('qTemplate')) {
        content = category.get('qTemplate')
      }
      this.setState({
        categories, apps,
        title, appId, categoryId, content,
      })
    })
  }

  componentWillUnmount() {
    this.contentTextarea.removeEventListener('paste', this.pasteEventListener.bind(this))
  }

  pasteEventListener(e) {
    if (e.clipboardData.types.indexOf('Files') != -1) {
      this.setState({isCommitting: true})
      return uploadFiles(e.clipboardData.files)
      .then((files) => {
        const content = `${this.state.content}\n<img src='${files[0].url()}' />`
        this.setState({isCommitting: false, content})
      })
    }
  }

  handleTitleChange(e) {
    localStorage.setItem('ticket:new:title', e.target.value)
    this.setState({title: e.target.value})
  }

  handleCategoryChange(e) {
    const category = this.state.categories.find(c => c.id === e.target.value)
    if (category) {
      this.setState({categoryId: category.id, content: category.get('qTemplate') || ''})
    } else {
      this.setState({categoryId: '', content: ''})
    }
  }

  handleAppChange(e) {
    this.setState({appId: e.target.value})
  }

  handleContentChange(e) {
    localStorage.setItem('ticket:new:content', e.target.value)
    this.setState({content: e.target.value})
  }

  handleSubmit(e) {
    e.preventDefault()

    if (!this.state.title || this.state.title.trim().length === 0) {
      this.context.addNotification(new Error('标题不能为空'))
      return
    }
    if (!this.state.categoryId) {
      this.context.addNotification(new Error('问题分类不能为空'))
      return
    }

    this.setState({isCommitting: true})
    uploadFiles($('#ticketFile')[0].files)
    .then((files) => {
      const category = this.state.categories.find(c => c.id === this.state.categoryId)
      return new AV.Object('Ticket').save({
        title: this.state.title,
        category: getTinyCategoryInfo(category),
        content: this.state.content,
        files,
      })
      .then((ticket) => {
        if (this.state.appId) {
          return new AV.Object('Tag').save({
            key: 'appId',
            value: this.state.appId,
            ticket
          })
        }
      })
    }).then(() => {
      localStorage.removeItem('ticket:new:title')
      localStorage.removeItem('ticket:new:content')
      this.context.router.push('/tickets')
    })
    .catch(this.context.addNotification)
    .then(() => {
      this.setState({isCommitting: false})
    })
  }

  render() {
    const options = this.state.categories.map((category) => {
      return (
        <option key={category.id} value={category.id}>{category.get('name')}</option>
      )
    })
    const appOptions = this.state.apps.map((app) => {
      return <option key={app.app_id} value={app.app_id}>{app.app_name}</option>
    })
    const tooltip = (
      <Tooltip id="tooltip">支持 Markdown 语法</Tooltip>
    )
    return (
      <form onSubmit={this.handleSubmit.bind(this)}>
        <FormGroup>
          <ControlLabel>标题</ControlLabel>
          <input type="text" className="form-control" value={this.state.title} onChange={this.handleTitleChange.bind(this)} />
        </FormGroup>
        <FormGroup>
          <ControlLabel>运营区域</ControlLabel>
          <FormControl componentClass="select" value={this.state.appId} onChange={this.handleAppChange.bind(this)}>
            <option key='empty'></option>
            {appOptions}
          </FormControl>
        </FormGroup>
        <FormGroup>
          <ControlLabel>问题分类</ControlLabel>
          <FormControl componentClass="select" value={this.state.categoryId} onChange={this.handleCategoryChange.bind(this)}>
            <option key='empty'></option>
            {options}
          </FormControl>
        </FormGroup>
        <FormGroup>
          <ControlLabel>
            问题描述 <OverlayTrigger placement="top" overlay={tooltip}>
              <b className="has-required" title="支持 Markdown 语法">M↓</b>
            </OverlayTrigger>
          </ControlLabel>
          <FormControl componentClass="textarea" placeholder="在这里输入，粘贴图片即可上传。" rows="8"
            value={this.state.content}
            onChange={this.handleContentChange.bind(this)}
            inputRef={(ref) => this.contentTextarea = ref }
          />
        </FormGroup>
        <FormGroup>
          <input id="ticketFile" type="file" multiple />
        </FormGroup>
        <Button type='submit' disabled={this.state.isCommitting}>提交</Button>
      </form>
    )
  }

}

NewTicket.contextTypes = {
  router: PropTypes.object,
  addNotification: PropTypes.func.isRequired,
}

NewTicket.propTypes = {
  location: PropTypes.object,
}
