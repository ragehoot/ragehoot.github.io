const config = {
    width: 1400,
    height: 750,
    backgroundColor: "#FFFFF",
    parent: "gameContainer",
    scene: [GameScene],
    physics: {
      default: "arcade"
    }
  };

function dist(x1,y1,x2,y2) {
  return sqrt((x2-x1)**2+(y2-y1)**2);
}

class Player {
  constructor(pos_x,pos_y,radius,color,speed,total_health,immunity_frames) {
    this.pos_x = pos_x;
    this.pos_y = pos_y;
    this.radius = radius;
    this.color = color;
    this.speed = speed;

    this.current_health = total_health;
    this.total_health = total_health;

    // this will allow player to take damage only if greater than total imm frames
    //every time player takes damage the current is set back to 0
    this.current_immunity_frames = 0 ;
    this.total_immunity_frames = immunity_frames;

  }
  // implement this later 
  draw() {
    return;
  }
  
  // complete this later
  move() {
    // make sure wasd and arrowkeys work
    return;
  }

  immunity() {
    if (this.current_immunity_frames-this.total_immunity_frames) {
      return true;
    }
    return false;
  }

  // complete this after adding projectile class
  collision(proj_list) {
    return;
  }

  is_alive() {
    return this.current_health > 0;
  }
    

}