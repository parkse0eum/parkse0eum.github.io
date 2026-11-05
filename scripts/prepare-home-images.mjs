// Run when home artwork changes. Original source images are preserved.
import sharp from 'sharp';
import {mkdir} from 'node:fs/promises';
const root=process.cwd()+'/'; await mkdir(root+'public/images/home',{recursive:true});
const entries={about:'public/images/book/about.png',outside:'public/images/book/outside.png',writing:'public/images/book/writing.png',music:'public/images/book/music.png',contact:'public/images/book/contact.png',works:'src/assets/library/book/works.png',exhibition:'src/assets/library/projects/two-person-exhibition-poster.jpg',chamomile:'src/assets/library/icons/image-01.png',dream:'src/assets/library/icons/image-02.png',to:'public/images/works/to-book-corrected.png',blue:'public/images/works/blue-or-not.png'};
for(const [name,file] of Object.entries(entries))await sharp(root+file).resize({width:640,height:800,fit:'inside',withoutEnlargement:true}).webp({quality:83,alphaQuality:100}).toFile(root+'public/images/home/'+name+'.webp');
await sharp(root+'public/images/book/background.jpg').resize({width:1200,withoutEnlargement:true}).webp({quality:75}).toFile(root+'public/images/home/background.webp');
