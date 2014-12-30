/*
 * LOGAN'S PHASER GAME
 *    TO BE NAMED
 *  CREATED WITH THE HELP OF PHASER 
 *   AND POSSIBLY PHONEGAP
 */

// various game objects
var game;
var ground;
var sky;
var hills;
var clouds;
var platforms;

// game attributes
var world_height;
var world_width;
var ground_vel  = 50;
var sky_vel     = ground_vel *0.5;
var hill_vel    = ground_vel *0.7;
var hill_min    = 5;
var hill_max    = 15;
var vel_mod     = 1;

var highscore;
var score       = 0;
var score_text;
var ammo_text;
var shield_text;

/**
 * Creates a game and adds different states
 */
function beginGame(w, h)
{

    //console.log('Screen: '+window.innerWidth+':'+window.innerHeight)
    game = new Phaser.Game(960, 640, Phaser.AUTO, 'container', null);
    game.state.add('Boot'  , Boot  , false);
    game.state.add('Loader', Loader, false);
    game.state.add('Menu'  , Menu  , false);
    game.state.add('Game'  , Game  , false);
    game.state.add('Finish', Finish, false);


     
    game.state.start('Boot');
}

/**
 * Loads loading bar and fires up loader
 */
function Boot()
{
    this.preload = function()
    {
        game.load.image('load_bar'          , '/game-files/res/assets/preloader.gif');
    }
    
    this.create = function()
    {
        game.scale.forceLandscape = true;
        game.scaleMode = Phaser.ScaleManager.EXACT_FIT;
    
        game.scale.setExactFit(false);
        //game.scale.pageAlignHorizontally = true;
        game.scale.refresh();
        
        world_height = game.world.height;
        world_width  = game.world.width;
        
        game.state.start('Loader', true, false);
    }
};

/**
 * Loads all game assets
 */
function Loader()
{
    this.preload = function() 
    {
        var bar = game.add.sprite(400, 300, 'load_bar');
        game.load.setPreloadSprite(bar);
        
        game.load.image('title'             , '/game-files/res/assets/massacre-logo-216x182.png');
        game.load.image('play'              , '/game-files/res/assets/play-128x64.png');
        game.load.image('rate'              , '/game-files/res/assets/rate-128x64.png');
        game.load.image('trophy'            , '/game-files/res/assets/trophy-64x64.png');
        game.load.image('sky'               , '/game-files/res/assets/blue-960x640.png');
        game.load.image('clouds'            , '/game-files/res/assets/clouds-2048x1024.png');
        game.load.image('hill'              , '/game-files/res/assets/hill.png');
        game.load.image('hills'             , '/game-files/res/assets/hills-2048x1024.png');
        game.load.image('small_bullet'      , '/game-files/res/assets/small-bullet.png');
        game.load.image('rocket'            , '/game-files/res/assets/rocket-20x14.png');
        game.load.image('small_mg'          , '/game-files/res/assets/small-machine-gun.png');
        game.load.image('roof'              , '/game-files/res/assets/roof.png');
        game.load.image('shield_p_u'        , '/game-files/res/assets/shield-power-38x38.png');
        game.load.image('invinc_p_u'        , '/game-files/res/assets/invincibility-38x38.png');
        game.load.image('rocket_p_u'        , '/game-files/res/assets/rocket-power-38x38.png');
        game.load.image('ground'            , '/game-files/res/assets/ground-512x32.png');
        //game.load.image('ufo'               , '/game-files/res/assets/ufo-50x50.png');
        game.load.image('textbox'           , '/game-files/res/assets/text-block-300x50.png');
        game.load.spritesheet( 'player'     , '/game-files/res/assets/plane-768x42.png', 128,42);
        game.load.spritesheet( 'explosion'  , '/game-files/res/assets/explode.png', 128, 128 );
        game.load.spritesheet( 'ufo'        , '/game-files/res/assets/ufo-200x50.png', 50,50, 4);
        //game.load.spritesheet( 'duck'       , '/game-files/res/assets/chick.png'  , 48,  54  );
        game.load.spritesheet( 'tank'	    , '/game-files/res/assets/tank.png', 100, 100, 3);

        getHighscore();
    }
    
    this.create = function()
    {
        game.state.start('Menu', true, false);
    }
};

/**
 * Start menu
 */
