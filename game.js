var config = {
  type: Phaser.AUTO,
  width: 480,
  height: 300,
  physics: {
    default: "arcade",
    arcade: {},
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

var game = new Phaser.Game(config);

function preload() {
  // Load your sprites and other assets here
  this.load.spritesheet(
    "player",
    "assets/16x16-RPG-characters/sprites/old-style/01-generic.png",
    {
      frameWidth: 16,
      frameHeight: 16,
    }
  );
  this.load.image("basictiles", "assets/basictiles.png");
  this.load.image("things", "assets/things.png");
  this.load.tilemapTiledJSON("map", "assets/map.tmj");
}

function create() {
  //Create the map and wall collision layer
  const map = this.make.tilemap({ key: "map" });
  const tileset = map.addTilesetImage("basictiles", "basictiles");
  map.createLayer("background", tileset, 0, 0);
  const wallsLayer = map.createLayer("walls", tileset, 0, 0);
  map.createLayer("items", tileset, 0, 0);
  wallsLayer.setCollisionByProperty({ collides: true });

  // Create the player sprite
  this.player = this.physics.add.sprite(100, 200, "player");
  this.player.setCollideWorldBounds(true);
  this.player.body.setCircle(8, 2, 2);

  // Constructor to maintain simulation state
  this.agents = []; // An array to store all agents
  this.time = 0;
  this.tree = null; // your tree structure

  //Create the map and wall collision layer
  wallsLayer.setCollisionBetween(0, 1000);
  this.physics.add.collider(this.player, wallsLayer); // collide group with walls

  // Add agents to the array
  const emma = {
    x: 280, // Example x coordinate
    y: 104, // Example y coordinate
    radius: 8, // Example radius
    color: 0xff0000, // Example color in hex format
    name: "Emma",
    age: 32,
    innate: "Friendly and curious",
    learned: "Excellent cook and craftperson",
    current: "To find a rare herb for a new dish she wants to try",
    routines: [
      "Wakes up early to forage",
      "Spends the day cooking and crafting",
      "Visits apothecary to learn",
      "Ends the day chatting with villagers about their day",
    ],
    sprite: 13,
  };
  this.agents.push(emma);
  const john = {
    x: 440,
    y: 168,
    radius: 8,
    color: 0xff0000,
    name: "John",
    age: 45,
    innate: "Protective and stubborn",
    learned: "Skilled blacksmith",
    current: "To create a new weapon design for the armory",
    routines: [
      "Starts the day at the armory, working on the weapon design",
      "Goes to the shop to buy supplies",
      "Spends the afternoon practicing his sword fighting skills",
      "Ends the day at the pub, telling stories and enjoying a cold beer",
    ],
    sprite: 4,
  };
  this.agents.push(john);
  const sarah = {
    x: 200,
    y: 72,
    radius: 8,
    color: 0xff0000,
    name: "Sarah",
    age: 20,
    innate: "Shy and introverted",
    learned: "Excellent healer",
    current: "To find a new ingredient for a healing salve",
    routines: [
      "Starts the day at the apothecary, researching new ingredients and remedies",
      "Spends the afternoon exploring the forest for herbs and plants",
      "Ends the day reading books and practicing her healing skills in the apothecary",
    ],
    sprite: 7,
  };
  this.agents.push(sarah);
  const william = {
    x: 40,
    y: 88,
    radius: 8,
    color: 0xff0000,
    name: "William",
    age: 55,
    innate: "Grumpy and solitary",
    learned: "Skilled hunter",
    current: "To catch a rare deer he's been tracking for weeks",
    routines: [
      "Starts the day early in the forest, tracking and hunting animals",
      "Spends the afternoon in his shack, cleaning and cooking the game",
      "Ends the day drinking alone in the pub, muttering about the other villagers",
    ],
    sprite: 10,
  };
  this.agents.push(william);

  // Check for user input
  this.cursors = this.input.keyboard.createCursorKeys();

  //Create player animations
  this.anims.create({
    key: "walk-down",
    frames: this.anims.generateFrameNumbers("player", {
      frames: [0, 2],
    }),
    frameRate: 3,
    repeat: -1,
  });
  this.anims.create({
    key: "walk-up",
    frames: this.anims.generateFrameNumbers("player", {
      frames: [45, 47],
    }),
    frameRate: 3,
    repeat: -1,
  });
  this.anims.create({
    key: "walk-right",
    frames: this.anims.generateFrameNumbers("player", {
      frames: [30, 32],
    }),
    frameRate: 3,
    repeat: -1,
  });
  this.anims.create({
    key: "walk-left",
    frames: this.anims.generateFrameNumbers("player", {
      frames: [15, 17],
    }),
    frameRate: 3,
    repeat: -1,
  });
}

function update() {
  // Control User Movement Within the Simulation
  const player = this.player;
  const cursors = this.cursors;

  player.setVelocity(0);

  if (cursors.left.isDown) {
    player.setVelocityX(-80);
    this.player.anims.play("walk-left", true);
  } else if (cursors.right.isDown) {
    player.setVelocityX(80);
    this.player.anims.play("walk-right", true);
  }

  if (cursors.up.isDown) {
    player.setVelocityY(-80);
    this.player.anims.play("walk-up", true);
  } else if (cursors.down.isDown) {
    player.setVelocityY(80);
    this.player.anims.play("walk-down", true);
  }

  // Keep track of time
  const currentTime = this.time.now;

  // Store objects in a tree structure
  const tree = {
    shop: {
      chest: { state: "" },
      table: { state: "" },
      bed: { state: "" },
    },
    apothecary: {
      flame: { state: "" },
      table: { state: "" },
      bed: { state: "" },
      drawer: { state: "" },
    },
    shack: {
      bed: { state: "" },
    },
    armory: {
      weaponRoom: {
        Statue: { state: "" },
        Drawer: { state: "" },
        Pot: { state: "" },
        Table: { state: "" },
        Bed: { state: "" },
      },
      armorRoom: {
        Table: { state: "" },
        Bed: { state: "" },
        Chest1: { state: "" },
        Chest2: { state: "" },
      },
    },
  };

  // Render all agents in the array as circles
  for (const agent of this.agents) {
    this.add.sprite(agent.x, agent.y, "player", agent.sprite);
  }

  // Check for agent updates
}
