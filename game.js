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
  this.agents = [
    {
      x: 280,
      y: 104,
      radius: 8,
      color: 0xff0000,
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
    },
    {
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
    },
    {
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
    },
    {
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
    },
  ]; // An array to store all agents
  this.time = this.time.now; // A variable to store the current time, may eventually rely on larger set of time blocks
  this.tree = {
    shop: {
      chest: { state: "", location: [100, 100] },
      table: { state: "", location: [120, 100] },
      bed: { state: "", location: [140, 100] },
    },
    apothecary: {
      flame: { state: "", location: [200, 200] },
      table: { state: "", location: [220, 200] },
      bed: { state: "", location: [240, 200] },
      drawer: { state: "", location: [260, 200] },
    },
    shack: {
      bed: { state: "", location: [300, 300] },
    },
    armory: {
      weaponRoom: {
        Statue: { state: "", location: [400, 400] },
        Drawer: { state: "", location: [420, 400] },
        Pot: { state: "", location: [440, 400] },
        Table: { state: "", location: [460, 400] },
        Bed: { state: "", location: [480, 400] },
      },
      armorRoom: {
        Table: { state: "", location: [500, 500] },
        Bed: { state: "", location: [520, 500] },
        Chest1: { state: "", location: [540, 500] },
        Chest2: { state: "", location: [560, 500] },
      },
    },
    forest: { state: "", location: [600, 600] },
    mushroomPatch: { state: "", location: [700, 700] },
    mailbox: { state: "", location: [800, 800] },
    herbPatch: { state: "", location: [900, 900] },
    well: { state: "", location: [1000, 1000] },
  }; // Tree structure to store the state of the world TODO: Put actual locations

  //Create the map and wall collision layer
  wallsLayer.setCollisionBetween(0, 1000);
  this.physics.add.collider(this.player, wallsLayer); // collide group with walls

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

  // Create the grid
  this.add.grid(20, 20, 1000, 1000, 16, 16, 0x000000, 0.5, 0x000000, 0.5);
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
  this.time += 1;

  // Update Agents
  for (const agent of this.agents) {
    // Render agent in current location
    this.add.sprite(agent.x, agent.y, "player", agent.sprite);

    // Prompt agent for statement describing their current action

    // Check in with memory/brain store

    // Give feedback and reflection on action

    // Convert to concrete action by calculating the path to location

    // Execute action
  }
}
