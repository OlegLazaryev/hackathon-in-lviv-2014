// Constructor
function Tile(x, y) {
    // always initialize all instance properties
    this.clickerId = null; // default value
    this.x = x
    this.y = y

    this.setRandomCoords = function(){
        var getRandomInt = function(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        this.x = getRandomInt(1, 9) * 0.1
        this.y = getRandomInt(1, 9) * 0.1
    }
}
// class methods
Tile.prototype.classFunc = function() {

};
// export the class
module.exports.Tile = Tile;