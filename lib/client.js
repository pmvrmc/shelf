// Dependecies
var redis = require('redis')
var Queue = require('redis/lib/queue')

// hide this methods from our Storage API
var hideMethods = [
  'install_stream_listeners',
  'initialize_retry_vars',
  'unref',
  'flush_and_error',
  'on_error',
  'do_auth',
  'on_connect',
  'init_parser',
  'on_ready',
  'on_info_cmd',
  'ready_check',
  'send_offline_queue',
  'connection_gone',
  'on_data',
  'return_error',
  'return_reply',
  'send_command',
  'pub_sub_command'
]

function Storage () {
  var self = this

  // Properties
  this.mountQueue = new Queue()

  // Create a redis client connection
  var client = redis.createClient()
  Object.defineProperty(this, '__client__', {
    value: client
  })

  // Filter the methods we dont want to wrap
  var allMethods = Object.keys(Object.getPrototypeOf(client))
  var methods = allMethods.filter(function (fn) {
    return hideMethods.indexOf(fn) < 0
  })

  // REDIS methods
  methods.forEach(function (method) {
    self[method] = function () {
      return self.__client__[method].apply(client, arguments)
    }
  })

  // EventEmitter methods
  // TODO wrap the rest of them
  self.on = function () {
    self.__client__.on.apply(client, arguments)
  }
  self.once = function () {
    self.__client__.once.apply(client, arguments)
  }
}

module.exports = Storage
