
function PlayerView() {
    
    this.sprite = null;
    this.faceDirection = 0; // left, right, up, down
    this.busy = false;
    this.framesToGo = 0;
    this.draw = function( location ) {
        model.player.onMove.attach( this.move );
        var loc = view.getCenter( location );
        this.sprite = game.add.sprite( loc.x, loc.y, 'player' );
        this.sprite.scale.setTo( 0.70, 0.70 );
        this.sprite.anchor.setTo( 0.5, 0.5 );
        game.physics.enable( this.sprite, Phaser.Physics.ARCADE );
        this.sprite.body.collideWorldBounds = true;
      
    };
    
    var self = this;
    this.move = function( location, direction ) {
        
        if( !this.busy ) {
            
            function moveTo( direction ) {
                self.busy = true;
                self.framesToGo = 31;
            };
            
            function afterMove() {
            };
            
            if( direction.x > 0 ) {
                
                moveTo( 0 );
                self.sprite.angle = 90;
                self.sprite.body.velocity.x = 2 * view.blockInPixels.width;
                afterMove();
            }
            else if( direction.x < 0 ) {
                moveTo( 1 );
                self.sprite.angle = -90;
                self.sprite.body.velocity.x = -2 * view.blockInPixels.width;
                afterMove();
            }
            else if( direction.y < 0 ) {
                moveTo( 2 );
                self.sprite.angle = 0;
                self.sprite.body.velocity.y = -2 * view.blockInPixels.height;
                afterMove();
                
            }
            else if( direction.y > 0 ) {
                moveTo( 3 );
                self.sprite.angle = 180;
                self.sprite.body.velocity.y = 2 * view.blockInPixels.height;
                afterMove();
            }
        }
    };
    
    this.update = function() {
        if( this.framesToGo > 0 ) {
            this.framesToGo -= 1;
            if( this.framesToGo === 0 ) {
                this.busy = false;
                this.sprite.body.velocity.x = 0;
                this.sprite.body.velocity.y = 0;
            }
        }
    }
}

var view = {
    
    window: { height: 600, width: 800 },
    
    // A unit in pixels.
    blockInPixels: {},
    
    player: new PlayerView(),
    
    guard: {
        sprite: null,
        state: "roaming",
        busy: false,
        framesToGo: 0,
        draw: function( location ) {
            var loc = view.getCenter( location );
            this.sprite = game.add.sprite( loc.x, loc.y, 'player' );
            this.sprite.scale.setTo( 0.75, 0.75 );
            this.sprite.anchor.setTo( 0.5, 0.5 );
            game.physics.enable( this.sprite, Phaser.Physics.ARCADE );
        },
        move: function( location, direction ) {
            
            if( !this.busy ) {
                
                var self = this;
                function moveTo( direction ) {
                    self.busy = true;
                    self.framesToGo = 31;
                };
                
                function afterMove() {
                };
                
                if( direction.x > 0 ) {
                    
                    moveTo( 0 );
                    this.sprite.angle = 90;
                    this.sprite.body.velocity.x = 2 * view.blockInPixels.width;
                    afterMove();
                }
                else if( direction.x < 0 ) {
                    moveTo( 1 );
                    this.sprite.angle = -90;
                    this.sprite.body.velocity.x = -2 * view.blockInPixels.width;
                    afterMove();
                }
                else if( direction.y < 0 ) {
                    moveTo( 2 );
                    this.sprite.angle = 0;
                    this.sprite.body.velocity.y = -2 * view.blockInPixels.height;
                    afterMove();
                    
                }
                else if( direction.y > 0 ) {
                    moveTo( 3 );
                    this.sprite.angle = 180;
                    this.sprite.body.velocity.y = 2 * view.blockInPixels.height;
                    afterMove();
                }
            }
        },
        
        update: function() {
            if( this.framesToGo > 0 ) {
                this.framesToGo -= 1;
                if( this.framesToGo === 0 ) {
                    this.busy = false;
                    this.sprite.body.velocity.x = 0;
                    this.sprite.body.velocity.y = 0;
                }
            }
        }
    },
    
    init: function( level ) {
        
        this.blockInPixels = {
            height: this.window.height / level.size.height,
            width: this.window.width / level.size.width
        };
        
        this.drawWalls( level.stage );
        
        // Create the player.
        this.player.draw( model.player.location );
        
        // Create the guard.
        this.guard.draw( model.guard.location );
    
    },
    
    getCenter: function( block ) {
        return {
            x: block.x * this.blockInPixels.width + this.blockInPixels.width / 2,
            y: block.y * this.blockInPixels.height + this.blockInPixels.height / 2
        }
    },
    
    update: function() {
        this.player.update();
        this.guard.update();
    },
    
    locToViewGraphics: function( location ) {
        return {
            x: location.x * this.blockInPixels.width,
            y: location.y * this.blockInPixels.height
        }
    },
    
    drawWalls: function( stage ) {
        
        var walls = [];
        var graphics = game.add.graphics(0, 0);
                    
        // Go over all the pixels and add the walls.
        for( var row = 0; row < stage.length; ++row ) {
            for( var cell = 0; cell < stage[ row ].length; ++cell ) {
                if( stage[ row ][ cell ] === 1 ) {
                    graphics.lineStyle(2, 0x0000FF, 1);
                    graphics.beginFill(0xFF0000, 1 );
                    var location = this.locToViewGraphics( { x: cell, y: row } );
                    graphics.drawRect( location.x, location.y, this.blockInPixels.width, this.blockInPixels.height );
                    var wall = game.add.sprite( cell * this.blockInPixels.width, row * this.blockInPixels.height, null );
                    game.physics.enable( wall, Phaser.Physics.ARCADE );
                    wall.body.setSize( this.blockInPixels.width, this.blockInPixels.height, 0, 0);
                    wall.body.immovable = true;
                    walls.push( wall );
                }
            }
            
        }
    }
    
};