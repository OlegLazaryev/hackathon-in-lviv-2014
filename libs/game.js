tiles = require('./tile');

function Game() {
    this.start = function(options){
        this.players = options.players
        this.create_tiles(options.tileCount)
        this.io = options.io
    }

    this.create_tiles = function(tileCount){
        this.tiles = []
        for(var i = 0; i < tileCount; i++) {
            var tile = new tiles.Tile()
            tile.id = i
            tile.setRandomCoords()
            this.tiles.push(tile)
        }
    }

    this.clicked = function(clickData){
        this.tileById(clickData.tile_id).clickerId = clickData.player_id
        this.io.sockets.emit('tile clicked', clickData);
    }

    this.tileById = function(id){
        for(var i = 0; i < this.tiles.length; i++){
            if(this.tiles[i].id == id){
                return this.tiles[i]
            }
        }
    }
}

module.exports.Game = Game;