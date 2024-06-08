class Sprite{
    constructor({position, image, frames, c, sprites}){
      this.position = position,
      this.image = image,
      this.frames = frames,
      this.elapsed = 0,
      this.val = 0; //val = current frame (say theres 4 frames in pic, val = current frame or action)
      this.image.onload = () => {
        this.width = this.image.width / this.frames;
        this.height = this.image.height;
      }
      this.moving = false
      this.c = c
      this.sprites = sprites;
    }

    draw(){
        this.c.drawImage(
        this.image,
        //these 4 params are for cropping
        this.val * this.width, //x-cord in which we want to start cropping from
        0, //y-cord in which we want to start cropping
        this.image.width / this.frames, //crop one section of image (1/4 of image)
        this.image.height, //crop the entire height of the image (else only left head or body)

        //these 4 are for the actual image being rendered 
        this.position.x,
        this.position.y,
        //these 2 are how u want the image to finally look like (how much space should it take, u can stuff the cropped image in a smaller box or vice versa)
        this.image.width / this.frames, //the final width of the image 
        this.image.height
      ) //actual stuff rendered out? idk

      if (!this.moving) return; //character not moving

      if (this.frames > 1) //do not change frames for constant stuff.
        this.elapsed++;

      if(this.elapsed % 20 === 0){ //one action per 10 frames
        if (this.val < this.frames - 1 )
          this.val++;
        else
          this.val = 0;
      }
    }
  }

class Boundary{
    static width = 48;
    static height = 48;
    constructor({position}, c){
      this.position = position;
      this.width = 48;
      this.height = 48;
      this.c = c;
    }

    draw(){
        this.c.fillStyle = "rgba(255,0,0,0.5)"; //last is opacity 
        this.c.fillRect(this.position.x, this.position.y, this.width, this.height);
        //(x pos, y pos, width and length)
    }
  }

export {Sprite, Boundary};