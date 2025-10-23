
(function(){
  function current(){
    return (location.hash.startsWith('#/')) ? location.hash.slice(2) : 'home';
  }
  window.addEventListener('hashchange', ()=>{
    const r = current();
    if(App.pages[r]) App.navigate(r);
    else App.renderNotFound(r);
  });
})();
