(function(){
"use strict";
const groups=Array.isArray(window.EL_GRECO_MENU_DATA)?window.EL_GRECO_MENU_DATA:[];
const list=document.getElementById("catalogue-results");
const categorySelect=document.getElementById("catalogue-category");
const searchInput=document.getElementById("catalogue-search");
const count=document.getElementById("catalogue-count");
const empty=document.getElementById("catalogue-empty");
const notices=document.getElementById("catalogue-notices");
const buttons=[...document.querySelectorAll("[data-menu-view]")];
if(!list||!categorySelect||!searchInput||!count||!groups.length)return;
let view="regular";
function text(tag,className,value){
  const el=document.createElement(tag);
  if(className)el.className=className;
  el.textContent=value;
  return el;
}
function norm(str){
  return String(str||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("de").replace(/ß/g,"ss");
}
function entriesForView(){return groups.filter(g=>g.lunch===(view==="lunch"));}
function fillCategory(){
  const previous=categorySelect.value;
  categorySelect.replaceChildren(new Option("Alle Kategorien","all"));
  for(const g of entriesForView())categorySelect.add(new Option(g.title.replace(/^Mittagskarte · /,""),g.id));
  if([...categorySelect.options].some(o=>o.value===previous))categorySelect.value=previous; else categorySelect.value="all";
}
function draw(){
  const sel=categorySelect.value||"all";
  const term=norm(searchInput.value.trim());
  const fragment=document.createDocumentFragment();
  let total=0;
  const all=entriesForView();
  for(const group of all){
    if(sel!=="all"&&sel!==group.id)continue;
    const visible=group.entries.filter(d=>!term||norm([d.number,d.name,d.description,group.title].join(" ")).includes(term));
    if(!visible.length)continue;
    total+=visible.length;
    const section=text("section","full-menu-group","");
    section.setAttribute("aria-label",group.title);
    const heading=text("h3","full-menu-heading",group.title.replace(/^Mittagskarte · /,""));
    const totalGroup=text("span","full-menu-group-count",visible.length+" "+(visible.length===1?"Position":"Positionen"));
    const headingRow=text("div","full-menu-heading-row","");
    headingRow.append(heading,totalGroup);
    section.append(headingRow);
    const table=text("div","full-menu-grid","");
    for(const d of visible){
      const article=text("article","full-menu-dish","");
      const num=text("span","full-menu-number",d.number.startsWith("M")||d.number.startsWith("E")?"—":"Nr. "+d.number);
      const textCol=text("div","full-menu-copy","");
      textCol.append(text("h4","full-menu-name",d.name));
      if(d.description)textCol.append(text("p","full-menu-description",d.description));
      const price=text("strong","full-menu-price",d.price+" €");
      article.append(num,textCol,price);
      table.append(article);
    }
    section.append(table);fragment.append(section);
  }
  list.replaceChildren(fragment);
  empty.hidden=total!==0;
  count.textContent=total+" "+(total===1?"Position":"Positionen")+" angezeigt";
  if(notices){
    notices.textContent=view==="lunch"?"Mittagskarte: laut Vorlage Montag bis Freitag (außer an Feiertagen). Preise und Verfügbarkeit bitte vor dem Besuch bestätigen.":"Reguläre Speisekarte: Gerichte und Preise gemäß den zur Verfügung gestellten Screenshots der Restaurantwebsite. Änderungen vorbehalten.";
  }
}
function switchView(next){
  view=next==="lunch"?"lunch":"regular";
  buttons.forEach(b=>{const active=b.dataset.menuView===view;b.setAttribute("aria-selected",String(active));b.classList.toggle("is-active",active);b.tabIndex=active?0:-1;});
  categorySelect.value="all";fillCategory();draw();
}
buttons.forEach(btn=>btn.addEventListener("click",()=>switchView(btn.dataset.menuView)));
categorySelect.addEventListener("change",draw);
searchInput.addEventListener("input",draw);
const clear=document.getElementById("catalogue-clear");
if(clear)clear.addEventListener("click",()=>{searchInput.value="";categorySelect.value="all";draw();searchInput.focus();});
switchView("regular");
})();