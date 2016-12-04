function Event( sender ) {
    
    this.sender = sender;
    this.subscribers = [];
    
};

Event.prototype.attach = function( subscribeFunction ) {
    this.subscribers.push( subscribeFunction );
}

Event.prototype.notify = function( object ) {
    for( var i = 0; i < this.subscribers.length; ++i ) {
        this.subscribers[ i ]( this.sender, object );
    }
}