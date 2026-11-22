import sys, subprocess, numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont
SRC = sys.argv[1]; F = "../tempo/fonts/"
def frame(t):
    b = subprocess.run(["ffmpeg","-v","error","-ss",str(t),"-i",SRC,"-frames:v","1","-f","rawvideo","-pix_fmt","gray","-"],capture_output=True).stdout
    return np.frombuffer(b,np.uint8).reshape(1024,576)
def tmpl(s, font, size):
    f = ImageFont.truetype(F+font, size); w = int(f.getlength(s))+6; im = Image.new("L",(w,size+12),0); ImageDraw.Draw(im).text((3,size+4),s,font=f,fill=255,anchor="ls"); return np.asarray(im)
def best(g, s, font, sizes, box):
    x0,y0,x1,y1 = box; roi = g[y0:y1,x0:x1].astype(np.float32); res=[]
    for sz in sizes:
        tp = tmpl(s,font,sz).astype(np.float32)
        if tp.shape[0]>roi.shape[0] or tp.shape[1]>roi.shape[1]: continue
        r = cv2.matchTemplate(roi,tp,cv2.TM_CCOEFF_NORMED); _,mx,_,loc = cv2.minMaxLoc(r); res.append((mx,sz,loc[0]+x0+3,loc[1]+y0+sz+4))
    return max(res)
for t, s, font, sizes, box in [(5.5,"50 km/h","InstrumentSerif-Regular.ttf",range(40,60),(0,420,380,530)),(41.5,"1.22%","InstrumentSerif-Regular.ttf",range(40,60),(0,420,380,530)),(5.5,"city speed limit.","InstrumentSerif-Regular.ttf",range(22,36),(0,640,576,760)),(5.5,"5 seconds:","InstrumentSerif-Regular.ttf",range(22,36),(0,620,576,740)),(41.5,"more than the whole trip so far.","InstrumentSerif-Regular.ttf",range(22,36),(0,640,576,760))]:
    print(t, s, best(frame(t), s, font, sizes, box))
g = frame(5.5); vis = cv2.cvtColor(g, cv2.COLOR_GRAY2BGR)
for s,sz,x,y in [("50 km/h",46,31,477),("5 seconds:",29,238,692),("city speed limit.",29,211,725)]:
    tp = tmpl(s,"InstrumentSerif-Regular.ttf",sz); h,w = tp.shape; y0 = y-sz-4; x0 = x-3
    m = tp>100; vis[y0:y0+h, x0:x0+w][m] = (0,0,255)
cv2.imwrite("build/calib.png", vis[400:760, 0:576])
