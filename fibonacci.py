import random, pygame, sys
import time


"""ttime=raw_input("Enter time in 12 hour format:")
tmp = ttime.split(":")
hour = int(tmp[0])
minute = int(tmp[1])/5"""
def fibConvert(x):
	if x == 0:
		return [[0,0,0,0,0]]
	if x == 1:
		return [[1,0,0,0,0],[0,1,0,0,0]]
	if x == 2:
		return [[1,1,0,0,0],[0,0,1,0,0]]
	if x == 3:
		return [[1,0,1,0,0],[0,1,1,0,0],[0,0,0,1,0]]
	if x == 4:
		return [[1,1,1,0,0],[0,1,0,1,0],[1,0,0,1,0]]
	if x == 5:
		return [[1,1,0,1,0],[0,0,1,1,0],[0,0,0,0,1]]
	if x == 6:
		return [[1,0,0,0,1],[0,1,0,0,1],[0,1,1,1,0],[1,0,1,1,0]]
	if x == 7:
		return [[1,1,0,0,1],[0,0,1,0,1],[1,1,1,1,0]]
	if x == 8:
		return [[1,0,1,0,1],[0,1,1,0,1],[0,0,0,1,1]]
	if x == 9:
		return [[1,0,0,1,1],[0,1,0,1,1],[1,1,1,0,1]]
	if x == 10:
		return [[1,1,0,1,1],[0,0,1,1,1]]
	if x == 11:
		return [[0,1,1,1,1],[1,0,1,1,1]]
	if x == 12:
		return [[1,1,1,1,1]]
	
def timeConvert(hour,minute):
	fib = [0,0,0,0,0]
	hour_list = fibConvert(hour)
	minute_list = fibConvert(minute)
	h_list=hour_list[random.randint(0, len(hour_list)-1)]
	tmp_list=minute_list[random.randint(0, len(minute_list)-1)]
	m_list=[]
	for x in tmp_list:
		if x == 1:
			m_list.append(x+2)
		else:
			m_list.append(x)
	#print h_list,m_list
	i = 0
	while i < len(fib):
		fib[i] = h_list[i] + m_list[i]
		i += 1
	return fib
		

def fill_color(fib):
	pygame.init()
	global screen
	color_list = []
	col = {0:[255,255,255],1:[255,0,0],3:[0,255,0],4:[0,0,255]}
	for it in fib:
		color_list.append(col[it]) 
	pygame.draw.rect(screen,color_list[1],(250,10,50,50),0)
	pygame.draw.rect(screen,[0,0,0],(250,10,50,50),1)
	pygame.draw.rect(screen,color_list[0],(250,60,50,50),0)
	pygame.draw.rect(screen,[0,0,0],(250,60,50,50),1)
	pygame.draw.rect(screen,color_list[2],(150,10,100,100),0)
	pygame.draw.rect(screen,[0,0,0],(150,10,100,100),1)
	pygame.draw.rect(screen,color_list[3],(150,110,150,150),0)
	pygame.draw.rect(screen,[0,0,0],(150,110,150,150),1)
	pygame.draw.rect(screen,color_list[4],(300,10,250,250),0)
	pygame.draw.rect(screen,[0,0,0],(300,10,250,250),1)
	pygame.display.flip()
	"""while True:
		for event in pygame.event.get():
			if event.type==pygame.QUIT:
				sys.exit()"""


tstr = time.ctime() 
tt = tstr.split()[3]
ttime = tt.split(":")
mtest = int(ttime[1]) % 5
m = int(ttime[1]) / 5
print "start:",time.ctime()
while mtest != 0:
	time.sleep(60-int(ttime[2]))
	tstr = time.ctime() 
	tt = tstr.split()[3]
	ttime = tt.split(":")
	print ttime
	mtest = int(ttime[1]) % 5

screen=pygame.display.set_mode([640,480])
screen.fill([75,10,120])
#print timeConvert(hour,minute)

while True:
    tstr = time.ctime() 
    tt = tstr.split()[3]
    ttime = tt.split(":")
    m = int(ttime[1]) / 5	
    if int(ttime[0])%12 == 0:
	h = 12
    else:
        h = int(ttime[0])%12
    fill_color(timeConvert(h,m))
    time.sleep(300) 
