tiles = require('./tile');

function Game() {
    this.reset = function(options){
        console.log('NEW GAME')
        this.players = options.players
        this.create_tiles(options.tileCount)
        this.io = options.io
        this.clickers = [];
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
        console.log('sssssssss' + clickData.player_id);
        this.clickers.push(clickData.player_id);
        console.log(this.clickers.length)
        console.log(this.tiles.length)
        if (this.clickers.length == this.tiles.length) {
            this.io.sockets.emit('game finished', this.showWinner())
        }
    }

    this.tileById = function(id){
        for(var i = 0; i < this.tiles.length; i++){
            if(this.tiles[i].id == id){
                return this.tiles[i]
            }
        }
    }

    this.showWinner = function() {
      var result = {}
      var winners = []
        var max_result = 0
        for(var i = 0; i < this.players.length; ++i){
            result[this.players[i]] = 0
        }

        for(var i = 0; i < this.clickers.length; ++i){
          result[this.clickers[i]]++
            if(result[this.clickers[i]] == max_result){
                winners.push(this.clickers[i])
            }else if (result[this.clickers[i]] > max_result){
                winners = [this.clickers[i]]
                max_result = result[this.clickers[i]]
            }
      }

//        return result;
        return winners
    }


}

module.exports.Game = Game;