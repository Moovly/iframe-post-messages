// Type definitions for @moovly/iframe-post-messages 2.x
// Project: iframe-post-messages
// Definitions by: Simon Van den Broeck

export function unsubscribeAll(): void;
export function sendPostMessage(config: { target: Window; eventName: string; data: any; targetOrigin?: string }): void;

export function requestPostMessage(config: {
  target: Window;
  eventName: string;
  data: any;
  targetOrigin?: string;
}): Promise<any>;

export function onPostMessage(config: {
  eventName: string;
  callback: (event: MessageEvent, data: any) => void;
}): () => void;

export function replyOnPostMessage(config: {
  eventName: string;
  callback: (event: MessageEvent, data: any) => Promise<any> | any;
}): () => void;
