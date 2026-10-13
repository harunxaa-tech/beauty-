(function(){
"use strict";
const menu=Array.isArray(window.EL_GRECO_MENU_DATA)?window.EL_GRECO_MENU_DATA:[];
const mainOrder={
  vorspeisen:["meze","vorspeisen","suppen","kaese","salate"],
  hauptspeisen:["vegetarisch","grill","fisch","backofen","pfanne","spaghetti","kinder","beilagen","extras"],
  mittagsgerichte:["mittagsgrill","mittagsfisch","mittagsbackofen"]
};
const sectionTitles={vorspeisen:"Vorspeisen & Salate",hauptspeisen:"Hauptspeisen",mittagsgerichte:"Mittagsgerichte"};
const items=document.getElementById("menu-items");
const subnav=document.getElementById("subcat-nav");
const heading=document.getElementById("menu-panel-heading");
const count=document.getElementById("menu-count");
const detail=document.getElementById("menu-detail");
const lunchHours=document.getElementById("lunch-hours");
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
 const panelSubtitle=document.getElementById("menu-panel-description");
 if(panelSubtitle)panelSubtitle.textContent={
   vorspeisen:"Kleine Köstlichkeiten und mediterrane Frische zum gemeinsamen Genießen.",
   hauptspeisen:"Die beliebtesten Geschmacksrichtungen Griechenlands – vom Grill bis aus dem Ofen.",
   mittagsgerichte:"Montag bis Freitag von 11:30 bis 14:30 Uhr – ausgenommen Feiertage."
 }[active]||"";
 for(const tab of tabs){
   const isActive=tab.dataset.menuTab===active;
   tab.classList.toggle("is-active",isActive);
   tab.setAttribute("aria-selected",String(isActive));
   tab.tabIndex=isActive?0:-1;
 }
 const groups=visibleGroups();
 if(lunchHours)lunchHours.hidden=active!=="mittagsgerichte";
 const subFrag=document.createDocumentFragment();
 function makeSub(key,label,qty){
   const b=node("button","subcat-button"+(activeSub===key?" is-active":""),null);
   b.type="button";
   b.dataset.subcat=key;
   b.setAttribute("aria-pressed",String(activeSub===key));
   b.append(node("span","subcat-label",label));
   if(Number.isFinite(qty))b.append(node("span","subcat-qty",String(qty)));
   b.addEventListener("click",function(){activeSub=key;render()});
   return b;
 }
 subFrag.append(makeSub("all","Alle anzeigen",groups.reduce((sum,g)=>sum+g.entries.length,0)));
 for(const group of groups){
   subFrag.append(makeSub(group.id,group.title.replace("Mittagskarte · ",""),group.entries.length));
 }
 const selectWrap=node("div","subcat-mobile-chooser");
 const selectLabel=node("label","subcat-mobile-label","Speisen auswählen");
 selectLabel.setAttribute("for","subcat-mobile-select");
 const select=node("select","subcat-mobile-select");
 select.id="subcat-mobile-select";
 select.setAttribute("aria-label","Unterkategorie der Speisekarte auswählen");
 function addOption(key,title,quantity){
   const opt=node("option","",title+" · "+quantity+" Gerichte");
   opt.value=key;
   if(activeSub===key)opt.selected=true;
   select.append(opt);
 }
 addOption("all","Alle Kategorien",groups.reduce((sum,g)=>sum+g.entries.length,0));
 for(const group of groups)addOption(group.id,group.title.replace("Mittagskarte · ",""),group.entries.length);
 select.value=activeSub;
 select.addEventListener("change",function(){activeSub=select.value;render()});
 selectWrap.append(selectLabel,select);
 subnav.replaceChildren(selectWrap,subFrag);
 const frag=document.createDocumentFragment();
 let total=0;
 for(const group of groups){
   if(activeSub!=="all"&&activeSub!==group.id)continue;
   total+=group.entries.length;
   const groupSection=node("section","menu-group");
   groupSection.setAttribute("aria-label",group.title);
   const header=node("div","group-header");
   const titleWrap=node("div","group-heading-text");
   titleWrap.append(node("span","group-kicker","SPEZIALITÄTEN · "+String(groups.indexOf(group)+1).padStart(2,"0")));
   titleWrap.append(node("h4","group-title",group.title.replace("Mittagskarte · ","")));
   const ornament=node("span","group-decoration","✧");
   ornament.setAttribute("aria-hidden","true");
   header.append(titleWrap,ornament);
   groupSection.append(header);
   const grid=node("div","group-dishes");
   for(const d of group.entries){
     const card=node("article","menu-dish");
     const top=node("div","dish-meta");
     const number=node("span","menu-num",/^\d+$/.test(d.number)?"NR. "+d.number:"EL GRECO");
     const price=node("strong","menu-price",d.price+" €");
     top.append(number,price);
     const desc=node("div","menu-dish-text");
     desc.append(node("h4","",d.name));
     if(d.description)desc.append(node("p","",d.description));
     card.append(top,desc);
     grid.append(card);
   }
   groupSection.append(grid);
   frag.append(groupSection);
 }
 items.replaceChildren(frag);
 count.textContent=total+" "+(total===1?"Gericht":"Gerichte");
 detail.textContent=active==="mittagsgerichte"?
 "Mittagskarte: Montag bis Freitag von 11:30 bis 14:30 Uhr, ausgenommen Feiertage. Zeitangabe aus den veröffentlichten Mittagsöffnungszeiten abgeleitet; bitte beim Restaurant vor Veröffentlichung bestätigen.":
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
// Original restaurant photographs: full-size view with native dialog, no dependencies.
const galleryDialog=document.getElementById("gallery-lightbox");
const galleryDialogImage=document.getElementById("gallery-lightbox-image");
const galleryDialogTitle=document.getElementById("gallery-lightbox-title");
const galleryClose=document.getElementById("gallery-lightbox-close");
if(galleryDialog&&galleryDialogImage&&galleryDialogTitle&&galleryClose&&typeof galleryDialog.showModal==="function"){
 document.querySelectorAll("[data-gallery-full]").forEach(function(tile){
   tile.addEventListener("click",function(){
     const source=tile.getAttribute("data-gallery-full");
     if(!source||!source.startsWith("assets/elgreco-"))return;
     const image=tile.querySelector("img");
     galleryDialogImage.src=source;
     galleryDialogImage.alt=image?.alt||"Originalaufnahme El Greco";
     galleryDialogTitle.textContent=tile.getAttribute("data-gallery-title")||"El Greco Neubiberg";
     galleryDialog.showModal();
   });
 });
 galleryClose.addEventListener("click",()=>galleryDialog.close());
 galleryDialog.addEventListener("click",function(e){if(e.target===galleryDialog)galleryDialog.close()});
 galleryDialog.addEventListener("close",function(){galleryDialogImage.removeAttribute("src")});
}
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