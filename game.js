// server connectivity

// CHANGE LATER IF SWITCHING SERVER
const BASE_SERVER_URL = "http://ragehoot.ydns.eu";

let globalChannel;
let myClientId;
let myChannel;
let gameRoomChannel;

const myNickname = localStorage.getItem("nickname");
const roomCode = localStorage.getItem("roomCode");

// connect to Ably
const realtime = Ably.Realtime(
{
  authUrl: BASE_SERVER_URL + "/auth",
});

realtime.connection.once("connected", () => 
{
  myClientId = realtime.auth.clientId;
  //gameRoom = realtime.channels.get("game-room");
  //myChannel = realtime.channels.get("clientChannel-" + myClientId);
  gameRoomChannel = realtime.channels.get(roomCode + ":primary");
  gameRoomChannel.presence.enter({nickname: myNickname});


  // wait for game to start
  gameRoomChannel.subscribe("start", (msg) => 
  {
    // do start code or whatever
  });
});


// game drawing

const width = screen.availWidth;
const height = screen.availHeight;

function setup() 
{
  createCanvas(width, height);
}


let timer = 0;
let angle = 0;
let angle2 = 0;

let random_randnum = Math.floor(Math.random()*2)+1 // returns num from 1 to 2

let projectiles_main_arr = [];

let arrcoloradd = [0,0,0];
let arrcolorincr = [Math.random()*5,Math.random()*5,Math.random()*5];

const speed = Math.random()*3;
const speed2 = Math.random()/5;
const timerMod = 1

const angleAdd = Math.random()/3;
const angle2Add = Math.random()/3;

const downPressedKeys = new Set();
const downPressedMouse = new Set();

// window.addEventListener("resize", function (event) {
//   if (event.defaultPrevented) {
//     return; // Do nothing if the event was already processed
//   }

//   width = screen.availWidth;
//   height = screen.availHeight;

//   function setup() {
//     createCanvas(width, height);
//   }
// }
// )


/**all event keys with length 1 get converted to lowercase*/ 
window.addEventListener("keydown", function (event) 
{
  if (event.defaultPrevented) 
  {
    return;
  }
  
  let temp_str = event.key;
  if (temp_str.length == 1) 
  {
    temp_str = temp_str.toLowerCase();
  }
  
    downPressedKeys.add(temp_str);
});

/**all event keys with length 1 get converted to lowercase*/ 
window.addEventListener("keyup", function (event) 
{
  if (event.defaultPrevented) 
  {
    return;
  }

  let temp_str = event.key;
  if (temp_str.length==1) 
  {
    temp_str = temp_str.toLowerCase();
  }

  downPressedKeys.delete(temp_str);
});

window.addEventListener("mousedown", function (event) 
{
  if (event.defaultPrevented) 
  {
    return;
  }
    downPressedMouse.add(event.key);
});

window.addEventListener("mouseup", function (event) 
{
  if (event.defaultPrevented) 
  {
    return;
  }
  downPressedMouse.delete(event.key);
});

class Projectile {
  constructor(diameter,color,pos_x,pos_y,vel_x,vel_y,acc_x = 0,acc_y = 0) 
  {
    this.diameter = diameter;
    this.color = color;

    this.color_outline = [color[0]/1.1,color[1]/1.1,color[2]/1.1];

    this.pos_x = pos_x;
    this.pos_y = pos_y;

    this.vel_x = vel_x;
    this.vel_y = vel_y;

    this.acc_x = acc_x;
    this.acc_y = acc_y;

  }
  draw () 
  {
    fill(this.color);
    stroke(this.color_outline);
    circle(this.pos_x,this.pos_y,this.diameter);
  }

  move() 
  {
    this.pos_x += this.vel_x;
    this.pos_y += this.vel_y;

    this.vel_x += this.acc_x;
    this.vel_y += this.acc_y;
  }

