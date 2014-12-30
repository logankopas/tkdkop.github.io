// global references
var player;
var bullets;
var cur_bullet;
var next_fire = 0;
var power_ups;

var shield = false;
var invinc = false;
var maxvel = 500;

/*
 * The default bullet
 * unlimited, fast, small damage
 */
var small_bullet =
{
    sprite:         'small_mg',
    group:          null,
    velocity:       500,
    fire_rate:      100,
    damage:         20,
    limit_type:     'none',
    init:           function(unit)
    {
        unit.checkWorldBounds   = true;
        unit.outOfBoundsKill    = true;
        unit.body.allowRotation = true;
        unit.health             = this.damage;
        unit.anchor.setTo(0.5,0.5);
        
    }
}

/*
 * Rocket power up bullet,
 * slow, count limited, high damage
 */
var rocket_bullet =
{
    sprite:         'rocket',
    group:          null,
    velocity:       300,
    fire_rate:      1* Phaser.Timer.SECOND,
    damage:         100,
    limit_type:     'count',
    count:          0,
    limit:          10,
    init:           function(unit)
    {
        unit.checkWorldBounds   = true;
        unit.outOfBoundsKill    = true;
        unit.body.allowRotation = true;
        unit.health             = this.damage;
        unit.anchor.setTo(0.5,0.5);
    }
}

/*
 * Power up for rocket bullet
 */
var rocket_power =
{
    sprite:         'rocket_p_u',
    group:          null,
    init:           function(unit)
    {
        power.init(unit);
    },
    apply_power:    function(player, unit)
    {
        console.log('applying rockets');
        unit.kill();
        cur_bullet = rocket_bullet;
        cur_bullet.count = cur_bullet.limit;
    }
    
    ,toString:      function(){return 'rocket power';}
    
}

/*
 * Power up for shield
 */
var shield_power =
{
    sprite:         'shield_p_u',
    group:          null,
    init:           function(unit)
    {
        power.init(unit);
    },
    apply_power:    function(player, unit)
    {
        console.log('applying shields');
        player.play('shield',30,true, false);
        unit.kill();
        shield = true;
        
    }
}

/*
 * Power up for invincibility
 */
var invinc_power =
{
    sprite:         'invinc_p_u',
    group:          null,
    invinc_speed:   8,
    invinc_dur:     10,
    init:           function(unit)
    {
        power.init(unit);
    },
    apply_power:    function(player, unit)
    {
        console.log('applying invincibility');
        unit.kill();
        invinc  = true;
        console.log( this.invinc_speed);
        vel_mod = this.invinc_speed; 
        ground.autoScroll(-ground_vel * vel_mod, 0);
        clouds.autoScroll(-sky_vel    * vel_mod, 0);
        hills .autoScroll(-hill_vel   * vel_mod, 0);
        player.play('invincible', 30, true, false);
        for ( var x in enemy_list )
            enemy_list[x].group.forEachAlive(function(unit)
                                {
                                    unit.body.velocity.x *= this.invinc_speed;
                                    },this);
        for ( var x in enemy_bullet_list)
            enemy_bullet_list[x].group.forEachAlive(function(unit)
                                {unit.body.velocity.x *= this.invinc_speed;},this);
        game.time.events.add( Phaser.Timer.SECOND * this.invinc_dur,
                                        this.end_power, this );
    },
    end_power:      function()
    {
        invinc = false;
        vel_mod /= this.invinc_speed;
        ground.autoScroll(-ground_vel , 0);
        clouds.autoScroll(-sky_vel    , 0);
        hills .autoScroll(-hill_vel   , 0);
        player.play('move',30,true,false);
        for ( var x in enemy_list )
            enemy_list[x].group.forEach(function(unit)
                        {unit.body.velocity.x /= this.invinc_speed;},this);
        for ( var x in enemy_bullet_list )
            enemy_bullet_list[x].group.forEach(function(unit)
                        {unit.body.velocity.x /= this.invinc_speed;},this);
    }
}

/*
 * Power up superclass
 * contains attributes and init function
 * for all power ups
 */
