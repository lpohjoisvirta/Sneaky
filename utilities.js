var utilities = {
    createArray: function(length) {
        var arr = new Array(length || 0),
            i = length;
    
        if (arguments.length > 1) {
            var args = Array.prototype.slice.call(arguments, 1);
            while(i--) arr[length-1 - i] = utilities.createArray.apply(this, args);
        }
    
        return arr;
    },
    
    setArrayValues: function( array, value ) {
        
        for( var cell in array ) {
            if( cell.constructor === Array ) {
                utilities.setArrayValues( cell, value );
            }
            else {
                cell = value;
            }
        }
    },
    
    aStar: function( stage, start, goal ) {
        
        // Set of nodes already evaluated.
        var closedSet = new Set();
        var openSet = new Set();
        openSet.add( start );
        
        // Came from map.
        var cameFrom = new Map();
        
        // For each node, the cost of getting from the start to the specific node.
        var gScore = utilities.createArray( stage.length, stage[ 0 ].length );
        utilities.setArrayValues( gScore, Infinity );
        gScore[ start.y ][ start.x ] = 0;
        
        // Total cost of getting from start to goal passing by the name.
        var fScore = utilities.createArray( stage.length, stage[ 0 ].length );
        utilities.setArrayValues( fScore, Infinity );
        fScore[ start.y ][ start.x ] = heuristic_cost_estimate( start, goal );
        
        
        function heuristic_cost_estimate( start, end ) {
            return Math.sqrt( Math.pow( end.x - start.x, 2 ) + Math.pow( end.y - start.y, 2 ) );
        } 
        
        var num = 0;
        while( openSet.size > 0 ) {
            
            // Current is the one with least fScore.
            var current = null;
            var bestScore = Infinity;
            openSet.forEach( function( value ) {
                if( fScore[ value.y ][ value.x ] < bestScore ) {
                    bestScore = fScore[ value.y ][ value.x ];
                    current = value;
                }
            } );
            
            // See if the current is the goal.
            if( current.y === goal.y && current.x === goal.x ) {
                
                // We found it!
                return reconstructPath( cameFrom, current );
            }
            
            if( current === null ) {
                return -2;
            }
            
            // Remove from the open set.
            openSet.delete( current );
            
            // Add to the closed set.
            closedSet.add( current );
            function getNeighbours( position ) {
                var neighbours = new Array();
                var candidates = [ 
                    { x: position.x - 1, y: position.y },
                    { x: position.x, y: position.y - 1 },
                    { x: position.x + 1, y: position.y },
                    { x: position.x, y: position.y + 1 }
                ];
                
                for( var i = 0; i < candidates.length; ++i ) {
                    
                    var candidate = candidates[ i ];
                    if( model.isMovableLocation( candidate ) )
                        neighbours.push( candidate );
                }
                
                return neighbours;
            }
            
            // Go over all the neighbours.
            var neighbours = getNeighbours( current );
            for( var i = 0; i < neighbours.length; ++i ) {
                var neighbour = neighbours[ i ];
                
                // Check if already checked.
                if( closedSet.has( neighbour ) )
                    continue;
                
                // The distance from start to the neighbour.
                var tentativeScore = gScore[ current.y ][ current.x ] + dist_between( current, neighbour );
                
                // Add to open set if not already.
                if( ! openSet.has( neighbour ) ) {
                    openSet.add( neighbour );
                }
                else if( tentativeScore >= gScore[ neighbour.y ][ neighbour.x ] ) {
                    // Check if this path was better.
                    continue;
                }
                
                // This path was the best so far, remember it!
                cameFrom.set( neighbour, current );
                gScore[ neighbour.y ][ neighbour.x ] = tentativeScore;
                fScore[ neighbour.y ][ neighbour.x ] = gScore[ neighbour.y ][ neighbour.x ] + heuristic_cost_estimate( neighbour, goal );
            }
            
            ++num;
            if( num > 10000 )
                return -3;
            
            function dist_between( one, two ) {
                return 1;
            }
            
            function reconstructPath( cameFrom, current ) {
                var total_path = [ current ];
                var processed = current;
                for( var i = 0; i < cameFrom.size; ++i ) {
                    processed = cameFrom.get( processed );
                    if( processed === undefined )
                        break;
                    total_path.push( processed );
                }
                
                return total_path;
            }
            
        }
        
        // Nothing found.
        return -1;
    }
    
};