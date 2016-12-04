
var game = null;
var model = new Model();

var controller = {
    
    model: null,
    view: null,
    game: null,
    gameOn: false,
    cursors: null,
    
    init: function() {
        this.game = game;
        this.model = model;
        this.view = view;
        this.gameOn = true;
    },
    
    preload: function() {
        game.load.image('logo', 'phaser.png');
        game.load.image('wall', 'wall.png');
        game.load.image('player', 'player.png');
    },

    create: function () {
        var logo = this.game.add.sprite( this.game.world.centerX, this.game.world.centerY, 'logo');
        logo.anchor.setTo(0.5, 0.5);
        var self = controller;
        
        setTimeout( function() {
            
            game.world.removeAll();
            game.physics.startSystem( Phaser.Physics.ARCADE );
            
            model.init();
            view.init( model.level );
            
            self.cursors = game.input.keyboard.createCursorKeys();
        }, 1000 );
    },
    
    update: function() {
        
        var self = controller;
        if( self.gameOn && self.cursors ) {
            
            // See if win conditions are met.
            if( self.model.guard.location.x === self.model.player.location.x && 
                self.model.guard.location.y === self.model.player.location.y )
                self.guardSnatch();
            if( self.model.player.location.x === self.model.goalLocation.x &&
                self.model.player.location.y === self.model.goalLocation.y )
                self.endTouched();
            
            
            // Update the player.
            if( self.cursors.right.isDown ) {
                self.model.player.movePlayer( { x: 1 });
            }
            else if( self.cursors.left.isDown ) {
                self.model.player.movePlayer( { x: -1 });
            }
            else if( self.cursors.up.isDown ) {
                self.model.player.movePlayer( { y: -1 } );
            }
            else if( self.cursors.down.isDown ) {
                self.model.player.movePlayer( { y: 1 });
            }
            
            // Update the guard.
            self.model.guard.update();
            
            // See if conditions are matched.
        
            // Update the view.
            self.view.update();
        }
    },
    
    
    endTouched: function() {
        game.destroy();
        alert('Victoryy!!');
    },
    
    guardSnatch: function() {
        game.destroy();
        alert('You lost!');
    }
}

window.onload = function() {
    
    game = new Phaser.Game( view.window.width, view.window.height, Phaser.AUTO,
        'game',
        { preload: controller.preload, create: controller.create, update: controller.update });
    controller.init();
};