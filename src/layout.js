export const defaults={text:'慢慢寫字，好好生活。\n把日子寫成喜歡的樣子。',title:'每日練字',language:'zh',font:'Noto Serif TC',grid:'mi',mode:'trace',paper:'a4',orientation:'portrait',direction:'horizontal',fontSize:13,letterSpacing:0,lineHeight:18,margin:16,gap:4,charRepeat:1,lineRepeat:1,fillPage:false,opacity:30,lineWidth:0.22,slantAngle:55,gridColor:'#a6b6cc',inkColor:'#334155',paperColor:'#ffffff',showTitle:true,showDate:true,showPage:true,blankRows:0};
export const isRuled=s=>['ruled','slant','lined'].includes(s.grid);
export const isLine=s=>isRuled(s)||(s.language==='en'&&['dots','none'].includes(s.grid));
export function dimensions(s){let d=s.paper==='a5'?[148,210]:s.paper==='letter'?[215.9,279.4]:[210,297];return s.orientation==='landscape'?d.reverse():d;}
export function migrateSettings(input){const s={...input};if('repeat' in s){const key=isLine(s)?'lineRepeat':'charRepeat';if(!(key in s))s[key]=s.repeat;delete s.repeat;}if('fontScale' in s){if(!('fontSize' in s))s.fontSize=Math.round((s.size??18)*s.fontScale/50)/2;delete s.fontScale;}delete s.size;if(typeof s.fontSize==='number'&&Number.isFinite(s.fontSize))s.fontSize=Math.round(s.fontSize*2)/2;return s;}
export function cellSize(s){return s.fontSize*18/13;}
export function graphemes(text){return Array.from(new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(text),x=>x.segment);}
export function repeatCharacters(text,count){return graphemes(text).map(c=>/\s/u.test(c)?c:c.repeat(count)).join('');}
export function layout(input){const s={...defaults,...migrateSettings(input)};const [w,h]=dimensions(s),top=s.margin+(s.showTitle||s.showDate?16:0),bottom=s.margin+(s.showPage?8:0);const line=isLine(s),box=cellSize(s),cellHeight=line?s.lineHeight:box,colPitch=box+s.letterSpacing,rowPitch=cellHeight+s.gap;const cols=Math.max(1,Math.floor((w-2*s.margin+s.letterSpacing)/colPitch)),rows=Math.max(1,Math.floor((h-top-bottom+s.gap)/rowPitch));const vertical=s.direction==='vertical'&&!isLine(s);const capacity=line?rows:cols*rows;let units=[];
const across=vertical?rows:cols;
for(const sourceLine of s.text.split('\n')){
 const block=[];
 if(isLine(s)){block.push(repeatCharacters(sourceLine,s.charRepeat));if(s.mode==='copy')block.push('');}
 else if(s.mode==='copy'){
  for(const char of graphemes(sourceLine)){
   for(let n=0;n<s.charRepeat;n++)block.push(char);
   while(block.length%across)block.push('');
  }
  if(!block.length)block.push(...Array(across).fill(''));
 }else{
  block.push(...graphemes(repeatCharacters(sourceLine,s.charRepeat)));
  if(!block.length)block.push(...Array(across).fill(''));
  while(block.length%across)block.push('');
 }
 for(let n=0;n<s.lineRepeat;n++)units.push(...block);
 for(let n=0;n<s.blankRows;n++)units.push(...Array(isLine(s)?1:across).fill(''));
}
if(s.fillPage&&units.length){const pattern=units.slice(),target=Math.ceil(units.length/capacity)*capacity;while(units.length<target)units.push(pattern[units.length%pattern.length]);}
const pages=Math.max(1,Math.ceil(units.length/capacity));return{w,h,top,cols,rows,capacity,units,pages,vertical,cellHeight,cellSize:box,colPitch,rowPitch};}
export function cellPosition(i,l,s){return l.vertical?{x:s.margin+(l.cols-1-Math.floor(i/l.rows))*l.colPitch,y:l.top+(i%l.rows)*l.rowPitch}:{x:s.margin+(i%l.cols)*l.colPitch,y:l.top+Math.floor(i/l.cols)*l.rowPitch};}
