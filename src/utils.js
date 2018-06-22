function _p8(s) {
  const p = `${Math.random().toString(16)}000000000`.substr(2, 8);
  return s ? `-${p.substr(0, 4)}-${p.substr(4, 4)}` : p;
}

export function getRandomId() {
  return _p8() + _p8(true) + _p8(true) + _p8();
}

export function getSourceFrameWindow(eventSource) {
  const sourceFrame = Array.from(window.document.getElementsByTagName('iframe')).find(({ contentWindow }) => contentWindow === eventSource);
  if (!sourceFrame) {
    /* eslint-disable no-console  */
    console.error('Could not find iframe window');
    return;
  }

  return sourceFrame.contentWindow;
}
