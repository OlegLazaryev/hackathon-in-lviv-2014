(function($){

    var socket = io.connect(document.location.origin);
  
    // Player

    var Player = function(id) {
        this.id = id;
        this.x  = 0;
        this.y  = 0;
        this.name = '';
        this.init();
    };
    
    Player.prototype = function(){
        var init = function(){
            bind.call(this);
        },
        bind = function(){
            $(document).on( 'mousemove', {PlayerObj:this},(function(event) {
                var player = event.data.PlayerObj;
                player.x = ((event.pageX / $(window).width()) * 100).toFixed(2);
                player.y = ((event.pageY / $(window).height()) * 100).toFixed(2);
                socket.emit('move', { friend: player.id, friendX: player.x, friendY: player.y});
            }));


        };
        return {
            init: init
        };
    }();

    // Friends

    var Friends  = function() {
        this.friends = {};
    };

    Friends.prototype = function(){
        var add = function(friend) {
                var label = doLabel.call(this,friend.id);
                this.friends[label] = friend;
            },
            remove = function(id){
                var label = doLabel.call(this,id);
                if ( this.friends[label] ) {
                    this.friends[label].remove();
                    delete(this.friends[label]);
                }
            },
            update = function(data) {
                var label = doLabel.call(this,data.friend);
                if ( this.friends[label] ) {
                    this.friends[label].update(data.friendX,data.friendY);
                }
            },
            doLabel = function(id){
                return 'friend-'+id;
            };
        return {
            add: add,
            remove: remove,
            update: update
        };
    }();

    // Friend

    var Friend = function(id) {
        this.id = id;
        this.x  = 0;
        this.y  = 0;
        this.dx = 0;
        this.dy = 0;
        this.idx = 'friend-'+id;
        this.name = '';
        this.element = false;
        this.init();
    };

    Friend.prototype = function(){
        var init = function() {
            if  ( check.call(this) === true ) {
                return false;
            }
        },
        create = function() {
            this.element = $('<div/>').attr('id',this.idx).addClass('friend').hide().appendTo('body').fadeIn();
        },
        remove = function() {
            if ( this.element ){
                this.element.fadeOut('200',function(){
                    $(this).remove();
                });
            }
        },
        check = function(){
            if ( $('#'+this.idx).length > 0 ) {
                return true;
            }
            create.call(this);
            return false;
        },
        update = function(x,y) {
            this.element.css({'left':x+'%','top':y+'%'});
        };
        return {
            init: init,
            remove: remove,
            update: update
        };
    }();

    var Tiles = function(tiles) {
        this.tiles = tiles
    }

    Tiles.prototype =  {
        build: function () {
            $('.playground').empty()
            var availableWidth = $('.playground').width()
            var availableHeight = $('.playground').height()
            console.log(availableHeight)
            for(var i = 0; i < this.tiles.length; i++) {
                var rectangle = this.tiles[i]
                $('.playground').append('<div id="' + i + '" class="tile" style="margin-top: ' + availableHeight * rectangle.y + 'px;margin-left: ' + availableWidth * rectangle.x + 'px;"></div>')
            }
            $('.tile').on( 'click', {PlayerObj:this},(function(event) {
                var player = event.data.PlayerObj;
                socket.emit('tile clicked', { tile_id: this.id, player_id: player.id });
            }));
        }
    }

    // Functions

    var Meeting = function(socket) {
        this.player = false;
        this.friends = new Friends();
        this.init();
    };
    
    Meeting.prototype = function(){
        var init = function(){
                bind.call(this);
            },
            bind = function(){
                var self = this;

                // Initalize connected
                socket.on('connected', function (data) {
                    updateTotalConnections(data.connections);
                });

                // Create player and friends
                socket.on('init', function (data) {
                    $.each(data.friends,function(index,item){
                        createFriend.call(self,item,data.player);
                    });
                    self.player = new Player(data.player);
                });

                // New friend
                socket.on('new friend', function (data) {
                    createFriend.call(self,data.friend);
                });

                socket.on('tiles', function (data) {
                    var tiles = new Tiles(data);
                    tiles.build();
                });

                // Friend gonne
                socket.on('bye friend', function (data) {
                    updateTotalConnections(data.connections);
                    removeFriend.call(self,data.friend);
                });

                // Friend move
                socket.on('move', function (data) {
                    self.friends.update(data);
                });

                socket.on('tile clicked', function (data) {
                    $('#'+data.tile_id).css('display', 'none');
                });

                socket.on('game finished', function (data) {
                    if (data.length > 1 && contains(data, self.player.id)) {
                        alert('DRAW, try again to detect a winner!')
                    } else if (contains(data, self.player.id)){
                        alert('You Win!')
                    }else{
                        alert('Sorry, You Loose!')
                    }
                });

            },
            createFriend = function(id,player){
                if ( player && player == id ) {
                    return;
                }
                var friend = new Friend(id);
                if (friend) {
                    this.friends.add(friend);
                }
            },

            contains = function(data, value){
                for(var i=0; i < data.length; i++){
                    if(data[i] === value){
                        return true;
                    }
                }
                return false;
            }

            removeFriend = function(id) {
                this.friends.remove(id);
            },
            updateTotalConnections = function(total){
                $('#connections').html('There are ' + total + ' players! Let fastest wins.');
            };
        return {
            init: init
        };
    }();

    var app = new Meeting(socket);

})(jQuery);
