// This function makes the video fit in the window when it loads or the window is resized. It basically switches between "Fit Height" and "Fit Width" modes based on the relative aspect ratios of the window and the video.

function fixvideo()
{

 // This determines the relative aspect ratios to do the appropriate fitting
 
 if (window.innerHeight/window.innerWidth>document.getElementById('thevideo').videoHeight/document.getElementById('thevideo').videoWidth)
 {
 
  // Specifying per pixel values is necessary because HTML doesn't have a convenient or reliable vertical alignment feature
 
  document.getElementById('thevideo').style.width=window.innerWidth + "px";
  document.getElementById('thevideo').style.height=document.getElementById('thevideo').videoHeight*window.innerWidth/document.getElementById('thevideo').videoWidth + "px";
  
  // This actually does the vertical alignment, by putting in an appropriate size spacing above the video
  
   document.getElementById('thevideo').style.marginTop=((window.innerHeight-parseInt(document.getElementById('thevideo').style.height))/2) + "px";
   
   // This is a bottom margin for when the video loads on the main page
   
   document.getElementById('thevideo').style.marginBottom=document.getElementById('thevideo').style.marginTop;

 } 
 else
 {
  document.getElementById('thevideo').style.width="auto";
  document.getElementById('thevideo').style.height="100%";
  document.getElementById('thevideo').style.marginTop=0;
 } 

}
