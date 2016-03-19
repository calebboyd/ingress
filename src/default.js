import { Buffer } from 'buffer'
import statuses from 'statuses'

const looksLikeHtmlRE = /^\s*</,
  cl = (res, value) => res.setHeader('Content-Length', Buffer.byteLength(value)),
  ct = (res, value) => res.setHeader('Content-Type', value)


function statusResponse (status, message, res) {
  res.statusCode = status || 404
  message = message || statuses[res.statusCode] || ''
  ct(res, 'text/plain')
  cl(res, Buffer.byteLength(message))
  res.end(message)
}

function defaultHandler (ctx) {
  const res = ctx.res,
    hasContentType = Boolean(res._headers && res._headers['content-type']),
    canRespond = Boolean(res.socket && res.socket.writable && !res.headersSent)

  if (!canRespond) {
    console.log('Cannot respond')
    return
  }

  if (ctx.error) {
    return statusResponse(500, res.statusMessage, res)
  }

  let body = ctx.body

  if (statuses.empty[res.statusCode]) {
    res._headers = {}
    return res.end()
  }
  if (!body) {
    //not found
    return statusResponse(res.statusCode, res.statusMessage, res)
  }

  if (typeof body === 'string') {
    !hasContentType && ct(res, 'text/' + (looksLikeHtmlRE.test(body) ? 'html' : 'plain'))
    cl(res, body)
    return res.end(body)
  }
  if (Buffer.isBuffer(body)) {
    !hasContentType && ct(res, 'application/octet-stream')
    cl(res, body)
    return res.end(body)
  }
  if ('function' === typeof body.pipe) {
    !hasContentType && ct(res, 'application/octet-stream')
    //TODO handle stream end, errors
    return body.pipe(res)
  }
  body = JSON.stringify(body)
  ct(res, 'application/json')
  cl(res, body)
  res.end(body)
}

export default function (onError) {
  return function defaultRequestHandler (context, next) {
    context.res.statusCode = 404

    return next().then(null, () => {
      context.error = error
      return onError(context)
    }).then(() => defaultHandler(context))
  }
}