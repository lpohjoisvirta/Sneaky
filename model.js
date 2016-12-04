
function asMovable( startLocation ) {
    this.onMove = new Event( this );
    this.location = startLocation;
    this.move = function( viewUnit, direction ) {
        
        // Sanity check.
        if( direction.x === undefined && direction.y === undefined )
            throw "Direction needs to have either x or y coordinate.";
        
        // Check if the move is legal.
        if( viewUnit.busy )
            return false;
        var result = {
            x: direction.x ? this.location.x + direction.x : this.location.x,
            y: direction.y ? this.location.y + direction.y : this.location.y
        };
        
        if( ! model.isMovableLocation( result ) )
            return false;
        
        // Move.
        this.location = result;
        
        // We got to move.
        return true;
    }
}

var Player = function( startLocation ) {
    
    asMovable.call( Player.prototype, startLocation );
    this.movePlayer = function( direction ) {
        
        game.debug.text( "Location x: " + model.player.location.x + ", y: " + model.player.location.y, 10, 10 );
        if( ! this.move( view.player, direction ) )
            return;
        
        // Notify about location change.
        this.onMove.notify( direction );
    }
};


var Guard = function( model, startLocation ) {
    asMovable.call( Guard.prototype, startLocation );
    this.state = "guard";
    this.ready = true;
    this.ticksToGo = 0;
    this.guardPattern = [ { x: 9, y: 6 }, { x: 3, y: 5 } ];
    this.latestTarget = null;

    this.playerMove = function( direction ) {
            
        // Follow the unit if we are to catch it.
        if( this.state === "catch" ) {
            this.updateCatchLocation();
            this.update();
        }
    };
    
    model.player.onMove.attach( this.playerMove );
    
    this.updateCatchLocation = function() {
        this.latestTarget = utilities.aStar( model.level.stage, this.location, model.player.location );
        if( this.latestTarget ) this.latestTarget.pop();
        if( this.latestTarget && this.latestTarget[ this.latestTarget.length - 1 ] ) {
            game.debug.text( "A* target: " + this.latestTarget[ this.latestTarget.length - 1 ].y + " " +
                this.latestTarget[ this.latestTarget.length - 1 ].x, 100, 380 );
        }
    }
    
    this.update = function() {
            
        game.debug.text( "upd", 100, 500 );
        if( this.ready ) {
            if( this.state === "catch" ) {
                
                // Get next move.
                if( this.latestTarget ) {
                    var direction = this.latestTarget.pop();
                    if( direction ) {
                        this.ready = false;
                        this.ticksToGo = 31;
                        this.moveGuard( { x: direction.x - this.location.x, y: direction.y - this.location.y } );
                    }
                }
            }
            else if( this.state === "guard" ) {
                
                // Look.
                this.look();
                
                // Get next move in guard pattern.
                if( ! this.latestTarget ) {
                    
                    function locationEquals( location1, location2 ) {
                        return location1.x === location2.x &&
                            location1.y === location2.y;
                    }
                    
                    if( locationEquals( this.location, this.guardPattern[ 0 ] ) || 
                        locationEquals( this.location, this.guardPattern[ 1 ] ) ) {
                        
                        // Get the next place.
                        var loc = locationEquals( this.location, this.guardPattern[ 0 ] ) ?
                            this.guardPattern[ 1 ] : this.guardPattern[ 0 ];
                        this.latestTarget = utilities.aStar( model.level.stage, this.location, loc );
                        this.latestTarget.pop();
                    }
                    
                }
                else {
                    
                    var direction = this.latestTarget.pop();
                    if( direction ) {
                        this.ready = false;
                        this.ticksToGo = 31;
                        this.moveGuard( { x: direction.x - this.location.x, y: direction.y - this.location.y } );
                    }
                    else
                    {
                        // No moves anymore.
                        this.latestTarget = null;
                    }
                }
            }
        }
        else {
            --this.ticksToGo;
            if( this.ticksToGo === 0 ) {
                this.ready = true;
            }
        }
    };
        
    this.look = function() {
        
        // Check if the player is in sight.
        if( model.player.location.x === 3 ) {
            
            this.state = "catch";
            this.updateCatchLocation();
            
        }
    };
        
    this.moveGuard = function( direction ) {
            
        if ( ! this.move( view.guard, direction ) )
            return;
        
        game.debug.text( this.location.y + " " + this.location.x, 100, 450 );
            
        view.guard.move( this.location, direction );
    };
};

var Model = function() {
    
    this.goalLocation = { x: 9, y: 0 };
    this.player = new Player( { x: 0, y: 0 } );
    this.guard = new Guard( this, { x: 9, y: 6 } );
     
    this.level = {
        size: { width: 10, height: 7 },
        stage: null
    };
    
    this.init = function() {
        this.createStage();
        //this.player.init( { x: 0, y: 5 } );
    };
    
    this.update = function() {
      
        // Collision check.
        this.guard.update();
    };
    
    this.createStage = function() {
        
        // Import the stage?
        
        // Create an empty stage.
        this.level.stage = utilities.createArray( this.level.size.height, 
            this.level.size.width );
        for( var i = 0; i < this.level.size.height; ++i ) {
            for( var u = 0; u < this.level.size.width; ++u ) {
                this.level.stage[ i ][ u ] = 0;
            }
        }
        
        // Add the walls.
        this.addWalls( this.level.stage );
    };
    
    this.addWalls = function( stage ) {
        
        for( var u = 2; u < 7; ++u ) {
            stage[ u ][ 2 ] = 1;
        }
        
        for( var u = 1; u < 6; ++u ) {
            stage[ u ][ 4 ] = 1;
        }
        
        for( var u = 0; u < 6; ++u ) {
            stage[ u ][ 6 ] = 1;
        }
        
        for( var u = 6; u < 9; ++u ) {
            stage[ 3 ][ u ] = 1;
        }
    };
    
    this.isMovableLocation = function( location ) {
        
        if( location.x < 0 || location.x >= this.level.size.width ||
            location.y < 0 || location.y >= this.level.size.height )
            return false;
            
        if( this.level.stage[ location.y ][ location.x ] === 1 )
            return false;
        
        // Tests pass.
        return true;
    };
    
};
