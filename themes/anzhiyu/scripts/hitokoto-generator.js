hexo.extend.generator.register('hitokoto-data', function(locals) {  
  const hitokotoData = locals.data.hitokoto;  
    
  if (!hitokotoData || !hitokotoData.hitokoto_list) {  
    return;  
  }  
    
  const jsContent = `  
// 自动生成的一言数据文件  
window.hitokotoData = ${JSON.stringify(hitokotoData.hitokoto_list, null, 2)};  
  
var hitokotoRefreshNum = 1;  
var displayedHitokoto = []; // 跟踪已显示的一言索引  
  
function updateRandomHitokoto() {  
  if (!window.hitokotoData || window.hitokotoData.length === 0) return;  
    
  let randomIndex;  
  let selectedHitokoto;  
    
  // 如果所有一言都已显示过，重置数组  
  if (displayedHitokoto.length >= window.hitokotoData.length) {  
    displayedHitokoto = [];  
    console.info("所有一言已显示完毕，重新开始循环");  
  }  
    
  // 找到未显示过的一言  
  do {  
    randomIndex = Math.floor(Math.random() * window.hitokotoData.length);  
  } while (displayedHitokoto.includes(randomIndex));  
    
  selectedHitokoto = window.hitokotoData[randomIndex];  
  displayedHitokoto.push(randomIndex);  
    
  const titleEl = document.getElementById('banner-title');  
  const subtitleEl = document.getElementById('banner-subtitle');  
    
  if (titleEl && subtitleEl) {  
    titleEl.textContent = selectedHitokoto.title;  
    subtitleEl.textContent = selectedHitokoto.subTitle;  
  }  
    
  console.info("已显示一言：", displayedHitokoto.length + "/" + window.hitokotoData.length, "本次显示：", selectedHitokoto.title);  
}  
  
window.refreshHitokoto = function() {  
  var hitokotoRefreshBtn = document.getElementById("hitokoto-refresh-btn");  
  if(hitokotoRefreshBtn) {  
    hitokotoRefreshBtn.style.opacity = "0.2";  
    hitokotoRefreshBtn.style.transitionDuration = "0.3s";  
    hitokotoRefreshBtn.style.transform = "rotate(" + 360 * hitokotoRefreshNum++ + "deg)";  
  }  
    
  updateRandomHitokoto();  
    
  if(hitokotoRefreshBtn) {  
    setTimeout(()=>{  
      hitokotoRefreshBtn.style.opacity = "1";  
    }, 300);  
  }  
};  
  
// 页面加载时执行  
document.addEventListener('DOMContentLoaded', updateRandomHitokoto);  
`;  
  
  return {  
    path: 'js/hitokoto-data.js',  
    data: jsContent  
  };  
});