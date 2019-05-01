import { Rect } from './rect';
import { s8 } from '../uuid/uuid';
import { anchorsFns, iconRectFns, textRectFns } from '../middles';
import { defaultAnchors } from '../middles/anchors/default';
import { defaultIconRect, defaultTextRect } from '../middles/rects/default';

export class Node extends Rect {
  id: string;
  // 0 -1 之间的小数
  borderRadius: number;
  shapeName: string;
  icon: string;
  iconFamily: string;
  iconSize: number;
  iconColor: string;
  image: string;
  img: HTMLImageElement;
  text: string;
  textMaxLine: number;
  iconRect: Rect;
  textRect: Rect;
  anchors: Rect[] = [];
  children: Node[];
  style: any;
  styleHover: any;
  data: any;

  constructor(json: any) {
    super(json.x, json.y, json.width, json.height);
    this.id = json.id || s8();
    this.borderRadius = +json.borderRadius || 0;
    if (this.borderRadius > 1) {
      this.borderRadius = 1;
    }
    this.icon = json.icon;
    this.iconFamily = json.iconFamily;
    this.iconSize = +json.iconSize;
    this.iconColor = json.iconColor;
    this.image = json.image;
    this.text = json.text;
    this.textMaxLine = +json.textMaxLine;
    this.style = json.style || {};
    this.styleHover = json.styleHover || {};
    this.data = json.data;
    this.shapeName = json.shapeName;
    if (json.children) {
      this.children = [];
      for (const item of json.children) {
        this.children.push(new Node(item));
      }
    }

    this.init();
  }

  init() {
    // Calc rect of icon.
    if (iconRectFns[this.shapeName]) {
      iconRectFns[this.shapeName](this);
    } else {
      defaultIconRect(this);
    }

    // Calc rect of text.
    if (textRectFns[this.shapeName]) {
      textRectFns[this.shapeName](this);
    } else {
      defaultTextRect(this);
    }

    // Calc anchors.
    this.anchors = [];
    if (anchorsFns[this.shapeName]) {
      anchorsFns[this.shapeName](this);
    } else {
      defaultAnchors(this);
    }
  }
}

export function occupyRect(nodes: Node[]) {
  if (!nodes || !nodes.length) {
    return;
  }

  let x1 = 99999;
  let y1 = 99999;
  let x2 = -99999;
  let y2 = -99999;

  for (const item of nodes) {
    if (x1 > item.x) {
      x1 = item.x;
    }
    if (y1 > item.y) {
      y1 = item.y;
    }
    if (x2 < item.ex) {
      x2 = item.ex;
    }
    if (y2 < item.ey) {
      y2 = item.ey;
    }

    const childrenRect = occupyRect(item.children);
    if (childrenRect) {
      if (x1 > childrenRect.x) {
        x1 = childrenRect.x;
      }
      if (y1 > childrenRect.y) {
        y1 = childrenRect.y;
      }
      if (x2 < childrenRect.ex) {
        x2 = childrenRect.ex;
      }
      if (y2 < childrenRect.ey) {
        y2 = childrenRect.ey;
      }
    }
  }

  return new Rect(x1, y1, x2 - x1, y2 - y1);
}
