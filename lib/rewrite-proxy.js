const httpProxy = require('http-proxy')
const express = require('express')
const rewrite = require('./rewrite')

function createProxy(target) {
  const apiProxy = httpProxy.createProxyServer({
    target: target,
    secure: false,
    autoRewrite: true,
    changeOrigin: true
  })
  apiProxy.on('proxyRes', rewrite.rewriteCookies)
  apiProxy.on('proxyRes', rewrite.rewriteLocation)

  if (process.env.LOG_REQUESTS) {
    apiProxy.on('error', function(err, req, res) {
      console.log('error: ' + req.url + '\n' + err.stack) // eslint-disable-line no-console
    })
    apiProxy.on('proxyReq', function(proxyReq, req, res, options) {
      console.log('request', req.method, req.url, req.headers)// eslint-disable-line no-console
    })
    apiProxy.on('proxyRes', (proxyRes, req, res) => {
      console.log('response', proxyRes.statusCode, proxyRes.headers) // eslint-disable-line no-console
    })
  }
  return apiProxy
}

export default function rewriteProxy(target) {
  const server = express()
  proxy = createProxy(target)
  server.all('/*', proxy.web.bind(proxy))
  return server
}
