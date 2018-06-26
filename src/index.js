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
  target, eventName, data, targetOrigin = '*', error,
}) {
  target.postMessage({
    MESSAGE_IDENTIFIER, eventName, error, data,
  }, targetOrigin);
}

function createHandler(eventName, callback, onError) {
  return function handler(event) {
    if (event.data.MESSAGE_IDENTIFIER !== MESSAGE_IDENTIFIER || event.data.eventName !== eventName) {
      return;
    }

    if (event.data.err && typeof onError === 'function') {
      return onError(event, event.data.err);
    }

    callback(event, event.data.data);
  };
}

export function onPostMessage({ eventName, callback, onError }) {
  const handler = createHandler(eventName, callback, onError);

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

  return new Promise((resolve, reject) => {
    const unsubscribe = onPostMessage({
      eventName: uniqueName,
      callback: (event, responseData) => {
        unsubscribe();
        resolve(responseData);
      },
      onError: (event, error) => reject(new Error(error)),
    });
  });
}

function createReplyOnCallback(callback, name) {
  return async function replyOnCallback(event, dataRaw) {
    const target = event.source || window.parent || window;
    const uniqueName = `${name}_${dataRaw.requestId}`;
    const { requestId, ...data } = dataRaw;

    try {
      const result = await callback(event, data);
      sendPostMessage({ target, eventName: uniqueName, data: result });
    } catch (error) {
      sendPostMessage({ target, eventName: uniqueName, error });
    }
  };
}

export function replyOnPostMessage({ eventName, callback }) {
  return onPostMessage({ eventName, callback: createReplyOnCallback(callback, eventName) });
}
