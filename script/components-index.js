function loadScript(src, integrity = '', crossorigin = '') {
  return new Promise((resolve, reject) => {
     const s = document.createElement('script');
     s.src = src;
     if (integrity) s.integrity = integrity;
     if (crossorigin) {
        s.crossOrigin = crossorigin;
        s.referrerPolicy = 'no-referrer';
     }
     s.onload = resolve;
     s.onerror = reject;
     document.head.appendChild(s);
  });
}

// --------------------------------------------------------------------------------------------------------------

(async () => {
  await loadScript('https://cdn.jsdelivr.net/npm/dompurify@3.2.5/dist/purify.min.js');
  await loadScript('https://cdn.jsdelivr.net/npm/marked/marked.min.js');
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js',
     'sha512-7Z9J3l1+EYfeaPKcGXu3MS/7T+w19WtKQY/n+xzmw4hZhJ9tyYmcUS+4QqAlzhicE5LAfMQSF3iFTK9bQdTxXg==',
     'anonymous'
  );
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-python.min.js',
     'sha512-AKaNmg8COK0zEbjTdMHJAPJ0z6VeNqvRvH4/d5M4sHJbQQUToMBtodq4HaV4fa+WV2UTfoperElm66c9/8cKmQ==',
     'anonymous'
  );

})();