### router.middleware
Decorator based router middleware for [`ingress`](https://github.com/calebboyd/ingress)

`npm i router.middleware`

Define routes using the `@Route` decorator, and plain javascript classes.

## Route Definition

```javascript
import { Route } from 'router.middleware'

@Route('prefix')
export class MyController {

  @Route.Get('/echo/:echo')
  someRouteHandler ({ params }) {
    return 'Echoing ' + params.echo
  }
}
// GET /prefix/echo/something ===> something
```

## Getting started

```javascript
import { Server, DefaultMiddleware } from 'ingress'
import { Router } from 'router.middleware'
import { MyController } from './my-controller'

const app = new Server()

app
  .use(new DefaultMiddleware())
  .use(new Router({ controllers: [MyController] }))
  .listen(8888)
  .then(() => console.log('started'))
```

## Exports

### **Router** (routerOptions): class

 - **RouterOptions: object**
   - **controllers: Array\<Type\>** (required)
   - **baseUrl: string**
     - Define the base url. Defaults to `'/'`
   - **resolveController: (context, controller) => any**
     - resolve the controller instance. Defaults to `(ctx, ctrl) => ctx.scope.get(ctrl)`
   - **isRoutable: (def: RouteMeatdata) => boolean**
     - Identify a class method as routable. Defaults to methods with a `@Route` decorator
   - **getMethods: (def: RouteMetdata) => string[]**
     - Identify the http methods for the route. Defaults to methods defined with a `@Route` decorator
   - **getPath: (baseUrl: string, def: RouteMetadata) => string**
     - Identify the path for the route. Defaults to paths defined with a `@Route` decorator

### **Route** : (route: string, ...methods: string[]) => ClassDecorator | MethodDecorator

 - Create a decorator that defines a route with a path and method(s)
   - Additional helper methods:
     - `Route.Get`
     - `Route.Post`
     - `Route.Put`
     - `Route.Delete`
     - `Route.Patch`
 - The `@Route` decorator can be used on classes and controllers.
   The handler will be prefixed by the route defined on its class definition
 - It can accept additional `Route` methods, or strings, as rest parameters.
   - `@Route('/some/route', Route.Post, 'Put')`

### **ParseBody**: (subtextOptions) => MethodDecorator

 - Create a body parser decorator based on [subtext](https://github.com/hapijs/subtext)

---

### Defining middleware

Arbirary middleware can be defined on any handler using the reflection property `'annotations'`.

```javascript
import { createAnnotationFactory } from 'reflect-annotations'

class FancyAnnotation {
  constructor (fancyOrNot) {
    this.fancy = fancyOrNot
  }
  get middleware () {
    return (context, next) => {
      context.isFancy = this.fancyOrNot
      next()
    }
  }
}

export const Fancy = createAnnotationFactory(FancyAnnotation)
```

Using `@Fancy(true)` on any handler or controller will add the middleware function to the execution of the desired handler or handler(s) respectively.