var power =
{
    velocity:       150,
    spawn_min:      10,
    spawn_max:      20,
    list:           [rocket_power, shield_power, invinc_power],
    init:           function(unit)
    {
        unit.checkWorldBounds   = true;
        unit.outOfBoundsKill    = true;
    },
    // spawns a random power up and sets timer for next power up
    spawn:          function()
    {
        // if you are invincible, power ups don't spawn
        if( !invinc )
        {
            var i = game.rnd.integerInRange(0, power.list.length-1);
            if (power.list[i].group.countDead() > 0)
            {
                
                var p = power.list[i].group.getFirstDead();
                var height = game.rnd.integerInRange(0, world_height-p.body.height);
            
                p.reset( world_width, height );
                p.body.velocity.x = -power.velocity;
            }
            else
                console.log('No powers available');
            
        }
        
        var next = game.rnd.integerInRange( power.spawn_min, power.spawn_max );
        game.time.events.add( next * Phaser.Timer.SECOND, power.spawn );
    }
}

var bullet_list = [small_bullet, rocket_bullet];

/*
 * Fires a bullet from the player to the pointer
 */
function fire(bullet_type)
{

    if(game.time.now > next_fire && bullet_type.group.countDead() > 0)
    {
        next_fire = game.time.now + bullet_type.fire_rate;
        var bullet = bullet_type.group.getFirstDead();
        bullet.reset(player.body.right, player.y+player.angle, bullet_type.damage);
        bullet.angle = player.angle;
        game.physics.arcade.moveToPointer(bullet, bullet_type.velocity);
        if( cur_bullet.limit_type === 'count' )
        {
            cur_bullet.count --;
            if( cur_bullet.count < 1)
                cur_bullet = small_bullet;               
        }
    
        // update text
        ammo_text.setText("Ammo: " + getAmmo());
    }
}

/*
 * Callback if plater is hit
 */
function playerHit(player, enemy)
{

   
    
    if( invinc )
    {   
        score += enemy.health;
        var explosion = explosions.getFirstExists( false );
        explosion.reset( enemy.body.x, enemy.body.y );
        explosion.play( 'explosion', 30, false, true );
        enemy.kill();
        return;
    }
    if( shield )
    {
        shield = false;
        var explosion = explosions.getFirstExists( false );
        explosion.reset( enemy.body.x, enemy.body.y );
        explosion.play( 'explosion', 30, false, true );
        enemy.kill();
        player.play('move',30, true, false);
        return;
    }
  
    game.time.events.removeAll();
    var explosion = explosions.getFirstExists(false);
    explosion.reset( player.body.x, player.body.y );
    explosion.scale.setTo(3,3);
    explosion.play(  'explosion', 20, false, true );
    pauseAll();
    explosion.animations.getAnimation('explosion').onComplete.addOnce(function()
        {
            resumeAll();
            game.state.start('Finish',false, false);
        },this);
    player.kill();


}

function pauseAll()
{
    for ( var x in enemy_list )
        enemy_list[x].group.setAll('body.moves', false);
    for ( var x in power.list )
        power.list[x].group.setAll('body.moves', false);
    for ( var x in enemy_bullet_list )
        enemy_bullet_list[x].group.setAll('body.moves', false);
    for ( var x in bullet_list )
        bullet_list[x].group.setAll('body.moves', false);
}

function resumeAll(set)
{
    for ( var x in enemy_list )
        enemy_list[x].group.setAll('body.moves', true);
    for ( var x in power.list )
        power.list[x].group.setAll('body.moves', true);
    for ( var x in enemy_bullet_list )
        enemy_bullet_list[x].group.setAll('body.moves', true);
    for ( var x in bullet_list )
        bullet_list[x].group.setAll('body.moves', true);
}

/**
 * Returns a string with the current ammo count or
 * unlimited
 */
function getAmmo()
{
    if (cur_bullet === small_bullet)
        return 'unlimited';
    else
        return cur_bullet.count.toString();
}

    /*
        Deprecated
     */
function spawnHill()
{
    console.log("should not be in spawnHill");
    throw "Error";
    if(hills.countDead()>0)
    {
        var hill = hills.getFirstDead();
        var height = game.rnd.integerInRange(
            world_height-hill.body.height, world_height- 100);
        hill.reset( world_width, height );
        hill.body.velocity.x = -hill_vel;
    }
    var next = game.rnd.integerInRange(hill_min, hill_max);
    game.time.events.add( next * Phaser.Timer.SECOND, spawnHill, this);}