// Made by Alan O'Cull -- Also known as Masteralan or MasterAlan2001
// Based off of a script written by Max O'Cull -- http://max.codefromjames.com/solace/js/physeng

var viewport = document.getElementById("viewport");
var canvas = viewport.getContext("2d");
//var canvas = document.getElementById("canvas");
//var ccontext = canvas.getContext("2d");

var width = window.innerWidth;
var height = window.innerHeight;

var workspace = [];
var gui = [];

var Debug = false;


function CalculateVectors(vertices, scale) {
	vertices = vertices || 4;
	scale = scale || [50,50];
	
	var angle = (360/vertices);
	var v = [];
	
	var odd = false;
	if (Math.floor(vertices/2)*2 !== vertices){odd = true};	//If odd number of sides...
	
	var s = angle/2;
	if (odd == true){s = -90};	//Set angle to -90 so it's rotated to be flat on it's base
	for (var i = 0; i < vertices; i++){
		var vect = Vector.ComputeVector(1, s);	//Finds rotated points, scale doesn't matter as it's adjusted in the next step
		v.push(vect);
		
		s = s + angle;
	};
	
	var hitbox = Vector.GetHitboxCorners(v);				//Finds exact size of polygon hitbox
	var xScale = (hitbox[2][0]-hitbox[0][0])/scale[0];		//Finds ratio between polygon hitbox and requested hitbox size
	var yScale = (hitbox[2][1]-hitbox[0][1])/scale[1];
	
	for (var i = 0; i < vertices; i++) {
		v[i] = Vector.DivideVector(v[i], [xScale, yScale])	//Scales polygon to requested hitbox
	};
	
	return v
};



