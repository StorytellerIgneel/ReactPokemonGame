import React, { useRef, useEffect } from 'react';
import mapCollision from '../../public/assets/Collisions/collisions.js';
import battleZoneData from '../../public/assets/Collisions/battleZone.js';
import {Sprite, Boundary} from "../classes/classes.js";

const CanvasComponent = () => {
  // Create a reference to the canvas element
  const canvasRef = useRef(null);

  // useEffect runs after the component mounts
  useEffect(() => {
     // Get the canvas element
    const canvas = canvasRef.current;
    // Get the 2D drawing context
    const c = canvas.getContext('2d');

    const movingDistance = 3; // moving speed
    const encounterChance = 0.025; //10% chance of kena pokemon encounter
   
    //essentially passing another object in, no nid to memorise the sequence of arg

    //first 2 is the position
    //canvas.width/2 - this.image.width/2.75, //actual x pos of char
    //canvas.height/2 - this.image.height, //actual y pos of char

    const keys = {
      w:{pressed: false},
      a:{pressed: false},
      s:{pressed: false},
      d:{pressed: false},
      lastKeyPressed : "non" ,
    }

    const battleZone = []
    const boundaries = [];
    const offset = {
      x: -785,
      y: -650
    }

    function movePlayer(){
      //small map: x = -1300, y = -500
      c.drawImage(
        playerImage,
        //these 4 params are for cropping
        0, //x-cord in which we want to start cropping from
        0, //y-cord in which we want to start cropping
        playerImage.width/4, //crop one section of image (1/4 of image)
        playerImage.height, //crop the entire height of the image (else only left head or body)

        //these 4 are for the actual image being rendered 
        //first 2 is the position
        canvas.width/2 - playerImage.width/2.75, //actual x pos of char
        canvas.height/2 - playerImage.height, //actual y pos of char
        //these 2 are how u want the image to finally look like (how much space should it take, u can stuff the cropped image in a smaller box or vice versa)
        playerImage.width/4, //the final width of the image 
        playerImage.height) //actual stuff rendered out? idk
    }

    function moveMap(movable, distance, direction){
      if (direction === 'x'){
        movable.forEach((movable) => {
          movable.position.x += distance;
        })
      }
      else if (direction === 'y'){
        movable.forEach((movable) => {
          movable.position.y += distance;
        })
      }
    }

    function rectangularCollision({rectangle1, rectangle2}){
      return(
        (rectangle1.position.x + rectangle1.width) >= rectangle2.position.x && 
              rectangle1.position.x <= (rectangle2.position.x + rectangle2.width) &&
                (rectangle1.position.y + rectangle1.height) >= rectangle2.position.y &&
                rectangle1.position.y <= (rectangle2.position.y + rectangle2.height)
      )
    }

    function checkCollide(distanceX, distanceY){
      for (let i = 0; i < boundaries.length; i++) {
        const boundary = boundaries[i]
        if (
          rectangularCollision({
            rectangle1: player,
            rectangle2: { //create a copy of the object without overwriting
              ...boundary,
              position: {
                x: boundary.position.x + distanceX,
                y: boundary.position.y + distanceY
              }
            }
          })
        ){
          console.log("collision")
          player.moving = false;
        }
      }
    }

    function checkBattle(){
      for (let i = 0; i < battleZone.length; i++) {
        const battleBlock = battleZone[i]
        const overlappingArea = (Math.min(player.position.x + player.width, battleBlock.position.x + battleBlock.width) - Math.max(player.position.x, battleBlock.position.x)) * //this part to find the overlapping width
                                (Math.min(player.position.y + player.height, battleBlock.position.y + battleBlock.height) - Math.max(player.position.y, battleBlock.position.y)) // find overlapping height 
        if (
          rectangularCollision({
            rectangle1: player,
            rectangle2: battleBlock,
          }) && overlappingArea > (player.width * player.height / 2) //the player needs to be half inside the bush, not like it will get into battle even only touch the bush a bit
          && Math.random() < encounterChance //Math.random() gives a random number between 0 and 1. 
        ){
          console.log("In battle block")
        }
      }
    }

    function createBoundaries(originalData, mapArray){
      originalData.forEach((row, i) => {
        row.forEach((symbol, j) => {
          if (symbol === 1025){
            mapArray.push(
              new Boundary({
                position : {
                  x: j * Boundary.width + offset.x, //one block is 48 pixels large ig
                  y: i * Boundary.height + offset.y,
                }, 
              }, c)
            )
          }
        })
      })
    }

    function animate(){ //animate the game
      window.requestAnimationFrame(animate); //takes one arg and it is the func to call recursively
      background.draw();
      boundaries.forEach((boundary) => boundary.draw());
      battleZone.forEach((battle) => battle.draw());
      player.draw();
      foreground.draw();
      //means infinite loop here

      if(keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed)
        checkBattle();

      if (keys.w.pressed && keys.lastKeyPressed === 'w'){
        checkCollide(0, movingDistance);
        if (player.moving === true)
          moveMap(movables, movingDistance, 'y');
      }
      else if (keys.a.pressed && keys.lastKeyPressed === 'a'){
        checkCollide(movingDistance, 0);
        if (player.moving === true)
          moveMap(movables, movingDistance, 'x');
      }
      else if (keys.s.pressed && keys.lastKeyPressed === 's'){
        checkCollide(0, -movingDistance);
        if (player.moving === true)
          moveMap(movables, -movingDistance, 'y');
      }
      else if (keys.d.pressed && keys.lastKeyPressed === 'd' ){
        checkCollide(-movingDistance, 0);
        if (player.moving === true)
          moveMap(movables, -movingDistance, 'x');
      }
    }

    //creating collision blocks for each 1025
    createBoundaries(mapCollision, boundaries);
    createBoundaries(battleZoneData, battleZone);

    //console.log(boundaries);
    //boundaries.forEach((Boundary) => {console.log(Boundary.x, Boundary.y)})

    // Fill the canvas with a white background
    //c.fillStyle = "white";
    // c.fillRect(0, 0, canvas.width, canvas.height);


    //load map
    const mapImage = new Image(); //new Image is from native JS api, create a html image but put inside a js const （its a constructor)
    mapImage.src = "/assets/Map/Pellet Town.png" //create html image within js
    //equivalent to html <img src="../assets/Map/PokemonMap>

    // Load an image
    const playerImage  = new Image();
    playerImage.src = "../public/assets/images/playerDown.png";

    /*
    const playerUpImage  = new Image();
    playerUpImage.src = "../public/assets/images/playerUp.png";

    const playerLeftImage  = new Image();
    playerLeftImage.src = "../public/assets/images/playerLeft.png";

    const playerRightImage  = new Image();
    playerRightImage.src = "../public/assets/images/playerRight.png";
    */

    const foregroundImage = new Image();
    foregroundImage.src = "../public/assets/Map/PelletTownForeground.png"

    //create image object 
    const background = new Sprite({
      position: {
        x:offset.x,
        y:offset.y
      },
      image: mapImage,
      frames: 1,
      c,
    })

    const player = new Sprite({
      position:{
        x: canvas.width/2 - 192/2.75, //actual x pos of char
        y: canvas.height/2 - 68, //actual y pos of char
      },
      image: playerImage,
      frames: 4,
      c,
    })

    const foreground = new Sprite({
      position: {
        x:offset.x,
        y:offset.y
      },
      image: foregroundImage,
      frames: 1,
      c,
    })

    let movables = [background, foreground, ...boundaries, ...battleZone];
    //boundaries.forEach((item) => {movables.push(item)});
    //battleZone.forEach((item) => {movables.push(item)});
    ///can use movables = [background, ...boundaries] also

    animate()

    //event listeners
    window.addEventListener("keydown", (e) => { //whenever a keydown event occurs, call this arrow func, and e is a prepopulated object stands for event
      switch(e.key){
        case "w":
          playerImage.src = "/assets/images/playerUp.png";
          player.moving = true;
          keys.w.pressed = true;
          keys.lastKeyPressed = "w";
          break;
        case "a":
          playerImage.src = "/assets/images/playerLeft.png";
          player.moving = true;
          keys.a.pressed = true;
          keys.lastKeyPressed = "a";
          break;
        case "s":
          playerImage.src = "/assets/images/playerDown.png";;
          player.moving = true;
          keys.s.pressed = true;
          keys.lastKeyPressed = "s";
          break;
        case "d":
          playerImage.src = "/assets/images/playerRight.png";;
          player.moving = true;
          keys.d.pressed = true;
          keys.lastKeyPressed = "d";
          break;
        default:
          console.log("bruh")
      }
    })

    window.addEventListener("keyup", (e) => { //whenever a keydown event occurs, call this arrow func, and e is a prepopulated object stands for event
      switch(e.key){
        case "w":
          player.moving = false;
          keys.w.pressed = false;
          break;
        case "a":
          player.moving = false;
          keys.a.pressed = false;
          break;
        case "s":
          player.moving = false;
          keys.s.pressed = false;
          break;
        case "d":
          player.moving = false;
          keys.d.pressed = false;
          break;
        default:
          console.log("bruh")
      }
    })

    playerImage.onerror = () => {
      console.error("failed to load")
    }
  }, []); // Empty dependency array means this effect runs once when the component mounts

  return (
    // Render the canvas element and assign the ref to it
    <canvas ref={canvasRef} width={1024} height={576}></canvas>
  );
};

export default CanvasComponent;