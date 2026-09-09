import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import fancyboxConfig from "@/config/fancybox";

export { Fancybox, fancyboxConfig };

/**
 * 把 `containerSelector` 范围内的所有图片标记为同一灯箱分组并绑定 Fancybox，
 * 图片的 alt 会作为灯箱说明文字。重复调用会先解绑，安全用于 astro:page-load。
 */
export function initImageFancybox(group: string, containerSelector: string) {
  Fancybox.close();
  Fancybox.unbind(`[data-fancybox="${group}"]`);

  const imgs = document.querySelectorAll(`${containerSelector} img`);
  if (imgs.length === 0) return;

  imgs.forEach((img) => {
    img.setAttribute("data-fancybox", group);
    img.setAttribute("data-caption", img.getAttribute("alt") || "");
    img.style.cursor = "zoom-in";
  });

  Fancybox.bind(`[data-fancybox="${group}"]`, {
    ...fancyboxConfig,
  });
}