// Instances -- Base object system that allows for easily creatable objects and such
var Instance = {
	
	Clone: function(obj, origin) {
		if (obj == undefined) {return};
		origin = origin || obj;
		
		var nObj = {};
		if (obj.Class !== undefined) {
			nObj = Instance.New(obj.Class)
		};
		
		for ([n, val] of Object.entries(obj)) {
			
			if (val == origin) {
				val = nObj
			} else if (typeof val === "Object") {
				val = Instance.Clone(val, obj);
			};
			
			if (typeof val === "function") {
				
			} else {nObj[n] = val};
		};
		
		return nObj;
	},
	
	
	CollisionBox: function(name, size, position, rotation, elasticity, friction) {
		var obj = {}
		obj.Name = name || "CollisionBox";
		obj.Size = size || [50,50];
		obj.Position = position || [50,50];
		obj.Rotation = rotation || 0;
		
		obj.Vertices = CalculateVectors(4, obj.Size);
		
		obj.Physics = Physics.SetupPhysics(obj, true, elasticity, friction);
		
		return obj;
	},
	
	New: function(c, name, parentToWorkspace,	size, position, rotation, vertices, color, outline, opacity) {	//Color can be swapped out with texture; Vertices are used for physics regardless
		var obj = {};
		obj.Name = name || "Prop";
		obj.Class = c || "Prop"; c = obj.Class;		//For quick refrencing
		obj.IsPhysical = false;						//Makes for easier object handling in rare cases
		
		
		// Models //
		if (c == "Model") {
			obj.Children = [];
			obj.PrimaryPart = undefined;
			obj.Centerpoint = position || [0,0];
			
			obj.ForChildren = function(callback) {
				for (i = 0; i < obj.Children.length; i++) {
					callback(obj.Children[i])
				};
			};
			obj.GetCenterpoint = function() {
				var points = [];
				
				obj.ForChildren(function(c) {
					points.push(c.Position)
				});
				
				obj.Centerpoint = Vector.Midpoint(points);
				return obj.Centerpoint;
			};
			obj.Relocate = function(pos) {
				var p1 = obj.GetCenterpoint();
				var shift = Vector.Subtract(pos, p1);
				
				obj.ForChildren(function(c) {
					c.Position = Vector.Add(c.Position, shift);
				});
			};
			obj.RotateIndividuals = function(rot) {
				obj.ForChildren(function(c) {
					c.Rotation = c.Rotation + rot;
				});
			};
			
		// Basic Physical Instance//
		} else {
			obj.IsPhysical = true;
			obj.Size = size || [50,50];
			obj.Position = position || [0,0];
			obj.Rotation = rotation || 0;
			obj.Vertices = vertices || 4;
			obj.Opactiy = opacity || 1;
			
			
			// Shapes //
			if (c == "Prop") {
				obj.Color = color || "#000000";
				obj.Outline = outline || undefined;
				
				/* TEXT PROPERTIES
				obj.Font = "serif"
				obj.FontSize = 48
				obj.Text = "Hello world!"
				obj.TextOpacity = 1
				obj.TextColor = color || "#000000";
				*/
				
			// Images/Sprites //
			} else if (c == "Image" || c == "Sprite") {
				obj.Texture = color || "Tree.png";
				
				obj.Retexture = function(texture) {
					if (texture == undefined) {obj.Texture = undefined; return};
					
					var img = new Image();
					img.src = texture;
					obj.Texture = img;
				};
				obj.Retexture(obj.Texture);
			};
			
			if (c == "Sprite") {
				obj.Frame = 0;
				obj.Frames = 10;
				obj.FramePosition = [0,0];
				obj.FrameSize = [50,50];
				obj.ASR = [1,1];	//Animation Size Ratio
				
				//obj.NPCA = "Andrew"	//NPC ID your current animation is linked to
				//obj.NextAnim = "IdleFall"		//ID of animation you want the current one to transition to when it finishes playing
				
				obj.FPS = 30;	//Frames per Second
				obj.FTP = 0;	//Frame Time Passed
				obj.Speed = 1;	//Allows you to alter speed  of animation without touching FPS
				
				obj.Animation = true;
			};
			
			
			// Calculate Vertices
			obj.Resize = function(size, vertices) {
				if (obj == undefined){return};
				obj.Size = size || obj.Size;
				obj.Vertices = vertices || obj.Vertices;
				
				if (typeof obj.Vertices !== "number"){
					obj.Vertices = obj.Vertices.length;
				};
				obj.Vertices = CalculateVectors(obj.Vertices, obj.Size);
			};
			obj.Resize();
		};
		
		
		// Object Functions
		obj.Destroy = function(time) {
			time = time || 0;
				
			window.setTimeout(function() {
				Physics.RemovePhysics(obj);
				SpliceFromTable(obj, workspace);
				
				obj = undefined;
			}, time);
		};
		
		
		// Final Touches
		if (parentToWorkspace == true){
			workspace.push(obj);
		};
		
		return obj;
	},
	
	SetupGUI: function(obj, pos, size, xLock, yLock) {
		if (obj == undefined) {return};
		obj.HasGUI = true;
		var g = {
			obj: obj,
			Position: pos || [0.5,0.5],
			Size: size || [.1,.1],
			PositionOffset: [0,0],
			SizeOffset: [0,0],
			AbsolutePosition: [0,0],
			//ScaleTo: undefined,	//GUI will automatically scale to given GUI
			
			xLockS: xLock || false,		//Scale both X and Y size to be proportional of X of screen
			yLockS: yLock || false,
			
			xLockP: xLock || false,		//Scale both X and Y position to be proportional of X of screen
			yLockP: yLock || false,
			
			Hiding: true
		};
		
		g.Hide = function(val) {
			if (val !== true && val !== false){
				if (gui.indexOf(g) == -1){
					val = false
				} else {
					val = true
				};
			};
			
			if (val == true) {
				var n = gui.indexOf(g);
				if (n !== -1) {
					gui.splice(n, 1);
				};
				g.Hiding = true;
			} else if (val == false) {
				gui.push(g)
				g.Hiding = false;
			};
		};
		
		//gui.push(g);
		return g
	}
};


