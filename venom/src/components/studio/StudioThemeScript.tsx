/**
 * Anti-FOUC pro téma editoru Studia.
 *
 * CSS default v design-tokens.css je tmavé violet téma; světlé (výchozí volba)
 * se dřív aplikovalo až v useEffect po hydrataci → při každém načtení stránky
 * problikl tmavý chrome. Tenhle blokující inline skript nastaví atributy
 * `data-vs-theme` / `data-vs-style` na <html> už během parsování HTML, tedy
 * před prvním paintem.
 *
 * Logika MUSÍ zrcadlit apply-effect v StudioContext.tsx (mapování téma →
 * atributy) — při změně jednoho uprav i druhé. Custom téma dostane jen
 * atribut; dynamický <style> blok se dopočítá po mountu (async import).
 */

const THEME_INIT_JS = `(function(){try{
var valid=["light","apple","violet","silver","indigo","custom"];
var t=null;try{t=window.localStorage.getItem("venom-studio.editor-theme")}catch(e){}
if(valid.indexOf(t)<0)t="light";
var r=document.documentElement;
r.removeAttribute("data-vs-style");
if(t==="violet"){r.removeAttribute("data-vs-theme")}
else if(t==="apple"){r.setAttribute("data-vs-theme","light");r.setAttribute("data-vs-style","apple")}
else{r.setAttribute("data-vs-theme",t);if(t==="light")r.setAttribute("data-vs-style","xora")}
}catch(e){}})();`;

export function StudioThemeScript() {
  // Záměrně obyčejný <script>, ne next/script — musí běžet synchronně před
  // prvním paintem, ne až po hydrataci.
  return <script dangerouslySetInnerHTML={{ __html: THEME_INIT_JS }} />;
}
