const mail = require('./mail')
const bearychat = require('./bearychat')
const wechat = require('./wechat')

exports.newTicket = (ticket, author, assignee) => {
  return Promise.all([
    mail.newTicket(ticket, author, assignee),
    bearychat.newTicket(ticket, author, assignee),
    wechat.newTicket(ticket, author, assignee),
  ])
}

exports.replyTicket = (ticket, reply, replyAuthor) => {
  const to = reply.get('isCustomerService') ? ticket.get('author') : ticket.get('assignee')
  const data = {
    ticket,
    reply,
    from: replyAuthor,
    to,
    isCustomerServiceReply: reply.get('isCustomerService'),
  }
  return Promise.all([
    mail.replyTicket(data),
    bearychat.replyTicket(data),
    wechat.replyTicket(data),
  ])
}

exports.changeAssignee = (ticket, operator, assignee) => {
  return Promise.all([
    mail.changeAssignee(ticket, operator, assignee),
    bearychat.changeAssignee(ticket, operator, assignee),
    wechat.changeAssignee(ticket, operator, assignee),
  ])
}

exports.ticketEvaluation = (ticket, author, to) => {
  return bearychat.ticketEvaluation(ticket, author, to)
}
