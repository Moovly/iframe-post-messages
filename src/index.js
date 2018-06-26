import { getRandomId } from './utils';

const MESSAGE_IDENTIFIER = 'UNIQUE_POSTMESSAGE_IDENTIFIER';

const handlers = new Set();

function addHandler(l) {
  window.addEventListener('message', l, false);
  handlers.add(l);
}

function removeHandler(l) {
  if (handlers.has(l)) {
    window.removeEventListener('message', l, false);
    handlers.delete(l);
  }
}

export function unsubscribeAll() {
  handlers.forEach(removeHandler);
}

export function sendPostMessage({
  target, eventName, data, targetOrigin = '*',
}) {
  target.postMessage({ MESSAGE_IDENTIFIER, eventName, data }, targetOrigin);
}

function createHandler(eventName, callback) {
  return function handler(event) {
    if (event.data.MESSAGE_IDENTIFIER !== MESSAGE_IDENTIFIER || event.data.eventName !== eventName) {
      return;
    }
    callback(event, event.data.data);
  };
}

export function onPostMessage({ eventName, callback }) {
  const handler = createHandler(eventName, callback);

  addHandler(handler);
  return () => removeHandler(handler);
}

export function requestPostMessage({
  target, eventName, data, targetOrigin = '*',
}) {
  const requestId = getRandomId();
  const uniqueName = `${eventName}_${requestId}`;
  const requestData = { ...data, requestId };

  sendPostMessage({
    target,
    eventName,
    data: requestData,
    targetOrigin,
  });

  return new Promise((resolve) => {
    const unsubscribe = onPostMessage({
      eventName: uniqueName,
      callback: (event, responseData) => {
        unsubscribe();
        resolve(responseData);
      },
    });
  });
}

function createReplyOnCallback(callback, name) {
  return async function replyOnCallback(event, dataRaw) {
    const target = event.source || window.parent || window;
    const uniqueName = `${name}_${dataRaw.requestId}`;
    const { requestId, ...data } = dataRaw;

    const result = await callback(event, data);
    sendPostMessage({ target, eventName: uniqueName, data: result });
  };
}

export function replyOnPostMessage({ eventName, callback }) {
  return onPostMessage({ eventName, callback: createReplyOnCallback(callback, eventName) });
}