  update(should_draw = true,should_move = true) 
  {
    if (should_draw) 
    {
      this.draw();
    }
    if (should_move) 
    {
      this.move();
    }
  }

  /**returns true if should delete projectile, false if should keep projectile */
  should_destroy(forgiving_x = 0,forgiving_y = 0) 
  {
    if (this.pos_x-this.diameter/2>width+forgiving_x) 
    {
      return true;
    }
    if (this.pos_x+this.diameter/2<-forgiving_x) 
    {
      return true;
    }
    if (this.pos_y-this.diameter/2>height+forgiving_y) 
    {
      return true;
    }
    if (this.pos_y+this.diameter/2<-forgiving_y) 
    {
      return true;
    }         
    return false;
  }
  
  /**make sure to set arr_proj = update_list(arr_proj) */
  static update_list(proj_list,should_collide = true,forgiving_x = 0, forgiving_y = 0) 
  {
    for (let i = 0; i < proj_list.length; i++) 
    {
      (proj_list[i]).update();
    }
    let proj_list2 = [];

    for (let i = 0; i < proj_list.length; i++) 
    {
      if (!(proj_list[i]).should_destroy(forgiving_x,forgiving_y)) 
      {
        proj_list2.push(proj_list[i]);
      }
    }
    

    if (should_collide) 
    {
      player.collision(proj_list2);
    } 

    return proj_list2
  }
}




function distance(x1,y1,x2,y2) 
{
 return sqrt((x2-x1)**2+(y2-y1)**2);
}


class Player 
{
  /**player color is just for the trail*/
  constructor(pos_x,pos_y,diameter,color,speed,speed_slowed,speed_fast,total_health,immunity_frames) 
  {
    this.pos_x = pos_x;
    this.pos_y = pos_y;
    this.diameter = diameter;

    this.color = color;
    this.color_outline = [color[0]/2,color[1]/2,color[2]/2];
    this.color_trail_pos_x = [];
    this.color_trail_pos_y = [];
    this.color_trail_num = 9;

    for (let i = 0; i < this.color_trail_num; i++) 
    {
      this.color_trail_pos_x.push(pos_x);
      this.color_trail_pos_y.push(pos_y);
    }
    
    this.speed = speed;
    this.speed_fast = speed_fast;
    this.speed_slowed = speed_slowed;

    this.current_health = total_health;
    this.total_health = total_health;

    // this will allow player to take damage only if greater than total imm frames
    //every time player takes damage the current is set back to 0
    this.current_immunity_frames = 0 ;
    this.total_immunity_frames = immunity_frames;

  }
  draw() 
  {
    if (this.immunity()) 
    {
      for (let i = 0; i < this.color_trail_num; i++) 
      {
        fill(player.color);
        stroke(player.color);
        circle(this.color_trail_pos_x[i],this.color_trail_pos_y[i],25-i*3);
      }
      fill([255,255,255]);
      circle(this.pos_x,this.pos_y,this.diameter);
    } 
    else 
    {
      for (let i = 0; i < this.color_trail_num; i++) 
      {
        fill([255,0,0]);
        stroke([255,0,0]);
        circle(this.color_trail_pos_x[i],this.color_trail_pos_y[i],25-i*3);
      }
      fill([255,255*this.current_immunity_frames/this.total_immunity_frames,
          255*this.current_immunity_frames/this.total_immunity_frames]);
      circle(this.pos_x,this.pos_y,this.diameter);
    }
  }
  
