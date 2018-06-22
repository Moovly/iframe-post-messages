import * as postMessageUtil from './index';

const mockWindow = window;

jest.mock('./utils', () => ({
  getSourceFrameWindow: jest.fn(() => mockWindow),
  getRandomId: jest.fn(() => 'randomId'),
}));

describe('postMessageUtil', () => {
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

      removeEventListener = postMessageUtil.on({
        eventName,
        callback: (_event, _data) => {
          event = _event;
          data = _data;
          done();
        },
      });

      postMessageUtil.send({ otherWindow, eventName, data: eventData });
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

    it('should return data for normal value', () => {
      const eventData = { foo: 'bar' };
      const eventName = 'promise-based-event1';

      postMessageUtil.replyOn({ eventName, callback: event => eventData });

      return postMessageUtil.request({ otherWindow: window, eventName }).then((res) => {
        expect(res).toEqual(eventData);
      });
    });

    it('should return data for promise value', () => {
      const eventData = { foo: 'bar' };
      const eventName = 'promise-based-event2';
      postMessageUtil.replyOn({ eventName, callback: event => Promise.resolve(eventData) });

      return postMessageUtil.request({ otherWindow: window, eventName }).then((res) => {
        expect(res).toEqual(eventData);
      });
    });

    it('should reply for additional calls', () => {
      let counter = 0;
      const eventName = 'promise-based-event3';

      postMessageUtil.replyOn({
        eventName,
        callback: (event) => {
          counter += 1;
          return counter;
        },
      });

      return postMessageUtil
        .request({ otherWindow: window, eventName })
        .then((res) => {
          expect(res).toEqual(1);
        })
        .then(() => postMessageUtil.request({ otherWindow: window, eventName }))
        .then((res) => {
          expect(res).toEqual(2);
        });
    });
  });
});
