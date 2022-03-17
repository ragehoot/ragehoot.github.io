const width = screen.availWidth;
const height = screen.availHeight;

function setup() 
{
  createCanvas(width, height);
}

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

class Projectile{
  constructor(radius,color,pos_x,pos_y,vel_x,vel_y,acc_x = 0,acc_y = 0)
  {
    this.radius = radius;
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
    draw_circle(this.pos_x,this.pos_y,this.radius,this.color,true,this.color_outline);
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
    if (this.pos_x-this.radius>width+forgiving_x){
      return true;
    }
    if (this.pos_x+this.radius<-forgiving_x){
      return true;
    }
    if (this.pos_y-this.radius>height+forgiving_y){
      return true;
    }
    if (this.pos_y+this.radius<-forgiving_y){
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

class Player {
  /**player color is just for the trail*/
  constructor(pos_x,pos_y,radius,color,speed,speed_slowed,speed_fast,total_health,immunity_frames) {
    this.pos_x = pos_x;
    this.pos_y = pos_y;
    this.radius = radius;

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
      circle(this.pos_x,this.pos_y,this.radius*2);
    }
    else{
      for (let i = 0; i < this.color_trail_num; i++)
      {
        fill([255,0,0]);
        stroke([255,0,0]);
        circle(this.color_trail_pos_x[i],this.color_trail_pos_y[i],25-i*3);
      }
      fill([255,255*this.current_immunity_frames/this.total_immunity_frames,
          255*this.current_immunity_frames/this.total_immunity_frames]);
      circle(this.pos_x,this.pos_y,this.radius*2);
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
      if (  (this.pos_x-proj_list[i].pos_x)**2+(this.pos_y-proj_list[i].pos_y)**2  < (this.radius+proj_list[i].radius-3)**2)
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

function distance(x1,y1,x2,y2) {
  return sqrt((x2-x1)**2+(y2-y1)**2);
}

function draw_circle(pos_x,pos_y,radius,color,should_draw_border,color_outline)
{
  fill(color);
  if (should_draw_border)
  {
    stroke(color_outline);
  }
  else{
    noStroke();
  }
  circle(pos_x,pos_y,radius*2);
  return;
}

//https://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
/** the min must be lower than the max */
function random_int(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**min doesn't have to be lower than the max */
function random_float(min,max)
{
  return (Math.random()*(max-min)+min);
}

function random_choice(arr_choices)
{
  return (arr_choices[random_int(0,arr_choices.length-1)]);
}

//player declaration 
//player declaration
let player = new Player(width/4,height/2,13,[0,0,255],5,3,12,35,120);
//player declaration
//player declaration

class Main_update_class
{
  constructor ()
  {
    this.attack_started = false;
    this.timer = 0;
    this.projectiles = [];

    this.SPIRAL_1 = 1; // a more complex attack
    this.SPIRAL_2 = 2; // a more simple attack
    this.EXAMPLE_ATTACK = 3; // --------------- EXAMPLE ATTACK -------------
    this.SPIRAL_3 = 4; // a more complex attack
    this.SPIRAL_4 = 5;

    this.ATTACK_INDEX_RETURN_TO = 0; // index in the array

    this.attack_arr = [this.SPIRAL_2,this.SPIRAL_1,this.SPIRAL_3,this.SPIRAL_4];//this.SPIRAL_2,this.SPIRAL_3,this.SPIRAL_1];
    this.attack_index = 0;
  }

  spiral_1_initializer()
  {
    this.attack_started = true;
    this.spiral_1_time_end = 900;

    this.spiral_1_time_mod = 1;
    this.spiral_1_angle = random_float(0,2*Math.PI);
    this.spiral_1_angle_incr = random_float(0.2,2*Math.PI);
    this.spiral_1_speed = random_float(1,3);

    this.spiral_1_angle_acc = random_float(0,2*Math.PI);
    this.spiral_1_angle_incr_acc = random_float(0.2,2*Math.PI);
    this.spiral_1_acc = random_float(0.05,0.1);
  }

  spiral_1()
  {
    if (!this.attack_started)
    {
      this.spiral_1_initializer();
    }

    //only executes attack after a cretain amnt of time
    if (this.timer>100){
      this.spiral_1_angle+=this.spiral_1_angle_incr;
      this.spiral_1_angle_acc+=this.spiral_1_angle_incr_acc;

      if (this.timer%this.spiral_1_time_mod == 0)
      {
        let temp_proj = new Projectile(10,[255,0,0,170],width/2,height/2,
          Math.cos(this.spiral_1_angle)*this.spiral_1_speed,Math.sin(this.spiral_1_angle)*this.spiral_1_speed,
          Math.cos(this.spiral_1_angle_acc)*this.spiral_1_acc,Math.sin(this.spiral_1_angle_acc)*this.spiral_1_acc);
        this.projectiles.push(temp_proj);
      }
    }

    this.projectiles = Projectile.update_list(this.projectiles);

    if (this.timer>this.spiral_1_time_end)
    {
      return true;
    }
    return false;
  }

  spiral_2_initializer()
  {
    this.attack_started = true;
    this.spiral_2_time_end = 700;

    this.spiral_2_angle = random_float(0,2*Math.PI);
    this.spiral_2_angle_incr = random_float(0.02,0.10)+2*Math.PI/random_int(3,10);
    this.spiral_2_mod = 1; // proejctiles generated every 2 frames (60 frames per second)
    this.spiral_2_color = [random_float(0,255),0,random_float(0,255),random_float(0,255)];
    this.spiral_2_speed = random_float(2,3);
  }

  spiral_2()
  {
    if (!this.attack_started){
      this.spiral_2_initializer();
    }

    if (this.timer%this.spiral_2_mod==0)
    {
      this.spiral_2_angle+=this.spiral_2_angle_incr;

      let temp_proj = new Projectile(15,this.spiral_2_color,width/2,height/2,
        this.spiral_2_speed*Math.cos(this.spiral_2_angle),this.spiral_2_speed*Math.sin(this.spiral_2_angle));
      
      this.projectiles.push(temp_proj);
    }

    this.projectiles = Projectile.update_list(this.projectiles);

    if (this.timer>this.spiral_2_time_end)
    {
      return true;
    }
    return false;
  }
  spiral_3_initializer()
  {
    this.attack_started = true;
    this.spiral_3_time_end = 1000;

    this.spiral_3_angle = random_float(0,2*Math.PI);
    this.spiral_3_angle_incr = random_float(Math.PI/5,Math.PI/1.5);
    this.spiral_3_mod = 6; // proejctiles generated every 2 frames (60 frames per second)
    this.spiral_3_color = [random_float(0,255),0,random_float(0,255),random_float(0,255)];
    this.spiral_3_speed = random_float(4,6);
  }

  spiral_3()
  {
    if (!this.attack_started){
      this.spiral_3_initializer();
    }

    if ((this.timer%this.spiral_3_mod==0) && this.timer>100)
    {
      this.spiral_3_angle+=this.spiral_3_angle_incr;

      let temp_proj = new Projectile(30,this.spiral_3_color,width/2,height/2,
        this.spiral_3_speed*Math.cos(this.spiral_3_angle),this.spiral_3_speed*Math.sin(this.spiral_3_angle),0,0.02);
      this.projectiles.push(temp_proj);

      temp_proj = new Projectile(30,this.spiral_3_color,width/2,height/2,
        this.spiral_3_speed*Math.cos(this.spiral_3_angle),this.spiral_3_speed*Math.sin(this.spiral_3_angle),0,-0.02);
      
      this.projectiles.push(temp_proj);
    }

    this.projectiles = Projectile.update_list(this.projectiles);

    if (this.timer>this.spiral_3_time_end)
    {
      return true;
    }
    return false;
  }

  spiral_4_initializer()
  {
    this.attack_started = true;
    this.spiral_4_time_end = 1500;
    
    this.spiral_4_angle_vel = 0;
    this.spiral_4_angle_acc = 0;

    this.spiral_4_angle_vel_add = random_choice([random_float(-0.2,0.2),random_float(-3,3)]);
    this.spiral_4_angle_acc_add = random_choice([random_float(-0.34,0.34),random_float(-0.2,0.2)]);

    this.spiral_4_color = [0,0,0];
    this.spiral_4_color_incr = [random_float(0.5,5),random_float(0.5,5),random_float(0.5,5)];

    this.spiral_4_vel = random_float(-3.5,3.5);
    this.spiral_4_acc = random_float(-0.2,0.2);

    if (this.spiral_4_vel < 1.5 && this.spiral_4_acc < 0.01)
    {
      this.spiral_4_acc = random_choice([-0.015,0.015]);
    }
  }

  spiral_4()
  {
    if (!this.attack_started)
    {
      this.spiral_4_initializer();
    }

    for (let i = 0; i < 3; i++)
    {
      this.spiral_4_color[i] += this.spiral_4_color_incr[i];
      if (this.spiral_4_color[i]<=0)
      {
        this.spiral_4_color[i] = 0;
        this.spiral_4_color_incr[i] = random_float(0.5,5);
      }
      else if (this.spiral_4_color[i]>=255)
      {
        this.spiral_4_color[i] = 255;
        this.spiral_4_color_incr[i] = -random_float(0.5,5);
      }
    }

    this.spiral_4_angle_acc += this.spiral_4_angle_acc_add;
    this.spiral_4_angle_vel += this.spiral_4_angle_vel_add;

    let temp_proj = new Projectile(10,[this.spiral_4_color[0],this.spiral_4_color[1],this.spiral_4_color[2],70],width/2,height/2,
      this.spiral_4_vel*Math.cos(this.spiral_4_angle_vel),this.spiral_4_vel*Math.sin(this.spiral_4_angle_vel),
      this.spiral_4_acc*Math.cos(this.spiral_4_angle_acc)*Math.cos(this.spiral_4_angle_vel)
      ,this.spiral_4_acc*Math.sin(this.spiral_4_angle_acc)*Math.sin(this.spiral_4_angle_vel))
    this.projectiles.push(temp_proj);


    this.projectiles = Projectile.update_list(this.projectiles);

    if (this.timer>this.spiral_4_time_end)
    {
      return true;
    }
    return false;
  }

  example_attack_initializer()
  {
    this.attack_started = true;

    this.example_attack_time_end = 120;
  }

  example_attack()
  {
    if (!this.attack_started)
    {
      this.example_attack_initializer();
    }

    let temp_proj = new Projectile(25,[255,0,0],width/2,height/2,5,3,0,-0.1);
    this.projectiles.push(temp_proj);
    this.projectiles = Projectile.update_list(this.projectiles);

    if (this.timer>this.example_attack_time_end)
    {
      return true;
    }
    return false;
  }

  update_main()
  {
      let current_attack_number = this.attack_arr[this.attack_index];
      let finished_attack = false;

      this.timer +=1;

      switch(current_attack_number)
      {
        case this.SPIRAL_1:
          finished_attack = this.spiral_1();
          break;

        case this.SPIRAL_2:
          finished_attack = this.spiral_2();
          break;

        case this.EXAMPLE_ATTACK:
          finished_attack = this.example_attack();
          break;

        case this.SPIRAL_3:
          finished_attack = this.spiral_3();
          break;

        case this.SPIRAL_4:
          finished_attack = this.spiral_4();
          break

        default:
          console.log('out of attack arr bounds');
      }

      //console.log(this.projectiles.length);

      if (finished_attack)
      {
        this.attack_index +=1;
        this.attack_started = false;

        if (this.attack_index == this.attack_arr.length)
        {
          this.attack_index = this.ATTACK_INDEX_RETURN_TO;
        }
        this.timer = 0;
        this.projectiles = []; // remove this lien of code if you want projectiles to linger after attack end
      }
  }
}

let main_update_object = new Main_update_class(); // USED FOR ALL ATTACKS


//code to draw text in a rectangle //code to draw text in a rectangle 
// code to draw text in a rectangle //code to draw text in a rectangle
 //code to draw text in a rectangle //code to draw text in a rectangle 
// code to draw text in a rectangle //code to draw text in a rectangle

// let textBox = document.createElement('div');
// textBox.style.position = "absolute";
// textBox.style.height = "100px";
// textBox.style.width = "100px";
// textBox.style.top = 0 + "px";
// textBox.style.backgroundColor = "red";


// document.body.appendChild(textBox); 

// let text = "☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️☹️";
// textBox.innerHTML = text;
// textBox.style.fontSize = 100 / Math.sqrt(text.length) + "px";


function update_main_loop(){
  background(255,255,255);

  //console.log(downPressedKeys);
  main_update_object.update_main();
  player.update();
}

setInterval(update_main_loop,1000/60);