function Menu()
{
    var play;
    var rate;
    var trophy;
    var title;
    
    this.create = function()
    {
          // create sky and ground
        sky = game.add.sprite(0,0,'sky');
        clouds = game.add.tileSprite(0,0, 2048,1024,'clouds');
        clouds.autoScroll(-sky_vel,0);
        
        hills = game.add.tileSprite(0,0, 2048, 1024, 'hills');
        hills.autoScroll(-hill_vel,0);
        
        platforms = game.add.group();
        platforms.enableBody = true;
        ground = game.add.tileSprite(0,608, 1024, 32, 'ground');
        ground.autoScroll(-ground_vel,0);
        platforms.add(ground);
        world_height = 608;
        ground.body.immovable = true;
        var roof   =  platforms.create(0,0,'roof');
        roof.body.immovable = true;
        
        // add menu
        title  = game.add.sprite((world_width-216)/2,200,'title');
        play   = game.add.button(world_width/2 -100-128, 440, 'play',
                                 this.playCallback, this);
        trophy = game.add.button(world_width/2 -32, 440, 'trophy',
                                 this.achievementCallback, this);
        rate   = game.add.button(world_width/2 +100, 440, 'rate',
                                 this.rateCallback, this);

        if( highscore )
        {
            var text = game.add.text(world_width/2, 520,"High Score: " + highscore,
                {font: "32px Terminal", fill:"#000000",align:"center"});
            text.anchor.x=0.5;
        }
        
    }
    
    this.playCallback = function()
    {
        title.kill();
        play.kill();
        rate.kill();
        trophy.kill();
        game.state.start('Game', false, false);
    }
    
    this.achievementCallback = function()
    {
        
    }
    
    this.rateCallback = function()
    {
        
    }
};

/**
 * The game
 * This is where the magic happens
 */
