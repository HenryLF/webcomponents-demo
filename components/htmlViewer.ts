import { WebComponentFactory } from "../lib/WebComponentFactory";

const html = `
<link rel="stylesheet" href="style.css">
<section class="grid grid-cols-3" >
    <div class="col-span-2 p-small">
        <div id="code" class="size-full code" ></div>
    </div>
    <div class="flex items-center justify-center">
        <div id="content">
            <slot name="content"></slot>
        </div>
    </div>
</section>
`;

WebComponentFactory("html-viewer", html, {
  xDataFactory: () => ({
    init() {
      const slots = this.$$slot("content");
      if (!slots) return "";
      console.log(this.$("#code"));
      this.$("#code").textContent = slots.reduce(
        (html: string, slot: HTMLElement) => (html += `${slot.outerHTML}`),
        ""
      );
    },
  }),
});
