// themes/anzhiyu/scripts/hitokoto-generator.js  
hexo.extend.generator.register('hitokoto-data', function(locals) {  
  const hitokotoData = locals.data.hitokoto;  
    
  if (!hitokotoData || !hitokotoData.hitokoto_list) {  
    return;  
  }  
    
  const jsContent = `  
// 自动生成的一言数据文件  
window.hitokotoData = ${JSON.stringify(hitokotoData.hitokoto_list, null, 2)};  
  
function updateRandomHitokoto() {  
  if (!window.hitokotoData || window.hitokotoData.length === 0) return;  
    
  const randomIndex = Math.floor(Math.random() * window.hitokotoData.length);  
  const selectedHitokoto = window.hitokotoData[randomIndex];  
    
  const titleEl = document.getElementById('banner-title');  
  const subtitleEl = document.getElementById('banner-subtitle');  
    
  if (titleEl && subtitleEl) {  
    titleEl.textContent = selectedHitokoto.title;  
    subtitleEl.textContent = selectedHitokoto.subTitle;  
  }  
}  
  
// 页面加载时执行  
document.addEventListener('DOMContentLoaded', updateRandomHitokoto);  
  
// 导出刷新函数供外部调用  
window.refreshHitokoto = updateRandomHitokoto;  
`;  
  
  return {  
    path: 'js/hitokoto-data.js',  
    data: jsContent  
  };  
});