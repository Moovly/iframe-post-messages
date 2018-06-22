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