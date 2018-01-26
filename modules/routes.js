/*global SENTRY_PUB_DSN, LEANCLOUD_APP_ID, LEANCLOUD_APP_KEY, LEANCLOUD_APP_ENV, LEAN_CLI_HAVE_STAGING*/
import React from 'react'
import Raven from 'raven-js'
import { Route, IndexRoute, Redirect } from 'react-router'
import moment from 'moment'
import AV from 'leancloud-storage/live-query'

import common from './common'
import App from './App'
import About from './About'
import Login from './Login'

import Tickets from './Tickets'
import NewTicket from './NewTicket'
import Ticket from './Ticket'
import CustomerService from './CustomerService'
import CSTickets from './CustomerServiceTickets'
import CSStats from './CustomerServiceStats'
import CSStatsUser from './CustomerServiceStats/User'
import User from './User'
import Home from './Home'

import Settings from './Settings'
import SettingsCSProfile from './settings/CustomerServiceProfile'
import Members from './settings/Members'
import Categories from './settings/Categories'
import Category from './settings/Category'
import Error from './Error'
import NotFound from './NotFound'

moment.locale('zh-cn')

if (SENTRY_PUB_DSN !== '') {
  Raven.config(SENTRY_PUB_DSN).install()
}

AV.init({
  appId: LEANCLOUD_APP_ID || 'L7MQR1cbaG4AHdoGy3cBwJCc-gzGzoHsz',
  appKey: LEANCLOUD_APP_KEY || '5v2X69PNeicRiDBCkdy1VcIi',
})
if (LEANCLOUD_APP_ENV === 'development') {
  AV.setProduction(LEAN_CLI_HAVE_STAGING !== 'true')
} else {
  AV.setProduction(LEANCLOUD_APP_ENV === 'production')
}

module.exports = (
  <Route path="/" component={App}>
    <IndexRoute component={Home}/>
    <Route path="/about" component={About}/>
    <Route path="/login" component={Login}/>
    <Route path="/tickets" component={Tickets} onEnter={common.requireAuth} />
    <Route path="/tickets/new" component={NewTicket} onEnter={common.requireAuth} />
    <Route path="/tickets/:nid" component={Ticket} onEnter={common.requireAuth} />
    <Route path="/customerService" component={CustomerService} onEnter={common.requireCustomerServiceAuth}>
      <Route path="/customerService/tickets" component={CSTickets} />
      <Route path="/customerService/stats" component={CSStats} />
      <Route path="/customerService/stats/users/:userId" component={CSStatsUser} />
    </Route>
    <Route path="/users/:username" component={User} onEnter={common.requireAuth} />
    <Route path="/settings" component={Settings} onEnter={common.requireAuth}>
      <Route path="/settings/customerServiceProfile" component={SettingsCSProfile} />
      <Route path="/settings/members" component={Members} />
      <Route path="/settings/categories" component={Categories} />
      <Route path="/settings/categories/:id" component={Category} />
    </Route>
    <Redirect from="/t/leancloud" to="/tickets" />
    <Redirect from="/t/leancloud/:nid" to="/tickets/:nid" />
    <Route path="/error" component={Error} />
    <Route path='*' component={NotFound} />
  </Route>
)