  move() 
  {
    let temp_move_x = 0,temp_move_y = 0;
    //the capital thing should probs never occur
    if (downPressedKeys.has('w') || downPressedKeys.has('ArrowUp')) 
    {
      temp_move_y-=1;
    }
    if (downPressedKeys.has('s') || downPressedKeys.has('ArrowDown')) 
    {
      temp_move_y+=1;
    }
    if (downPressedKeys.has('a') || downPressedKeys.has('ArrowLeft')) 
    {
      temp_move_x-=1;
    }
    if (downPressedKeys.has('d') || downPressedKeys.has('ArrowRight')) 
    {
      temp_move_x+=1;
    }

    if (downPressedKeys.has('Shift')) 
    {
      this.pos_x += temp_move_x * this.speed_slowed;
      this.pos_y += temp_move_y * this.speed_slowed;
    } 
    else if (downPressedMouse.has(undefined)) 
    {
      this.pos_x += temp_move_x * this.speed_fast;
      this.pos_y += temp_move_y * this.speed_fast;
    } 
    else 
    {
      this.pos_x += temp_move_x * this.speed;
      this.pos_y += temp_move_y * this.speed;
    }

    //for the color trails
    this.color_trail_pos_x.splice(0, 0, this.pos_x);
    this.color_trail_pos_x.splice(this.color_trail_pos_x.length-1,1);

    this.color_trail_pos_y.splice(0, 0, this.pos_y);
    this.color_trail_pos_y.splice(this.color_trail_pos_y.length-1,1);

    //out of bounds check
    if (this.pos_x > width) 
    {
     this.pos_x = width; 
    }
    if (this.pos_x < 0) 
    {
     this.pos_x = 0; 
    }
    if (this.pos_y > height) 
    {
     this.pos_y = height; 
    }
    if (this.pos_y < 0) 
    {
     this.pos_y = 0; 
    }

    return;
  }

  update() 
  {
    this.current_immunity_frames+=1;
    this.move();
    this.draw();
  }

  immunity() 
  {
    if (this.current_immunity_frames>this.total_immunity_frames) 
    {
      return true;
    }
    return false;
  }

  lose_health() 
  {
    if (this.immunity()) 
    {
      this.current_immunity_frames = 0;
      this.current_health -= 1;
    }
  }

  collision(proj_list) 
  {
    for (let i = 0; i < proj_list.length; i++)
      if ( (this.pos_x-proj_list[i].pos_x)**2+(this.pos_y-proj_list[i].pos_y)**2  < (this.diameter+proj_list[i].diameter-4)**2 / 4 )
      {
        this.lose_health();
        return;
      }
    return;
  }

  is_alive() 
  {
    return this.current_health > 0;
  }
}


//player declaration 
//player declaration
let player = new Player(width/4,height/2,25,[0,0,255],5,2,12,35,120);
//player declaration
//player declaration




function update_main_loop()
{
  timer +=1;
  background(255,255,255);

  if (timer % timerMod == 0) 
  {
    for (let i = 0; i < 3; i++) 
    {
      arrcoloradd[i] += arrcolorincr[i];
      if (arrcoloradd[i] <= 0) 
      {
        arrcoloradd[i] = 0;
        arrcolorincr[i] = Math.random()*5
      }
      if (arrcoloradd[i] >= 255) 
      {
        arrcoloradd[i] = 255;
        arrcolorincr[i] = -Math.random()*5
      }
    }
    if (random_randnum == 2) 
    {
      angle += angleAdd;
      angle2 -= angle2Add;
    } 
    else 
    {
      angle += speed;
      angle2 -= speed2;
    }

    let slowdown_num = 0.5;
    let temp_proj = new Projectile(
      25,
      [arrcoloradd[0],arrcoloradd[1],arrcoloradd[2],70],
      width/2,
      height/2,
      speed*Math.cos(angle)*slowdown_num,speed*Math.sin(angle)*slowdown_num,
      speed2*Math.cos(angle2)*Math.cos(angle)*slowdown_num,speed2*Math.sin(angle2)*Math.sin(angle)*slowdown_num
    );

    projectiles_main_arr.push(temp_proj);
  } 
  
  console.log(downPressedKeys);
  projectiles_main_arr = Projectile.update_list(projectiles_main_arr,true);
  player.update();
}

setInterval(update_main_loop,1000/60);