(function(){
"use strict";
const menu=Array.isArray(window.EL_GRECO_MENU_DATA)?window.EL_GRECO_MENU_DATA:[];
const mainOrder={
  vorspeisen:["meze","vorspeisen","suppen","kaese","salate"],
  hauptspeisen:["vegetarisch","grill","fisch","backofen","pfanne","spaghetti","kinder","beilagen","extras"],
  nachspeisen:[],
  mittagsgerichte:["mittagsgrill","mittagsfisch","mittagsbackofen"]
};
const sectionTitles={vorspeisen:"Vorspeisen & Salate",hauptspeisen:"Hauptspeisen",nachspeisen:"Nachspeisen",mittagsgerichte:"Mittagsgerichte"};
const items=document.getElementById("menu-items");
const subnav=document.getElementById("subcat-nav");
const heading=document.getElementById("menu-panel-heading");
const count=document.getElementById("menu-count");
const detail=document.getElementById("menu-detail");
const dessert=document.getElementById("dessert-note");
const tabs=[...document.querySelectorAll("[data-menu-tab]")];
const mobileToggle=document.getElementById("nav-toggle");
const mobileNav=document.getElementById("mobile-nav");
let active="vorspeisen",activeSub="all";
function node(tag,className,value){
 const el=document.createElement(tag);
 if(className)el.className=className;
 if(value!=null)el.textContent=String(value);
 return el;
}
function visibleGroups(){
 const ids=mainOrder[active]||[];
 return ids.map(id=>menu.find(g=>g.id===id)).filter(Boolean);
}
function render(){
 if(!items||!subnav||!heading||!count)return;
 heading.textContent=sectionTitles[active]||"Speisekarte";
 for(const tab of tabs){
   const isActive=tab.dataset.menuTab===active;
   tab.classList.toggle("is-active",isActive);
   tab.setAttribute("aria-selected",String(isActive));
   tab.tabIndex=isActive?0:-1;
 }
 const groups=visibleGroups();
 if(active==="nachspeisen"){
   subnav.replaceChildren();
   items.replaceChildren();
   dessert.hidden=false;
   count.textContent="Auf Anfrage";
   detail.textContent="Desserts sind auf der bereitgestellten Speisekarte nicht aufgeführt. Bitte fragen Sie das Restaurant nach dem aktuellen Angebot.";
   return;
 }
 dessert.hidden=true;
 const subFrag=document.createDocumentFragment();
 function makeSub(key,label){
   const b=node("button","subcat-button"+(activeSub===key?" is-active":""),label);
   b.type="button";b.dataset.subcat=key;b.setAttribute("aria-pressed",String(activeSub===key));
   b.addEventListener("click",function(){activeSub=key;render()});
   return b;
 }
 subFrag.append(makeSub("all","Alle anzeigen"));
 for(const group of groups){
   subFrag.append(makeSub(group.id,group.title.replace("Mittagskarte · ","")));
 }
 subnav.replaceChildren(subFrag);
 const frag=document.createDocumentFragment();
 let total=0;
 for(const group of groups){
   if(activeSub!=="all"&&activeSub!==group.id)continue;
   total+=group.entries.length;
   frag.append(node("h4","group-title",group.title.replace("Mittagskarte · ","")));
   const grid=node("div","group-dishes");
   for(const d of group.entries){
     const card=node("article","menu-dish");
     const number=node("span","menu-num",/^\d+$/.test(d.number)?"Nr. "+d.number:"");
     const desc=node("div","menu-dish-text");
     desc.append(node("h4","",d.name));
     if(d.description)desc.append(node("p","",d.description));
     card.append(number,desc,node("span","menu-price",d.price+" €"));
     grid.append(card);
   }
   frag.append(grid);
 }
 items.replaceChildren(frag);
 count.textContent=total+" "+(total===1?"Position":"Positionen");
 detail.textContent=active==="mittagsgerichte"?
 "Mittagskarte laut bereitgestellter Vorlage: Montag bis Freitag, ausgenommen Feiertage. Verfügbarkeit und Preise bitte telefonisch bestätigen.":
 "Reguläre Speisekarte: Preise gemäß den bereitgestellten Bildern der Restaurantwebsite. Änderungen vorbehalten.";
}
function setMenu(group,subcategory){
 if(!Object.prototype.hasOwnProperty.call(mainOrder,group))return;
 active=group;activeSub=subcategory||"all";
 render();
}
tabs.forEach((tab,index)=>{
 tab.addEventListener("click",()=>setMenu(tab.dataset.menuTab));
 tab.addEventListener("keydown",e=>{
   if(!["ArrowLeft","ArrowRight","Home","End"].includes(e.key))return;
   e.preventDefault();
   const target=e.key==="Home"?0:e.key==="End"?tabs.length-1:(index+(e.key==="ArrowRight"?1:-1)+tabs.length)%tabs.length;
   tabs[target].focus();setMenu(tabs[target].dataset.menuTab);
 });
});
const cardRouting={
 vorspeisen:["vorspeisen","vorspeisen"],
 salate:["vorspeisen","salate"],
 hauptspeisen:["hauptspeisen","grill"],
 fisch:["hauptspeisen","fisch"],
 backofen:["hauptspeisen","backofen"],
 kinder:["hauptspeisen","kinder"],
 nachspeisen:["nachspeisen","all"],
 mittagsgerichte:["mittagsgerichte","all"]
};
document.querySelectorAll("[data-pick]").forEach(card=>card.addEventListener("click",()=>{
 const key=card.dataset.pick;
 if(cardRouting[key])setMenu(...cardRouting[key]);
}));
function closeMobile(){
 if(!mobileNav||!mobileToggle)return;
 mobileNav.hidden=true;
 mobileToggle.setAttribute("aria-expanded","false");
 mobileToggle.setAttribute("aria-label","Menü öffnen");
 document.body.classList.remove("menu-open");
}
if(mobileNav&&mobileToggle){
 mobileToggle.addEventListener("click",()=>{
  const willOpen=mobileNav.hidden;
  mobileNav.hidden=!willOpen;
  mobileToggle.setAttribute("aria-expanded",String(willOpen));
  mobileToggle.setAttribute("aria-label",willOpen?"Menü schließen":"Menü öffnen");
  document.body.classList.toggle("menu-open",willOpen);
 });
 mobileNav.querySelectorAll("a").forEach(a=>a.addEventListener("click",closeMobile));
 document.addEventListener("keydown",e=>{if(e.key==="Escape")closeMobile()});
 document.addEventListener("click",e=>{if(!mobileNav.hidden&&!mobileNav.contains(e.target)&&!mobileToggle.contains(e.target))closeMobile()});
 window.addEventListener("resize",()=>{if(window.innerWidth>990)closeMobile()});
}
document.querySelectorAll('[data-nav-menu="lunch"]').forEach(link=>link.addEventListener("click",e=>{
 e.preventDefault();
 setMenu("mittagsgerichte");
 closeMobile();
 document.getElementById("vollstaendige-karte")?.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth",block:"start"});
}));
const dialog=document.getElementById("notice-dialog");
if(dialog&&typeof dialog.showModal==="function"){
 const open=document.getElementById("notice-button");
 const close=document.getElementById("notice-close");
 open?.addEventListener("click",()=>dialog.showModal());
 close?.addEventListener("click",()=>dialog.close());
 dialog.addEventListener("click",e=>{if(e.target===dialog)dialog.close()});
}
const year=document.getElementById("year");if(year)year.textContent=String(new Date().getFullYear());
render();
})();