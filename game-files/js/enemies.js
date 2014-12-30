// global references
var enemies;
var explosions;
var enemy_bullets;

var enemy_small_bullet =
{
    sprite:         'small_bullet',
    group:          null,
    velocity:       500,
    fire_rate:      2 * Phaser.Timer.SECOND,
    init:           function(unit)
    {
        unit.checkWorldBounds   = true;
        unit.outOfBoundsKill    = true;
        unit.body.allowRotation = true;
        unit.anchor.setTo(0.5,0.5);
    },
    spawn:     function(enemy)   //TODO: Don't let enemies fire when they are under the player
    {
        if( !enemy.alive || enemy.x < player.x + 100 )
        {
            return;
        }
        
        if(this.group.countDead() > 0 )
        {
            var bullet = this.group.getFirstDead();
            bullet.reset(enemy.x, enemy.y);
            game.physics.arcade.moveToObject(bullet, player, this.velocity);
            bullet.rotation = game.physics.arcade.angleToXY(bullet, player.x, player.y);
        }
        
        game.time.events.add( this.fire_rate, this.spawn, this, enemy );    
    }
}

/*
 * UFO enemy
 * weak, flying, no fire
 */
var ufo = 
{
    sprite:         'ufo',
    damage_tween:   null,
    move:           [0,1,2,3],
    group:          null,
    max_health:     50,
    xvel:           1.5*ground_vel,
    yvel:           150,
    spawn_min:      0.75,
    spawn_max:      3,
    bullets:        null,
    flies:          true,
    init:           function(unit)
    {
        unit.checkWorldBounds = true;
        unit.outOfBoundsKill  = true;
        unit.health = this.max_health;
        unit.animations.add('move', [0,1,2,3]);

    },
    spawn:          function()
    {
        if (this.group.countDead() > 0)
        {
            var enemy = this.group.getFirstDead();

            var height = game.rnd.integerInRange(0, world_height-enemy.body.height);

            enemy.reset( world_width, height, this.max_health );

            enemy.body.velocity.x = -this.xvel * vel_mod;
            if (height %2 == 0) 
                enemy.body.velocity.y = -this.yvel;
            else
                enemy.body.velocity.y = this.yvel;
            if( enemy.animations.getAnimation('move') ==null)
                throw "no animation";
            enemy.play('move', 2, true, false);
        }
        else 
            console.log('No enemies dead');
    
        var next = game.rnd.integerInRange( this.spawn_min, this.spawn_max );
        game.time.events.add( Phaser.Timer.SECOND * next, this.spawn, this );
    }
}

/*
 * Duck Enemy
 * strong, no fly, fires
 */
var tank =
{
    sprite:         'tank',
    damage_tween:   null,
    move:           [0, 1, 2, 3],
    group:          null,
    max_health:     500,
    xvel:           ground_vel + 30,
    yvel:           0,
    spawn_min:      15,
    spawn_max:      20,
    next:           0,
    bullets:        enemy_small_bullet,
    flies:          false,
    init:           function(unit)
    {
        unit.checkWorldBounds = true;
        unit.outOfBoundsKill  = true;
        unit.health = this.max_health;
        unit.anchor.setTo(0.5, 0.5);
        unit.animations.add('move', this.move);

    },
    spawn:          function()
    {
        if (this.group.countDead() > 0)
        {
            var enemy = this.group.getFirstDead();
            var height = world_height - enemy.body.halfHeight + 15;
                
            enemy.reset( world_width, height, this.max_health );
            enemy.frame = 0;
            enemy.body.velocity.x = -this.xvel * vel_mod;
            
            enemy.play('move', 10, true, false);
                
            game.time.events.add( this.bullets.fire_rate, this.bullets.spawn, this.bullets, enemy );    
        }
        else 
            console.log('No enemies dead');
    
        var next = game.rnd.integerInRange( this.spawn_min, this.spawn_max );
        game.time.events.add( Phaser.Timer.SECOND * next, this.spawn, this );
    }
}

var enemy_list = [ufo, tank]

var enemy_bullet_list = [enemy_small_bullet];

/**
 * DEPRECATED
 */
function spawnEnemy(type)
{
    console.log('Should not be in spawnEnemy')
        throw "error";
    if (type.group.countDead() > 0)
    {
        var height;
        var enemy = type.group.getFirstDead();

        if ( type.flies )
            height = game.rnd.integerInRange(0, world_height-enemy.body.height);
        else
            height = 400;
        enemy.reset( world_width, height, type.max_health );
        enemy.frame = 0;
        enemy.body.velocity.x = -type.xvel * vel_mod;
        if (height %2 == 0) 
            enemy.body.velocity.y = -type.yvel;
        else
            enemy.body.velocity.y = type.yvel;
        
        if (type.move)
            enemy.play('move', 10, true, false);
            
        if ( type.bullets )
        {
            game.time.events.add( type.bullets.fire_rate, enemyFire, null, this, type.bullets, enemy );    
        }
    }
    else 
        console.log('No enemies dead');

    type.next = game.rnd.integerInRange( type.spawn_min, type.spawn_max );
    game.time.events.add( Phaser.Timer.SECOND * type.next, spawnEnemy, null, type );
}

/**
 * Callback for collision between a player's bullet and an enemy
 */
function enemyHit( bullet, enemy )
{
    bullet.kill();

    enemy.damage(bullet.health);
    score += 1;

    if(enemy.health <=0 )
    {
        var explosion = explosions.getFirstExists( false );
        explosion.reset( enemy.body.x, enemy.body.y );
        explosion.play( 'explosion', 30, false, true );
        score += this.max_health;
    }
    else
    {
        if( enemy.damage_tween )
        {
            //if(!enemy.damage_tween.isRunning)
            //{
                enemy.damage_tween.resume();
            //}
        }
        else
        {
            enemy.damage_tween = game.add.tween(enemy).to({ alpha: 0.3}, 25,Phaser.Easing.Linear.None,
                true,0,Number.MAX_VALUE,true);
            enemy.damage_tween.bool=false;
            enemy.damage_tween.onLoop.add(function()
                {if(this.bool)this.pause();this.bool = !this.bool;} //NASTY!!
                        ,enemy.damage_tween );
        }
       
    }
}

/**
 * Bounce the enemy(ies) off of whatever they collided with
 * Currently when two enemies collide they both bounce opposite directions
 */
function changeY(obj1, obj2)
{
    obj1.body.velocity.y = -obj1.body.velocity.y;
    obj2.body.velocity.y = -obj2.body.velocity.y;

    // sometimes the two objects overlap in the next frame and it causes them to stick
    // this should prevent that
    if(obj1.body.velocity.y > 0)
        obj1.body.y += 2;
    else
        obj1.body.y -= 2;
}

/**
 * DEPRECATED
 */
function enemyFire(world, bullet_type, enemy)
{
    console.log('Should not be in enemyFire')
        throw "error";
    if( !enemy.alive )
    {
        return;
    }
    
    if(bullet_type.group.countDead() > 0 )
    {
        var bullet = bullet_type.group.getFirstDead();
        bullet.reset(enemy.x, enemy.y);
        game.physics.arcade.moveToObject(bullet, player, bullet_type.velocity);
    }
    
    game.time.events.add( bullet_type.fire_rate, enemyFire, null, this, bullet_type, enemy );    

}
