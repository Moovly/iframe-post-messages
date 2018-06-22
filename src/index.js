import { getRandomId, getSourceFrameWindow } from './utils';

const MESSAGE_IDENTIFIER = 'UNIQUE_POSTMESSAGE_IDENTIFIER';

export function send({
  otherWindow, eventName, data, targetOrigin = '*',
}) {
  otherWindow.postMessage({ MESSAGE_IDENTIFIER, eventName, data }, targetOrigin);
}

function createHandler(eventName, callback) {
  return function handler(event) {
    if (event.data.MESSAGE_IDENTIFIER !== MESSAGE_IDENTIFIER || event.data.eventName !== eventName) {
      return;
    }
    callback(event, event.data.data);
  };
}

export function on({ eventName, callback }) {
  const handler = createHandler(eventName, callback);

  window.addEventListener('message', handler, false);
  return () => window.removeEventListener('message', handler, false);
}

export function request({
  otherWindow, eventName, data, targetOrigin = '*',
}) {
  const requestId = getRandomId();
  const uniqueName = `${eventName}_${requestId}`;
  const requestData = { ...data, requestId };

  send({
    otherWindow,
    eventName,
    data: requestData,
    targetOrigin,
  });

  return new Promise((resolve) => {
    const unsubscribe = on({
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
    const otherWindow = getSourceFrameWindow(event.source);
    const uniqueName = `${name}_${dataRaw.requestId}`;
    const { requestId, ...data } = dataRaw;

    const result = await callback(event, data);
    send({ otherWindow, eventName: uniqueName, data: result });
  };
}

export function replyOn({ eventName, callback }) {
  return on({ eventName, callback: createReplyOnCallback(callback, eventName) });
}
