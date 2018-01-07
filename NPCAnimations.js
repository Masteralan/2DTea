// Made by Alan O'Cull -- AKA Masteralan or @MasterAlan2001
// This is mostly just a list of animations for different NPCs and sprites. Makes coding stuff a lot easier though.
// Implements Sprite Animations; Animation frames have to be manually built-in and defined but the base functions are here.
// Animation files are single, horizontal strips that can be defined here.

var Animations = {
	anims: {
		Andrew: {	//Deer Swordsman
			Idle: {
				frames: 39,
				frameX: 13494/39,	//File resolution divided by number of frames in the animation.
				frameY: 986,		//Height of the animation file
				FPS: 15.625		//Framerate of the animation
			},
			Jump: {
				frames: 20,
				frameX: 10120/20,
				frameY: 1038,
				FPS: 15.625*2
			},
			Fall: {
				frames: 15,
				frameX: 7605/15,
				frameY: 977,
				FPS: 15.625
			},
			Land: {
				frames: 10,
				frameX: 5020/10,
				frameY: 990,
				FPS: 28.571428571*2
			}
		},
		June: {	//Sheep Prismancer
			
		},
		
		
		Shade: {	//Evil spawns of darkness or something
			Idle: {
				frames: 50,
				frameX: 21700/50,
				frameY: 893,
				FPS: 16.625
			},
			Jump: {
				frames: 15,
				frameX: 9045/15,
				frameY: 913,
				FPS: 16.625*2
			},
			Fall: {
				frames: 32,
				frameX: 19200/32,
				frameY: 843,
				FPS: 16.625
			},
			Run: {
				frames: 23,
				frameX: 15824/23,
				frameY: 844,
				FPS: 45
			}
		}
	},
	
	
	FindAnimation: function(npc, anim) {	//Digs for the animation, will log an error if it cannot find one.
		npc = npc || "Andrew";
		anim = anim || "Idle";	//Animation name
		
		var anima = Animations.anims[npc]
		if (anim == undefined) {
			console.log("Could not find animation folder for NPC " + npc);
			return
		} else {
			anima = anima[anim];
			if (anim == undefined) {
				console.log("Could not find animation " + anim + " for NPC " + npc);
				return
			}
		};
		
		return anima
	},
	GetAnimationSizeRatio: function(sprite, npc, anim) {	//Finds the ratio of the sprite size to the animation size--just for keeping stuff together.
		if (sprite == undefined) {return};
		var anima = Animations.FindAnimation(npc || sprite.NPCA, anim);
		if (anima == undefined) {return};
		
		var scaleX = sprite.Size[0]/anima.frameX;
		var scaleY = sprite.Size[1]/anima.frameY;
		sprite.ASR = [scaleX, scaleY];
		console.log(scaleX);
		console.log(scaleY);
		
		return sprite.ASR
	},
	SetAnimation: function(sprite, npc, anim, resize) {
		if (sprite == undefined) {return};
		var anima = Animations.FindAnimation(npc || sprite.NPCA, anim);
		if (anima == undefined) {return};
		
		//Sets the sprite's NPC to the owner of this animation, just in case
		sprite.NPCA = npc;
		
		//Resets animation so it doesn't start mid-animation
		sprite.Frame = 0;
		sprite.FTP = 0;
		sprite.FPS = anima.FPS;
		sprite.Frames = anima.frames;
		
		if (resize !== true && resize !== false) {resize = true};
		if (resize == true) {
			var scaleX = sprite.ASR[0];
			var scaleY = sprite.ASR[1];
			
			var yOffset = sprite.Size[1];
			
			sprite.Resize([scaleX*anima.frameX, scaleY*anima.frameY]);
			
			if (sprite.Velocity !== undefined && sprite.Velocity.falling == false){
				yOffset = (yOffset-sprite.Size[1])/2
				sprite.Position[1] = sprite.Position[1]+yOffset;
			}
		};
		
		sprite.FramePosition[0] = 0;
		sprite.FrameSize = [anima.frameX, anima.frameY];
		sprite.Retexture(("Animations/" + npc + "/" + anim + ".png"));
		sprite.CurrentAnimation = anim;
		sprite.NextAnim = undefined;
		
		return
	}
}