function Game()
{

    /*
     * Creates the game
     * In this function we create all groups of objects
     * and animations and start up the game
     */
    this.create = function() 
    {
        // initialize world
        game.physics.startSystem(Phaser.Physics.ARCADE);

        game.world.setBounds( 0, 0, game.world.height, game.world.width );
    
        // create sky and ground
        sky = game.add.sprite(0,0,'sky');
        clouds = game.add.tileSprite(0,0, 2048,1024,'clouds');
        clouds.autoScroll(-sky_vel,0);
        
        hills = game.add.tileSprite(0,0, 2048, 1024, 'hills');
        hills.autoScroll(-hill_vel,0);
        
        platforms = game.add.group();
        platforms.enableBody = true;
        ground = game.add.tileSprite(0,608, 1024, 32, 'ground');
        ground.autoScroll(-ground_vel,0);
        platforms.add(ground);
        world_height = 608;
        ground.body.immovable = true;
        var roof   =  platforms.create(0,0,'roof');
        roof.body.immovable = true;
        
        // create player
        player = game.add.sprite(50, world_height/2, 'player');
        player.animations.add('move', [0,1]);
        player.animations.add('shield', [4,5]);
        player.animations.add('invincible', [0,1,0,1,2,3,2,3]);
        player.play('move', 30, true, false);
        game.physics.enable(player, Phaser.Physics.ARCADE);
        player.body.collideWorldBounds = true;
        player.anchor.setTo(0.5, 0.5);      
                
        //////////////////////////// NOTE
        // all of the objects from here on in have a nested group structure
        // there is a parent group for the type of objects (bullets, enemies, etc)
        // which contains a group for each class of bullet/enemy/whatever
        // each class has a single object that holds the attributes and functions
        // for each class
        
        // make all the bullets
        bullets = game.add.group();
        bullets.enableBody = true;
        bullets.physicsBodyType = Phaser.Physics.ARCADE;
        for ( var x in bullet_list )
        {
            bullet_list[x].group = game.add.group();
            bullet_list[x].group.createMultiple( 50, bullet_list[x].sprite );
            bullets.add(bullet_list[x].group);
            bullet_list[x].group.forEach(bullet_list[x].init, this);
        }
           
        cur_bullet = small_bullet;
        
        enemy_bullets = game.add.group();
        enemy_bullets.enableBody = true;
        enemy_bullets.physicsBodyType = Phaser.Physics.ARCADE;
        for ( var x in enemy_bullet_list )
        {
            enemy_bullet_list[x].group = game.add.group();
            enemy_bullet_list[x].group.createMultiple( 50, enemy_bullet_list[x].sprite );
            enemy_bullets.add(enemy_bullet_list[x].group);
            enemy_bullet_list[x].group.forEach(enemy_bullet_list[x].init, this);
        }
    
        // make all the enemies
        enemies = game.add.group();
        enemies.enableBody = true;
        enemies.physicsBodyType = Phaser.Physics.ARCADE;
        for ( var x in enemy_list )
        {
            enemy_list[x].group = game.add.group();
            enemy_list[x].group.createMultiple( 20, enemy_list[x].sprite, 0 );
            enemies.add(enemy_list[x].group);
            enemy_list[x].group.forEach(enemy_list[x].init, this);
        }
    
        // create the explosion animations
        explosions = game.add.group();
        explosions.createMultiple(30, 'explosion');
        explosions.forEach(function(explosion){
            explosion.anchor.x = 0.5;
            explosion.anchor.y = 0.5;
            explosion.animations.add('explosion');
        }, this);
        
        // create the power ups
        power_ups = game.add.group();
        power_ups.enableBody = true;
        power_ups.physicsBodyType = Phaser.Physics.ARCADE;
        for ( var x in power.list )
        {
            power.list[x].group = game.add.group();
            power.list[x].group.createMultiple( 3, power.list[x].sprite );
            power_ups.add(power.list[x].group);
            power.list[x].group.forEach(power.list[x].init, this);
        }
        
        // create the spawn timer for power ups
        next = game.rnd.integerInRange( power.spawn_min, power.spawn_max );
        game.time.events.add( next * Phaser.Timer.SECOND, power.spawn );
    
        // create the spawn timer for each enemy
        for (var x in enemy_list)
        {
            var next = game.rnd.integerInRange(enemy_list[x].spawn_min,
                                               enemy_list[x].spawn_max);
            game.time.events.add(Phaser.Timer.SECOND * next,
                                 enemy_list[x].spawn, enemy_list[x]);
        }
        
        // add input
        game.input.addPointer();
        game.input.addPointer();
        game.input.multiInputOverride = true;
        
        player.bringToTop();
    
        // initialize score
        score = 0;
        score_text = game.add.text(20, 10,"Score: " + score,
                {font: "12px Arial"});
        
        // initialize ammo text
        ammo_text = game.add.text(100,10, "Ammo: "+ getAmmo(),
                {font: "12px Arial"});
        
        shield_text = game.add.text(240,10, "shields off",
                {font: "12px Arial"});
         
        console.log('starting game');
        
    };
    
    /*
     * This is where most of the work happens, this function is called
     * at every frame of the game, and this is what drives the game
     *
     * I don't like the number of overlap/collide calls at the beginning,
     * but I think it's necessary
     */
    this.update = function() 
    {        
        // don't let the player go underground
        game.physics.arcade.collide( player, platforms );
    
        // check if enemies are shot
        for ( var x in bullet_list )
            for ( var y in enemy_list )
                game.physics.arcade.overlap( bullet_list[x].group,
                        enemy_list[y].group, enemyHit, null, enemy_list[y] );
        
        // check if player is shot
        for ( var x in enemy_bullet_list )
            game.physics.arcade.overlap(player, enemy_bullet_list[x].group,
                                        playerHit, null, this);
    
        // check enemy collisions with the player, the ground/roof, and other enemies
        for ( var x in enemy_list )
        {
            game.physics.arcade.overlap(player,enemy_list[x].group,
                                        playerHit, null, this);
            game.physics.arcade.overlap(enemy_list[x].group, enemies,
                                        changeY, null, this);
            if (enemy_list[x].flies)
                game.physics.arcade.overlap(enemy_list[x].group, platforms,
                                            changeY, null, this);
            else
                game.physics.arcade.collide(enemy_list[x].group, platforms);
        }
        
        // check if the player picked up a power up
        for ( var x in power.list )
        {
            game.physics.arcade.overlap(player, power.list[x].group,
                                        power.list[x].apply_power, null, power.list[x]);
        }
        
        // smoothly stop the player's motion
        player.body.velocity.y *= 0.95;
        player.rotation *=0.95;
        
        // handle input: move player/fire bullets
        if( game.input.activePointer.isDown )
        {
            var deltaY = game.input.activePointer.y-player.body.y;
            player.body.velocity.y = deltaY/ (world_height/2) *maxvel;
            
            player.rotation = Math.atan2(deltaY, game.input.activePointer.x - player.body.x);
    
            fire(cur_bullet);
            
        }
        
        // update texts
        score_text.setText("Score: "+score);
        if(shield)
            shield_text.setText("shields on");
        else
            shield_text.setText("shields off");    
    };
    
    //// debugging
    //this.render = function()
    //{
    //    game.debug.inputInfo(100,100)
    //}
};

/**
 * State that is displayed at Game Over
 * Basically display score and restart game
 */
function Finish()
{
    this.create = function()
    {

        var str, scorebox;
        scorebox = game.add.group()
        var box = game.add.sprite(world_width+300,200,'textbox');        
        box.scale.setTo(2,2);
        box.anchor.setTo(0.5,0.5);
        if(score > highscore)
        {
            str = "New Highscore!\nScore: "+ score;
            setHighscore(score);
            highscore = score;
        }
        else
        {
            str = "Score: "+score+"\nHighscore: "+highscore;    
        }
        var txt = game.add.text( box.x, box.y,str,
                      {font: "32px Terminal", fill:"#000000", align:"center"});
        
        txt.anchor.setTo(0.5,0.5);
        scorebox.add(box);
        scorebox.add(txt);
        game.add.tween(scorebox).to({x:-world_width/2 - 300},800, null, true);
    
         
    }
    
    this.update = function()
    {
        if ( game.input.activePointer.isDown )
        {
            console.log('Game updating');
            game.state.start('Game');
        }
    }
};

