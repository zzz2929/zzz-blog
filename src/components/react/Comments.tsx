import { useEffect, useRef } from 'react';

interface CommentsProps {
  serverURL?: string;
  path: string;
}

export default function Comments({ serverURL = 'https://waline.blog.904002.xyz/', path }: CommentsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    import('@waline/client').then(({ init }) => {
      init({
        el: containerRef.current!,
        serverURL,
        path,
        dark: 'html.dark',
        lang: 'zh-CN',
        comment: true,
        pageview: true,
      });
    });

    // Apply layout fixes after Waline renders
    const applyLayout = () => {
      if (!containerRef.current) return;
      const root = containerRef.current;

      // Find the editor area - look for the textarea's parent container
      const editor = root.querySelector('textarea');
      if (!editor) return;

      // Walk up to find the form/editor wrapper
      let editorWrap = editor.parentElement;
      while (editorWrap && editorWrap.tagName !== 'FORM' && !editorWrap.classList.contains('v') && !editorWrap.querySelector('button')) {
        editorWrap = editorWrap.parentElement;
      }

      // Make the whole editor area use flex row
      const formEl = root.querySelector('form') || root.querySelector('.v');
      if (formEl) {
        (formEl as HTMLElement).style.cssText = 'display:flex;flex-direction:column;gap:12px;width:100%;';

        // Find all direct children that are input rows (login fields)
        const children = Array.from(formEl.children);
        children.forEach((child) => {
          const el = child as HTMLElement;
          // Check if this is an input row (has multiple inputs or labels)
          const inputs = el.querySelectorAll('input, label, .vinput');
          if (inputs.length >= 2) {
            el.style.cssText = 'display:flex;flex-direction:row;flex-wrap:wrap;gap:8px;width:100%;align-items:center;';
            // Make each input flex-1
            inputs.forEach((inp) => {
              (inp as HTMLElement).style.cssText += 'flex:1 1 0;min-width:120px;';
            });
          }
        });
      }

      // Make all top-level flex containers horizontal where they have stacked children
      root.querySelectorAll('div').forEach((div) => {
        const children = Array.from(div.children);
        const hasOnlyButtons = children.every(c =>
          c.tagName === 'BUTTON' || c.tagName === 'A' || c.classList?.contains('vbtn')
        );
        const hasOnlyInputs = children.every(c =>
          c.tagName === 'INPUT' || c.tagName === 'LABEL' || c.classList?.contains('vinput') || c.tagName === 'BUTTON'
        );

        // If this is a container with multiple stacked buttons or inputs, make it horizontal
        if (children.length >= 2 && (hasOnlyButtons || hasOnlyInputs) && div !== formEl) {
          const cs = getComputedStyle(div);
          if (cs.flexDirection === 'column' || cs.display === 'block') {
            div.style.cssText += 'display:flex;flex-direction:row;flex-wrap:wrap;gap:8px;align-items:center;';
          }
        }
      });

      // Make the action bar (buttons, char count) horizontal
      root.querySelectorAll('.vaction, .vctrl').forEach((el) => {
        (el as HTMLElement).style.cssText += 'display:flex;flex-direction:row;flex-wrap:wrap;gap:8px;align-items:center;width:100%;';
      });

      // Emoji picker panel
      root.querySelectorAll('.vemoji-picker, .vemoji-panel').forEach((el) => {
        (el as HTMLElement).style.cssText += 'display:flex;flex-wrap:wrap;gap:4px;width:100%;';
      });
    };

    // Run layout fixes periodically (Waline loads async)
    let attempts = 0;
    const timer = setInterval(() => {
      applyLayout();
      attempts++;
      if (attempts > 20) clearInterval(timer);
    }, 300);

    // Also apply on mutation
    const observer = new MutationObserver(() => {
      setTimeout(applyLayout, 100);
    });
    observer.observe(containerRef.current!, { childList: true, subtree: true });

    return () => {
      clearInterval(timer);
      observer.disconnect();
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [serverURL, path]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-block w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, var(--color-primary), var(--color-accent))' }} />
        <h3 className="text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>评论</h3>
      </div>
      <div ref={containerRef} />
    </div>
  );
}
