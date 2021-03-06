import * as assert from 'assert'
import { Container, Injector, ReflectiveInjector } from '.'

const Injectable = (): ClassDecorator => () => void 'decorator that will cause tsc to emit type metadata'

describe('DI Container', () => {
  it('should work', () => {
    @Injectable()
    class TestA {
      public a = Math.random()
    }

    class Context {
      scope: Injector = ReflectiveInjector.resolveAndCreate([])
    }

    const container = new Container({
      contextToken: Context,
      singletons: [TestA],
    })

    const { Service, SingletonService } = container

    @SingletonService
    class TestC {
      public point = Math.random()
    }

    @SingletonService()
    class TestB {
      constructor(public testA: TestA) {}
    }

    @Service
    class TestD {
      constructor(public testC: TestC, public testB: TestB) {}
    }

    const context1 = new Context(),
      context2 = new Context(),
      middleware = container.middleware
    container.start()
    let called = false,
      expectedSingleton: any,
      expectedDifferentInstance: any

    middleware(context1, function test() {
      called = true
      assert.ok(context1.scope.get(Context) === context1, 'Expected to be able to retrieve current context')

      const testA = context1.scope.get(TestA),
        testC = context1.scope.get(TestC),
        testD = context1.scope.get(TestD)

      expectedSingleton = testC
      expectedDifferentInstance = testD

      assert.ok(testA.a === testD.testB.testA.a, 'Expected A to be a singleton')
      assert.ok(testD.testC === testC)
    })

    //Should compile
    const testB = container.get(TestB)
    void testB.testA

    middleware(context2, () => {
      assert.ok(context2.scope !== context1.scope, 'Expected subsequent contexts to not be equal')

      assert.ok(expectedSingleton === context2.scope.get(TestC), 'Expected TestC to be a singleton')

      assert.ok(context2.scope.get(TestD) !== expectedDifferentInstance, 'Expected TestD to be unique per context')

      assert.ok(context2.scope.get(Context) === context2, 'Expected context to retrieve active context token')
    })

    assert.ok(called)
  })
})
