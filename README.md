# iframe-post-messages
Utility library to simplify postMessage API.\
Allows for subscribing and easy back and forth messaging between iframes.

## Table of Contents
- [Install](#install)
- [Usage](#usage)
  * [One way usage](#one-way-usage)
  * [Two way usage](#two-way-usage)
- [API](#api)
  * [sendPostMessage](#sendpostmessage)
  * [onPostMessage](#onpostmessage)
  * [requestPostMessage](#requestpostmessage)
  * [replyOnPostMessage](#replyonpostmessage)
  * [unsubscribeAll](#unsubscribeall)

## Install
```
$ npm install --save @moovly/iframe-post-messages
```

## Usage
### One way usage
Send a message to another frame.

```js
import { sendPostMessage, onPostMessage } from '@moovly/iframe-post-messages'

// Frame A: send a message to frame B
sendPostMessage({
  target: frameB,
  eventName: 'hello',
  data: { foo: 'bar' }
});

// Frame B: receive message from frame A
onPostMessage({
  eventName: 'hello',
  callback: (event, data) => {
    console.log(data); // output: { foo: 'bar' }
  }
});

```
### Two way usage
Send a message to another frame and get a response back

```js
import { requestPostMessage, replyOnPostMessage } from '@moovly/iframe-post-messages'

// Frame A: send request to frame B, and await reply
requestPostMessage({
  target: frameB,
  eventName: 'getStatus'
}).then(res => {
    console.log(res); // output: { status: 'OK' }
});

// Frame B: receive message from frame A, and send reply back
replyOnPostMessage({
  eventName: 'getStatus',
  callback: event => ({ status: 'OK' });
});
```

You can also respond with a promise:
```js
replyOnPostMessage({
  eventName: 'getStatus',
  callback: event => new Promise(resolve => {
    setTimeout(() => { resolve({ status: 'Still OK' }) }, 1000)
  }),
});
```

## API

### sendPostMessage
```js
sendPostMessage({
  target: DOMElement<iframe>,
  eventName: string,
  data: any,
  targetOrigin = '*': string,
}): void
```

- `target`: iframe,
- `eventName`: string, is used to identify the specific event
- `data`: Almost any data type, see [this article](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm) for a complete list
- `targetOrigin`: See [this article](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage#Syntax) for more information about this parameter

### onPostMessage
```js
onPostMessage({
  eventName: string,
  callback: (event, data) => void,
}): () => void,
```

Returns an unsubscribe function, to cancel future events from invoking the callback function.

- `eventName`: string, is used to identify the specific event
- `callback`: function that will be invoked when the specified event is received. receives 2 arguments, the entire `event` and the sent `data` field.

### requestPostMessage
```js
requestPostMessage({
  target: DOMElement<iframe>,
  eventName: string,
  data: any,
  targetOrigin = '*': string,
}): Promise<any>
```
Very similar to `sendPostMessage` but will return a promise that will resolve with the result of the target's `replyOnPostMessage` listener.

- `target`: iframe,
- `eventName`: string, is used to identify the specific event
- `data`: Almost any data type, see [this article](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm) for a complete list
- `targetOrigin`: See [this article](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage#Syntax) for more information about this parameter

### replyOnPostMessage
```js
replyOnPostMessage({
  eventName: string,
  callback: (event, data) => Promise<any> | any,
}): () => void,
```
Very similar to `onPostMessage` but allows the callback function to return an object to be send back to the other iframe `requestPostMessage` Promise.

Returns an unsubscribe function, to cancel future events from invoking the callback function.

- `eventName`: string, is used to identify the specific event
- `callback`: (promise) function that will be invoked when the specified event is received. receives 2 arguments, the entire `event` and the sent `data` field. the return value from this function will be sent back to the `requestPostMessage` iframe.

### unsubscribeAll
**Usage**:
```js
import { unsubscribeAll } from '@moovly/iframe-post-messages';
unsubscribeAll()
```
Calling this function will remove all current listeners that were set up using `onPostMessage` and  `replyOnPostMessage`.
