## Install
```
$ npm install --save @moovly/iframe-post-messages
```

## One way usage
Send a message to another frame.

```js
import { send, on } from '@moovly/iframe-post-messages'

// Frame A: send a message to frame B
send({
  target: frameB,
  eventName: 'hello',
  data: { foo: 'bar' }
});

// Frame B: receive message from frame A
on({
  eventName: 'hello',
  callback: (event, data) => {
    console.log(data); // output: { foo: 'bar' }
  }
});

```
## Two way usage
Send a message to another frame and get a response back

```js
import { request, replyOn } from '@moovly/iframe-post-messages'

// Frame A: send request to frame B, and await reply
request({
  target: frameB,
  eventName: 'getStatus'
}).then(res => {
    console.log(res); // output: { status: 'OK' }
});

// Frame B: receive message from frame A, and send reply back
replyOn({
  eventName: 'getStatus',
  callback: event => ({ status: 'OK' });
});
```

You can also respond with a promise:
```js
replyOn({
  eventName: 'getStatus',
  callback: event => new Promise(resolve => {
    setTimeout(() => { resolve({ status: 'Still OK' }) }, 1000)
  }),
});
```

## API:

### send
```js
send({
  target: DOMElement<iframe>,
  eventName: string,
  data: any,
  targetOrigin = '*': string,
}): void
```

- target: iframe,
- eventName: string, is used to identify the specific event
- data: Almost any data type, see [this article](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm) for a complete list
- targetOrigin: See [this article](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage#Syntax) for more information about this parameter

### on
```js
on({
  eventName: string,
  callback: (event, data) => void,
}): () => void,
```

Returns an unsubscribe function, to cancel future events from invoking the callback function.

- eventName: string, is used to identify the specific event
- callback: function that will be invoked when the specified event is received. receives 2 arguments, the entire `event` and the sent `data` field.

### request
```js
request({
  target: DOMElement<iframe>,
  eventName: string,
  data: any,
  targetOrigin = '*': string,
}): Promise<any>
```
Very similar to `send` but will return a promise that will resolve with the result of the target's `replyOn` listener.

- target: iframe,
- eventName: string, is used to identify the specific event
- data: Almost any data type, see [this article](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm) for a complete list
- targetOrigin: See [this article](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage#Syntax) for more information about this parameter

### replyOn
```js
on({
  eventName: string,
  callback: (event, data) => void,
}): () => void,
```
Very similar to `on` but allows the callback function to return an object to be send back to the other iframe `request` Promise.

Returns an unsubscribe function, to cancel future events from invoking the callback function.

- eventName: string, is used to identify the specific event
- callback: (promise) function that will be invoked when the specified event is received. receives 2 arguments, the entire `event` and the sent `data` field. the return value from this function will be sent back to the request iframe.
