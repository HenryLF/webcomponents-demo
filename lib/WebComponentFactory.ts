import Alpine from "alpinejs";

function dispatchCustomEvent(target: EventTarget, name: string, detail: any) {
  return target.dispatchEvent(new CustomEvent(name, { detail }));
}

function queryForSlot(target: HTMLElement, ...selectors: string[]) {
  const selector = selectors.map((slot) => `*[slot=${slot}]`);
  return Array.from(target.querySelectorAll(selector.join(",")));
}

export function WebComponentFactory(
  name: string,
  template: HTMLTemplateElement | string,
  option?: {
    xDataFactory?: (...args: any[]) => object;
    xDataFactoryArgs?: any[];
    onUnmount?: (this: AlpineWebComponent) => void;
    noShadow?: boolean;
  }
) {
  let temp: HTMLTemplateElement;
  if (typeof template === "string") {
    temp = document.createElement("template");
    temp.innerHTML = template;
  } else {
    temp = template;
  }

  class CustomElement extends HTMLElement {
    root: ShadowRoot | Element;
    data: any;
    private _value: any = "";

    get value() {
      return this._value;
    }

    set value(val) {
      if (this._value === val) return;
      this._value = val;
      this.data.$val = val;
      this.dispatchEvent(new Event("input"));
    }

    constructor() {
      super();
      if (option?.noShadow) {
        this.root = this;
      }else{
        this.root = this.attachShadow({ mode: "closed" });
      }
    }

    connectedCallback() {
      this.root.appendChild(temp.content.cloneNode(true));

      /*Add custom component magic*/
      const component = this;
      const args = option?.xDataFactoryArgs ?? [];
      const xData = option?.xDataFactory ? option.xDataFactory(...args) : {};
      this.data = Alpine.reactive({
        $val: this.value,
        $component: component,
        $$: (arg: string) => this.root.querySelectorAll(arg),
        $: (arg: string) => this.root.querySelector(arg),
        $attr: (arg: string) => this.attributes.getNamedItem(arg),
        $slot: (arg: string) => this.querySelector(`*[slot = ${arg}]`),
        $$slot: (...args: string[]) => queryForSlot(this, ...args),
        $emit: (name: string, detail: any) =>
          dispatchCustomEvent(this, name, detail),
        $emitWindow: (name: string, detail: any) =>
          dispatchCustomEvent(window, name, detail),
        ...xData,
      });

      /* Get update from the $val magic. */
      Alpine.effect(() => {
        if (this.data.$val !== this._value) {
          this._value = this.data.$val;
          this.dispatchEvent(new Event("input"));
        }
      });

      Alpine.addScopeToNode(this.root as Element, this.data);
      Alpine.initTree(this.root as HTMLElement);

      /*Initialize Alpine data object */
      if (
        Object.hasOwn(this.data, "init") &&
        typeof this.data.init == "function"
      ) {
        this.data.init();
      }
    }
    disconnectedCallback() {
      option?.onUnmount?.bind(this)();
      console.log("Custom element removed from page.");
    }
  }

  customElements.define(name, CustomElement);
}

export interface AlpineWebComponent extends HTMLElement {
  root: ShadowRoot | Element;
  data: {
    $val: any;
    $component: HTMLElement;
    $$: (arg: string) => HTMLElement;
    $: (arg: string) => HTMLElement;
    $emit: (name: string, detail: any) => boolean;
    $emitWindow: (name: string, detail: any) => boolean;
    [key: string]: any;
  };
}