viewport.width = window.innerWidth;
viewport.height = window.innerHeight;
var Camera = {
	Size: [viewport.width, viewport.height],
	Focus: [viewport.width/2, viewport.height/2],
	Scroll: [0,0],
	Subject: undefined,
	Scale: 1,
	
	// Camera Bounds -- Set to undefined for no limit
	CameraXMin: undefined,
	CameraXMax: undefined,
	CameraYMin: undefined,	//Limits up
	CameraYMax: 0,			//Limits down
	
	SetCameraFocus: function(pos){
		Camera.Focus = pos;
		Camera.Scroll = [pos[0] - (Camera.Size[0]/2), pos[1] - (Camera.Size[1]/2)];
	},
	ShiftCamera: function(dir){
		Camera.Focus = Vector.Add(Camera.Focus, dir);
		Camera.Scroll = Vector.Add(Camera.Scroll, dir);
	},
	TweenCamera: function(newPos, t, tween){
		newPos = newPos || [0,0];
		t = t || .5;
		tween = tween || "Cubic";
		
		var startPos = Camera.Focus;
		var ct = 0;
		var StepCamera = function(step){
			ct = ct + step;
			
			var perc = ct/t;
			if (tween !== "Linear"){
				perc = 2*(-Math.pow(perc, 3) + 1.5*Math.pow(perc, 2));
			};
			
			//if (perc > 1){perc = 1};
			console.log(perc);
			
			Camera.SetCameraFocus(Vector.Lerp(startPos, newPos, perc));
			
			if (ct >= t){
				n = StepFunctions.indexOf(StepCamera);
				if (n !== -1) {
					StepFunctions.splice(n, 1);
				};
				console.log("Completed camera lerp!");
			}
		};
		StepFunctions.push(StepCamera);
	},
	
	ResizeViewport: function() {
		viewport.width = window.innerWidth;
		viewport.height = window.innerHeight;
		var oldF = Vector.DivideNum(Camera.Size, 2);
		Camera.Size = [viewport.width, viewport.height];
		var f = Vector.DivideNum(Camera.Size, 2);
		f = Vector.Add(Vector.Add(f, Vector.Subtract(oldF, f)), Camera.Scroll);
		
		Camera.SetCameraFocus(f);
	},
	
	GetZoomedPoint: function(p){
		var m = Vector.Magnitude(p);
		var u = Vector.Unit(p);
		return Vector.MultiplyNum(u, m*Camera.Scale);
	}
};
window.addEventListener("resize", Camera.ResizeViewport);
window.addEventListener("orientationchange", Camera.ResizeViewport);


var Background = {
	Color: "#9cf4f1",
	
	
	// Creats the background tiles that scroll, loops in all directions
	Image: "Backdrop.png",
	
	Size: [512,512],
	ScrollRate: [0.125,0.125],	//Scrolls at this ratio to camera, lags behind/moves ahead
	
	ScrollSpeed: [-50, 0],	//Simulates wind, scrolls at this speed whether idle or not
	ScrollPosition: [0,0],
	
	BaseY: 0,
	
	XFrames: 2,	//Maximum number of backgroudn images that can fit on the screen at once
	YFrames: 2,
	
	UpdateBackground: function(newIMG, size, scrollSpeed) {
		if (newIMG == undefined || newIMG == null) {
			Background.Image = undefined;
			
			return
		};
		
		var img = new Image();
		img.src = newIMG;
		Background.Image = img;
		
		Background.Size = size || Background.Size;
		Background.ScrollRate = scrollSpeed || Background.ScrollRate;
		
		Background.BaseY = viewport.height-Background.Size[1];
		
		Background.XFrames = Math.ceil(viewport.width/Background.Size[0]);
		Background.YFrames = Math.ceil(viewport.height/Background.Size[1]);
	},
	
	
	
	// Creats the floor tiles that scroll, loops really well, only for X axis
	FloorImage: "GrassFloor.png",
	FloorSize: [1024, 250],	//viewport.height*.25
	FloorBaseY: 0,
	FloorXFrames: 0,
	
	UpdateFloor: function(newIMG, size) {
		if (newIMG == undefined || newIMG == null) {
			Background.FloorImage = undefined;
			
			return
		};
		
		var img = new Image();
		img.src = newIMG;
		Background.FloorImage = img;
		
		Background.FloorSize = size || Background.FloorSize;
		Background.FloorBaseY = viewport.height - Background.FloorSize[1];
		
		Background.FloorXFrames = Math.ceil(viewport.width/Background.FloorSize[0]);
	},
	
	
	
	Floor2: undefined,
	
	UpdateFloor2: function(newIMG, size, scroll) {
		if ((newIMG == undefined || newIMG == null) && Background.Floor2 !== undefined) {
			var n = workspace.indexOf(Background.Floor2);
			if (n !== -1) {
				workspace.splice(n, 1);
			};
			Background.Floor2Image = undefined;
			Background.Objects.shift();
			
			return
		};
		
		size = size || [512,250];
		var newFloor = Instance.New("Image", "Floor", false, size, [0, (viewport.height - size[1]/2)], 0, 4, newIMG);
		
		if (Background.Floor2 !== undefined) {
			var n = workspace.indexOf(Background.Floor2);
			if (n !== -1) {
				workspace.splice(n, 1);
			};
		};
		
		Background.Floor2 = newFloor;
		Background.AddObject(newFloor, scroll, true);
	},
	
	
	
	
	
	Objects: [],	//Bacground objects, JUST FOR RENDERING (unless you want to use physics on them and have weird results)
	//Good for trees and such
	AddObject: function(obj, scrollRate, xLoop, yLoop){
		if (obj == undefined) {return undefined};
		var bo = {
			obj: obj,
			scroll: scrollRate || [.5,.5],
			xLoop: xLoop || false,
			yLoop: yLoop || false,
			
			xFrames: Math.ceil(viewport.width/obj.Size[0]),
			yFrames: Math.ceil(viewport.height/obj.Size[1])
		};
		
		Background.Objects.push(bo);
		return bo
	}
};
Background.UpdateBackground(Background.Image);
Background.UpdateFloor(Background.FloorImage);




