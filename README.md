## ingress

install: `npm i ingress`

An abstraction over the [http.Server] class that uses [promise-based middleware]

```javascript
import ingress, { DefaultContext } from 'ingress'

const app = ingress()

app.use(async (ctx: DefaultContext, next: () => Promise<void>) => {
  await next()
  ctx.res.end('Hello World')
})

app.listen(8080).then(() => console.log('Listening on port 8080'))
```

The argument passed to the middleware functions includes `req` and `res` properties. Which are instances of [http.IncomingMessage] and [http.ServerResponse] respectively. The argument can be modified arbitrarily by the middleware functions and is created per request.

The module has two named exports: `Server` and `DefaultContext`; and the default export -- a factory for creating `Server` instances

#### Supported Middleware
- [di.middleware](https://github.com/calebboyd/di.middleware) 
- [router.middleware](https://github.com/calebboyd/router.middleware) 



[http.IncomingMessage]: https://nodejs.org/api/http.html#http_class_http_incomingmessage
[http.ServerResponse]: https://nodejs.org/api/http.html#http_class_http_serverresponse
[http.Server]: https://nodejs.org/api/http.html#http_class_http_server
[promise-based middleware]: https://github.com/calebboyd/app-builder

