const tape = require('tape')
const seequel = require('..')

tape('module should exports API', (t) => {
    t.plan(6)

    t.equals(typeof seequel.default, 'function', 'seeque.default')
    t.equals(seequel.default.length, 1, 'seeque.default length')

    t.equals(typeof seequel.query, 'function', 'seeque.query')
    t.equals(seequel.query.length, 2, 'seeque.query length')

    t.equals(typeof seequel.one, 'function', 'seeque.one')
    t.equals(seequel.one.length, 1, 'seeque.one length')
})

tape('wrapper API', (t) => {
    t.plan(8)

    const wrapper = seequel.default({})

    t.equals(typeof wrapper.query, 'function', 'wrapper#query')
    t.equals(wrapper.query.length, 1, 'wrapper#query length')

    t.equals(typeof wrapper.one, 'function', 'wrapper#one')
    t.equals(wrapper.one.length, 1, 'wrapper#query length')

    t.equals(typeof wrapper.transaction, 'function', 'wrapper#transaction')
    t.equals(wrapper.transaction.length, 2, 'wrapper#query length')

    t.equals(typeof wrapper.withClient, 'function', 'wrapper#withClient')
    t.equals(wrapper.withClient.length, 1, 'wrapper#withClient length')
})
