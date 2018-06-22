import { sendPostMessage, onPostMessage, requestPostMessage, replyOnPostMessage, unsubscribeAll } from './index';

const mockWindow = window;

jest.mock('./utils', () => ({
  getSourceFrameWindow: jest.fn(() => mockWindow),
  getRandomId: jest.fn(() => 'randomId'),
}));

describe('one-way postMessage', () => {
  let eventName;
  let eventData;
  let otherWindow;
  let event;
  let data;
  let removeEventListener;

  beforeEach((done) => {
    eventName = 'simple-event';
    eventData = { foo: 'bar' };
    otherWindow = window;

    removeEventListener = onPostMessage({
      eventName,
      callback: (_event, _data) => {
        event = _event;
        data = _data;
        done();
      },
    });

    sendPostMessage({ target: otherWindow, eventName, data: eventData });
  });

  afterEach(() => {
    removeEventListener();
  });

  it('should return data', () => {
    expect(data).toEqual(eventData);
  });

  it('should return post message event', () => {
    expect(event.type).toBe('message');
    expect(event.data.MESSAGE_IDENTIFIER).toBe('UNIQUE_POSTMESSAGE_IDENTIFIER');
    expect(event.data.eventName).toBe(eventName);
    expect(event.data.data).toEqual(eventData);
  });
});

describe('two-way postMessaging', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return data for normal value', async () => {
    const eventData = { foo: 'bar' };
    const eventName = 'promise-based-event1';

    replyOnPostMessage({ eventName, callback: event => eventData });

    const res = await requestPostMessage({ target: window, eventName });
    expect(res).toEqual(eventData);
  });

  it('should return data for promise value', async () => {
    const eventData = { foo: 'bar' };
    const eventName = 'promise-based-event2';

    replyOnPostMessage({ eventName, callback: event => Promise.resolve(eventData) });

    const res = await requestPostMessage({ target: window, eventName });
    expect(res).toEqual(eventData);
  });

  it('should reply for additional calls', async () => {
    let counter = 0;
    const eventName = 'promise-based-event3';

    replyOnPostMessage({
      eventName,
      callback: (event) => {
        counter += 1;
        return counter;
      },
    });

    const res1 = await requestPostMessage({ target: window, eventName });
    expect(res1).toEqual(1);

    const res2 = await requestPostMessage({ target: window, eventName });
    expect(res2).toEqual(2);
  });
});

describe('unsubscribeAll', () => {
  // TODO
});