var Time = {	//For dealing with time slow-downs/speed-ups, tick rates, and other things
	Speed: 1,
	Paused: false
};


canvas.globalAlpha = 1;
canvas.fillStlye = Background.Color;
canvas.setTransform(1, 0, 0, 1, 0, 0);
canvas.textBaseline = "middle";
canvas.lineWidth = 3;
canvas.save();


var StepFunctions = [];
var lastFrame = 0;
function RenderFrame(timestamp){
	var currentFrame = timestamp;
	timestamp = timestamp-lastFrame;
	lastFrame = currentFrame;
	
	var step = (timestamp/1000)*Time.Speed;
	
	if (timestamp < 100) {
		//console.log("Frame at " + timestamp);
		if (Time.Paused !== true){
			Physics.StepPhysics(step);
			for (i = 0; i < StepFunctions.length; i++) {
				StepFunctions[i](step);
			};
		} else if (Time.Paused == true){
			step = 0;
		};
		
		
		// Camera Controls
		if (Camera.Subject !== undefined && Camera.Subject !== null) {
			Camera.SetCameraFocus(Camera.Subject.Position);
		};
		
		// Camera Limiting --	CameraXMin		CameraXMax				CameraYMin		CameraYMax
		if (Camera.CameraXMin !== undefined && Camera.Scroll[0] < Camera.CameraXMin) {
			Camera.Scroll[0] = Camera.CameraXMin;
		} else if (Camera.CameraXMax !== undefined && Camera.Scroll[0] > Camera.CameraXMax) {
			Camera.Scroll[0] = Camera.CameraXMax;
		};
		if (Camera.CameraYMin !== undefined && Camera.Scroll[1] < Camera.CameraYMin) {
			Camera.Scroll[1] = Camera.CameraYMin;
		} else if (Camera.CameraYMax !== undefined && Camera.Scroll[1] > Camera.CameraYMax) {
			Camera.Scroll[1] = Camera.CameraYMax;
		};
		
		var camX = Camera.Scroll[0];
		var camY = Camera.Scroll[1];
		
		var scaleX = Camera.Scale;
		var scaleY = Camera.Scale;
		
		
		// Drawing Objects
		function DrawVertices(v){
			canvas.beginPath();
			
			canvas.moveTo(v[0][0], v[0][1]);
			for (var x = 1; x < v.length; x++) {
				canvas.lineTo(v[x][0], v[x][1]);
			};
			//No line back, auto-closes figure
			
			canvas.closePath();
			return
		};
		function DrawObject(obj, forceRender) {
			var v = obj.Vertices;
			
			if (forceRender !== true && (
				(obj.Position[0] < camX-obj.Size[0]/2 || obj.Position[0]-obj.Size[0]/2 > camX+Camera.Size[0])
				&&
				(obj.Position[1]-obj.Size[1]/2 < camY+Camera.Size[1] || obj.Position[1] < camY+obj.Size[1]/2)
				)){
					
				var hb = Vector.GetHitboxCorners(v);
				if ((hb[3][0] > camX || hb[1][0] < camX+Camera.Size[0]) && (hb[3][1] > camY || hb[1][1] < camY+Camera.Size[1])){
					//console.log(obj.Name + " is offscreen. Skipping rendering!");
					//console.log(hb);
					//console.log(camX, camY, camX+Camera.Size[0], camY+Camera.Size[1]);
					return
				};
			};
			
			//if (zoom !== true && zoom !== false) {zoom = true};
			
			if (obj.IsPhysical == true) {
				canvas.translate(obj.Position[0] - camX, obj.Position[1] - camY);	//Center canvas on object
				//canvas.translate(camX, camY);
				canvas.rotate(obj.Rotation*Radian);	//Rotate canvas according to object's rotation
				if (obj.Opacity < 0){obj.Opacity = 0};
				canvas.globalAlpha = obj.Opacity;
			};
			
			var sx = scaleX;
			var sy = scaleY;
			if (obj.MirroredX == true){
				sx = -sx;
			};
			if (obj.MirroredY == true){
				sy = -sy;
			};
			canvas.scale(sx, sy);
			
			if (obj.Shadow !== undefined){
				var sha = obj.Shadow;
				canvas.shadowColor = sha.Color || "black";
				canvas.shadowBlur = sha.Blur || 0;
				canvas.shadowOffsetX = sha.OffsetX || 0;
				canvas.shadowOffsetY = sha.OffsetY || 0;
			};
			
			if (obj.Class == "Prop") {
				if (v.length+1 > 2) {
					canvas.fillStyle = obj.Color;
					canvas.strokeStlye = obj.Outline;
					
					DrawVertices(v);
					
					canvas.fill();
					
					if (typeof obj.Outline == "string") {
						canvas.lineWidth = obj.OutlineWidth || 3;
						canvas.stroke();
					};
				};
			} else if ((obj.Class == "Image" || obj.Class == "Sprite") && obj.Texture !== undefined) {
				var corner = Vector.Negate(Vector.DivideNum(obj.Size, 2));
				
				if (obj.Class == "Image") {
					canvas.drawImage(obj.Texture, corner[0], corner[1], obj.Size[0], obj.Size[1]);
				} else if (obj.Class == "Sprite") {
					var fps = 1/obj.FPS;
					
					if (obj.Animation == true) {
						obj.FTP = obj.FTP + step*obj.Speed;
						if (obj.FTP >= fps) {
							obj.FTP = obj.FTP - fps;
							obj.Frame++;
							if (obj.Frame >= obj.Frames) {
								obj.Frame = 0;
								
								if (obj.NextAnim !== undefined) {
									Animations.SetAnimation(obj, obj.NPCA, obj.NextAnim, true);
									obj.NextAnim = undefined;
								};
							};
							
							
							obj.FramePosition[0] = obj.FrameSize[0]*obj.Frame;
						};
					};
					
					//var c1 = Camera.GetZoomedPoint(obj.FramePosition);
					//var c2 = Camera.GetZoomedPoint(obj.FrameSize);
					//var c3 = Camera.GetZoomedPoint(corner);
					//var c4 = Camera.GetZoomedPoint(obj.Size);
					canvas.drawImage(obj.Texture,	obj.FramePosition[0],obj.FramePosition[1],	obj.FrameSize[0],obj.FrameSize[1],	corner[0],corner[1],	obj.Size[0],obj.Size[1]);
				};
			} else if (obj.Class == "Model") {
				obj.ForChildren(DrawObject);
			};
			
			if (obj.Text !== undefined && obj.Text !== "") {
				canvas.font = ((obj.FontSize || 48) + "px " + (obj.Font || "serif"));
				canvas.globalAlpha = obj.TextOpacity || 1;
				canvas.fillStyle = obj.TextColor || "#000000";
				canvas.textAlign = obj.TextAlign || "center";
				canvas.textBaseline = obj.textBaseline || "middle";
				
				var textPosX = 0;
				if (canvas.textAlign == "left"){
					textPosX = -obj.Size[0]/2;
				} else if (canvas.textAlign == "right"){
					textPosX = obj.Size[0]/2;
				};
				
				var textPosY = 0;
				if (canvas.textBaseline == "hanging"){
					textPosY = -obj.Size[1]/2;
				};
				
				canvas.fillText(obj.Text, textPosX, textPosY, obj.Size[0]);
			};
			
			if (obj.Shadow !== undefined){
				canvas.shadowColor = "#000000";
				canvas.shadowOffsetY = 0;
				canvas.shadowOffsetX = 0;
				canvas.shadowBlur = 0;
			};
			
			if (obj.SelectionOutline == true){
				canvas.lineWidth = 3;
				canvas.globalAlpha = 1;
				canvas.strokeStyle = "#0cabc3";
				canvas.fillStyle = "#3de6ff";
				
				DrawVertices(v);
				
				canvas.stroke();
				canvas.globalAlpha = 0.25;
				canvas.fill();
			};
			
			if (Debug == true && obj.Velocity !== undefined){
				canvas.setTransform(1, 0, 0, 1, 0, 0);
				canvas.translate(obj.Velocity.truePosition[0] - camX, obj.Velocity.truePosition[1] - camY);
				
				canvas.lineWidth = 2;
				canvas.globalAlpha = 0.25;
				canvas.strokeStyle = "#ff8a00";
				canvas.fillStyle = "#ffac4a";
				
				if (obj.Velocity.HitboxSize !== undefined){
					DrawVertices(Vector.GenerateHitboxFromScale(obj.Velocity.HitboxSize));
				} else {
					DrawVertices(v);
				};
				
				canvas.stroke();
				canvas.globalAlpha = 0.125;
				canvas.fill();
				
				canvas.lineWidth = 5;
				DrawVertices([[0,0], [obj.Velocity.x,obj.Velocity.y]]);
				canvas.globalAlpha = 0.5;
				canvas.stroke();
			};
			
			canvas.restore();
			canvas.setTransform(1, 0, 0, 1, 0, 0);
			canvas.globalAlpha = 1;

			return
		};
		
		
		
		// Backgrounds //
		/*	canvas.beginPath();
		canvas.moveTo(0,0);
		canvas.lineTo(viewport.width,0);
		canvas.lineTo(viewport.width,viewport.height);
		canvas.lineTo(0,viewport.height);
		canvas.closePath();	*/
		
		canvas.restore();
		canvas.fillStyle = Background.Color;
		canvas.fillRect(0,0,viewport.width,viewport.height);
		
		if (Background.Image !== undefined) {		//If background images exsist, draw background according to settings
			if (Background.ScrollSpeed !== [0,0]) {
				Background.ScrollPosition = Vector.Add(Background.ScrollPosition, Vector.MultiplyNum(Background.ScrollSpeed, step));
				
				if (Background.ScrollPosition[0] > Background.Size[0]) {
					Background.ScrollPosition = Background.ScrollPosition[0] - Background.Size[0];
				} else if (Background.ScrollPosition[0] < -Background.Size[0]) {
					Background.ScrollPosition[0] = Background.ScrollPosition[0] + Background.Size[0];
				};
				
				
				if (Background.ScrollPosition[1] > Background.Size[1]) {
					Background.ScrollPosition = Background.ScrollPosition[1] - Background.Size[1];
				} else if (Background.ScrollPosition[1] < -Background.Size[1]) {
					Background.ScrollPosition = Background.ScrollPosition[1] + Background.Size[1];
				};
			};
			
			if (Background.ScrollRate !== [0,0]) {
				var bScroll = Vector.MultiplyVector(Camera.Scroll, Background.ScrollRate);
				var xMP = Math.ceil(bScroll[0]/Background.Size[0]);
				var yMP = Math.ceil(bScroll[1]/Background.Size[1]);
				
				var xPos = (Background.Size[0]*xMP) - bScroll[0];
				var yPos = (Background.Size[1]*yMP) - bScroll[1];
				
				for (var y = -2; y < Background.YFrames; y++) {
					for (var x = -2; x <= Background.XFrames + 1; x++) {
						canvas.drawImage(
							Background.Image,
						
							xPos + (Background.Size[0]*x) + Background.ScrollPosition[0],
							Background.BaseY + yPos + (Background.Size[1]*y) + Background.ScrollPosition[1],
							
							Background.Size[0],
							Background.Size[1]
						);
					}
				}
			} else {
				canvas.drawImage(Background.Image, 0, Background.BaseY, Background.Size[0], Background.Size[1]);
			}
		};
		
		
		
		// Background Objects
		canvas.setTransform(1, 0, 0, 1, 0, 0);
		//canvas.restore();
		for (var i = 0; i < Background.Objects.length; i++){		//Goes through background objects and draws everything
			var props = Background.Objects[i];
			var obj = props.obj;
			camX = Camera.Scroll[0]*props.scroll[0];
			camY = Camera.Scroll[1]*props.scroll[1];
			
			function GetX() {
				return -obj.Size[0]*Math.ceil(camX / obj.Size[0]) + camX;
			};
			function GetY() {
				return obj.Size[1]*Math.ceil(camY / obj.Size[1]) + camY;
			};
			
			if (props.xLoop == false && props.yLoop == false) {
				DrawObject(obj);
			} else if (props.xLoop == true && props.yLoop == false) {
				var xPos = GetX();
				
				for (var x = -1; x <= props.xFrames; x++) {
					camX = xPos - obj.Size[0]*x;
					DrawObject(obj, true);
				}
			} else if (props.xLoop == false && props.yLoop == true) {
				var yPos = GetY();
				
				for (var y = -2; y < props.yFrames; y++) {
					camY = yPos + obj.Size[1]*y;
					DrawObject(obj, true);
				}
			} else if (props.xLoop == true && props.yLoop == true) {
				var xPos = GetX();
				var yPos = GetY();
				
				for (var y = -2; y < props.yFrames; y++) {
					camY = yPos + obj.Size[1]*y;
					for (var x = -1; x <= props.xFrames; x++) {
						camX = xPos - obj.Size[0]*x;
						DrawObject(obj, true);
					}
				}
			} else {
				DrawObject(obj);
			};
		};
		
		camX = Camera.Scroll[0];
		camY = Camera.Scroll[1];
		
		// Ground
		if (Background.FloorImage !== undefined) {		//If a floor image is given, draw floor according to settings
			var xMP = Math.ceil(camX/Background.FloorSize[0]);
			var xPos = xMP*Background.FloorSize[0] - camX;
			
			for (var x = -1; x < Background.FloorXFrames; x++) {
				canvas.drawImage(
					Background.FloorImage,
					
					xPos + (Background.FloorSize[0]*x),
					Background.FloorBaseY - camY,
					
					Background.FloorSize[0],
					Background.FloorSize[1]
				)
			}
		};
		
		
		
		// Workspace
		canvas.setTransform(1, 0, 0, 1, 0, 0);
		for (var i = 0; i < workspace.length; i++){		//Just goes through workspace and draws everything, lol that's it
			var obj = workspace[i];
			DrawObject(obj);
		};
		
		
		// GUI - No camera scrolling and goes on top layer.
		camX = 0;
		camY = 0;
		for (var i = 0; i < gui.length; i++){
			var g = gui[i];
			var obj = g.obj;
			
			var x = viewport.width;
			var y = viewport.height;
			var posOffset = g.PositionOffset;
			
			if (g.ScaleTo !== undefined){
				var so = g.ScaleTo.obj;
				posOffset = Vector.Subtract(posOffset, g.ScaleTo.AbsolutePosition);
				x = so.Size[0];
				y = so.Size[1];
			};
			
			var xs = x;
			var ys = y;
			
			if (g.xLockS == true) {ys = x}
			else if (g.yLockS == true) {xs = y};
			if (g.xLockP == true) {y = x}
			else if (g.yLockP == true) {x = y};
			
			obj.Resize(Vector.Add([g.Size[0]*xs, g.Size[1]*ys], g.SizeOffset), 4);
			obj.Position = Vector.DivideNum(obj.Size, 2);
			
			camX = -g.Position[0]*x - posOffset[0];
			camY = -g.Position[1]*y - posOffset[1];
			g.AbsolutePosition = [camX, camY];
			
			DrawObject(obj, true);
			//obj.Position = Vector.Add(obj.Position, Camera.Scroll);
		};
	};
	
	window.requestAnimationFrame(RenderFrame)
};
window.requestAnimationFrame(RenderFrame);


