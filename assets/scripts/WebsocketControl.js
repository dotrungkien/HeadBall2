import { PlayerData, KEY_CONNECTED, KEY_READY, KEY_INGAME,KEY_BALL } from './GameDefine';
import PalyerA from './PlayerA';

cc.Class({
    extends: cc.Component,

    ctor: function () {
        this.websocket = null;
        this.isConnected = false;
        this.player = PalyerA;
        this.playerDataMe = null;
        this.playerDataRivel = null;
        this.ballData = null;
    },
    properties: {
        prefab_Player: { 
            default: null,
            type: cc.Prefab
        },

        prefab_Me: { 
            default: null,
            type: cc.Prefab
        },

        prefab_Ball: {
            default: null,
            type: cc.Prefab
        }

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.director.getPhysicsManager().enabled = true;
    },

    start () {
        // this.websocket = new WebSocket("ws://127.0.0.1:8080");
        this.websocket = new WebSocket("ws://192.168.19.28:8080");
        var self = this;
        this.websocket.onopen = function (evt) {
            // cc.log(evt);
            self.isConnected = true;
        };

        this.websocket.onmessage = function (evt) {
            console.log('data: ' + evt.data);
            let playerdata = JSON.parse(evt.data);
            if(playerdata.key != undefined && playerdata.key == KEY_CONNECTED) {
                if(playerdata.type == 'ME'){
                    self.playerDataMe = playerdata;
                    self.playerDataMe.node = cc.instantiate(self.prefab_Me);
                    if (self.playerDataMe.index == 2) {
                        self.playerDataMe.node.x = 150;
                        self.playerDataMe.node.scaleX *= -1;
                    } 
                    self.node.addChild(self.playerDataMe.node);
                    console.log("connect succes to server");
                }
                if(playerdata.type == 'RIVAL') {
                    // Player Competitor
                    self.playerDataRivel = playerdata;
                    self.playerDataRivel.node = cc.instantiate(self.prefab_Player);
                    if (self.playerDataRivel.index == 2) {
                        self.playerDataRivel.node.x = 150;
                        self.playerDataRivel.node.scaleX *= -1; 
                    }
                    self.node.addChild(self.playerDataRivel.node);
                    console.log(`rival: ${self.playerDataMe.id} vs ${self.playerDataRivel.id}` );
                }
                if (playerdata.type == 'RIVAL_BALL') {
                    // Ball
                    self.ballData = playerdata;
                    self.ballData.node = cc.instantiate(self.prefab_Ball);
                    self.node.addChild(self.ballData.node);
                }
                if(playerdata.type == KEY_INGAME) {
                    console.log(`data rivel: x=${playerdata.x}`);
                    self.playerDataRivel.x = playerdata.x;
                }
                if(playerdata.type == KEY_BALL) {
                    console.log(`data ball: x=${playerdata.x}, y=${playerdata.y}`);
                    self.ballData.x = playerdata.x;
                }
            }
            for(let i = 0 ; i < playerdata.length; i ++) {
                if(playerdata[i].id != null && playerdata[i].id == self.playerDataRivel.id) {
                    self.playerDataRivel.node.x = playerdata[i].x;
                    self.playerDataRivel.node.y = playerdata[i].y;
                    console.log(self.playerDataRivel.node.x);
                }

                if(playerdata[i].playerId != null && playerdata[i].playerId == self.ballData.playerId) {
                    self.ballData.node.x = playerdata[i].x;
                    self.ballData.node.y = playerdata[i].y;
                    console.log(self.ballData.node.x);
                }
            }
        };

        this.websocket.onclose = function (event) {
            console.log("Closed ");
            self.isConnected = false;
        }
        
    },

    update (dt) {
        if(this.isConnected == false) 
            return;
    },

    Send(data) {
        if(this.websocket != null && this.isConnected == true)
        this.websocket.send(data);
    }
});
