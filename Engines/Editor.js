/*
Made by Alan O'Cull -- Also known as Masteralan or @MasterAlan2001 on Twitter
My website: http://home.codefromjames.com/alan/

This is an editor mode that allows for easy customization of assets and such. Super handy for, well, pretty much anything.

2D Tea - Basic game engine used for easy development of 2D games in JavaScript.
Copyright(C) 2018, Alan O'Cull
*/


var EditorMode = false;

var Editor = {
	MousePos: [0,0],
	Selected: undefined,
	Dragging: false,
	GrabOffset: [0,0],
	LastPosition: [0,0],
	GrabVelocity: [0,0],


	//Resizing
	Resizing: false,	//false,
	RCorner: undefined,
	Points: [],

	LocateHandles: function(obj){
		var grips = Vector.GetHitboxCorners(obj.Vertices);


		var top = Vector.Midpoint([grips[0],grips[1]]);
		var right = Vector.Midpoint([grips[1],grips[2]]);
		var bottom = Vector.Midpoint([grips[2],grips[3]]);
		var left = Vector.Midpoint([grips[3],grips[0]]);

		/*
		grips.push([obj.Position[0],top[1]]);
		grips.push([right[0],obj.Position[1]]);
		grips.push([obj.Position[0],bottom[1]]);
		grips.push([obj.Position[0],left[1]]);
		*/

		grips.push(top);	grips.push(right);	grips.push(bottom);	grips.push(left);


		grips.splice(0,4);
		for (i = 0; i < grips.length; i++){
			grips[i] = Vector.Add(grips[i], obj.Position);
			Editor.Points[i].Position = grips[i];
		};

		return
	},
	DestroyHandles: function(){
		if (Editor.Points[0] == undefined){return};
		for (var i = 0; i < Editor.Points.length; i++){
			Editor.Points[i].Destroy();
		};
		Editor.Points = [];

		return
	},
	GenerateHandles: function(obj){
		var base = Instance.New("Prop", "ResizeGrip", false, [12,12]);
		Editor.DestroyHandles();
		for (i = 0; i < 4; i++){
			var o = Instance.Clone(base);
			//if (i <= 3){o.Rotation = 45};
			o.EditorLocked = true;
			o.Color = "#ffffff";
			Editor.Points.push(o);
			workspace.push(o);
		};
		Editor.LocateHandles(obj);
		base.Destroy();

		return Editor.Points;
	},
	Resize: function(){
		if (Editor.RCorner !== undefined && Editor.Dragging == true){
			var obj = Editor.Selected;
			var pos = Vector.Add(Vector.Round(Editor.MousePos), Camera.Scroll);
			var pos2 = Vector.Round(Editor.RCorner.Position);
			var pos3 = obj.Position;

			var dir = Vector.Direction(pos3, pos2);
			if (Math.abs(dir[0]) !== 1 && Math.abs(dir[1]) !== 1){
				dir = Vector.Direction(pos2, pos);
			};
			pos = Vector.MultiplyVector(pos, dir);
			pos2 = Vector.MultiplyVector(pos2, dir);

			var dis = Vector.Distance(pos, pos2);
			var size = Vector.MultiplyNum(dir, dis);

			var s = [];
			var v1 = Vector.Subtract(pos3, pos);
			var v2 = Vector.Subtract(pos3, pos2);
			var x1 = v1[0];
			var x2 = v2[0];
			var y1 = v1[1];
			var y2 = v2[1];
			if (x1 < x2){
				//console.log("Negative X");
				s.push(-Math.abs(size[0]));
			} else if (x1 > x2) {
				s.push(Math.abs(size[0]))
			} else {s.push(0)};
			if (y1 < y2){
				//console.log("Negative Y");
				s.push(-Math.abs(size[1]));
			} else if (y1 > y2) {
				s.push(Math.abs(size[1]))
			} else {s.push(0)};

			size = Vector.Round(Vector.Add(obj.Size, s));
			if (size[0] < 1){size[0] = 1};
			if (size[1] < 1){size[1] = 1};

			var offset = Vector.DivideNum(Vector.Subtract(obj.Size, size), 2);
			if (dir[0] == 1 || dir[1] == 1){offset = Vector.Negate(offset)};
			obj.Position = Vector.Subtract(pos3, offset);
			obj.Resize(size);

			//console.log("Difference: " + s);
			//console.log("Distance: " + dis);
			//console.log(obj.Size);
		};

		if (Editor.Points[0] == undefined){
			Editor.GenerateHandles(Editor.Selected);
		} else {
			Editor.LocateHandles(Editor.Selected);
		};

		return
	},




	// Moving
	Moving: false,
	LockX: false,
	LockY: false,
	AllowThrow: true,

	Move: function(step){
		if (Editor.Dragging == true && (Editor.Resizing == false || (Editor.Resizing == true && Editor.RCorner == undefined))){
			var obj = Editor.Selected;
			var pos = Vector.Add(Vector.Round(Editor.MousePos), Camera.Scroll);

			if (Editor.LockX == true){
				pos[0] = 0;
			};
			if (Editor.LockY == true){
				pos[1] = 0;
			};

			obj.Position = Vector.Add(pos, Editor.GrabOffset);

			/*	var pos2 = obj.Position;

			Editor.GrabOffset = Vector.Subtract(pos2, pos);	*/

			if (Editor.AllowThrow == true && obj.Velocity !== undefined && Time.Speed !== 0){
				var velo = Vector.Add(Editor.GrabVelocity, Vector.DivideNum(Vector.Subtract(obj.Position, Editor.LastPosition), step*3));
				//console.log("Velocity: " + velo);
				obj.Velocity.x = velo[0];
				obj.Velocity.y = velo[1];
			}
		};

		return
	},



	// Rotating
	Rotating: true,
	RIncrement: 1,
	RotationHandle: undefined,
	RotationPoint: undefined,

	GenerateRotationHandle: function(obj){
		if (Editor.RotationHandle !== undefined){
			Editor.RotationHandle.Destroy();
			Editor.RotationPoint.Destroy();
		};

		if (Editor.Selected !== undefined){
			var o = Instance.New("Prop", "RotateGrip", true, [1,1], [0,0], 0, 3, "#ffffff", "#000000");
			o.Opacity = 0.125;
			o.EditorLocked = true;

			var o2 = Instance.New("Prop", "RotateReference", true, [8,8], [0,0], 0, 4, "#000000", "#ffffff", 1);
			o2.EditorLocked = true;

			Editor.RotationHandle = o;
			Editor.RotationPoint = o2;
		};
	},
	Rotate: function(){
		if (Editor.Selected.EditorLocked == true){return};
		if (Editor.RotationHandle == undefined){
			Editor.GenerateRotationHandle();
		};

		if (Editor.Selected !== undefined && Editor.Dragging == true && Editor.Rotating == true){
			var r = Vector.GetHitboxCorners(Editor.Selected.Vertices);
			r = Vector.Distance(r[0], r[2]);
			var h = Editor.RotationHandle;
			h.Resize([r,r], 360/Editor.RIncrement);
			h.Rotation = Editor.Selected.Rotation;

			var mp = Vector.Add(Camera.Scroll, Editor.MousePos);
			var pos = Editor.Selected.Position

			h.Position = pos;
			var rot = 0;

			if (Editor.RIncrement == 0){
				rot = (Vector.ComputeAngle(Vector.Subtract(pos, mp))).Angle;
			} else {
				var v = h.Vertices;
				var closest = 0;
				var closestDist = Vector.Distance(Vector.Add(pos, v[0]), mp);
				for (var i = 1; i < v.length; i++){
					var dist = Vector.Distance(Vector.Add(pos, v[i]), mp);
					if (dist < closestDist){
						closest = i;
						closestDist = dist;
					}
				}

				rot = (Vector.ComputeAngle(Vector.Subtract(pos, Vector.Add(pos, v[closest])))).Angle;
			};
			rot = -rot+270;
			Editor.Selected.Rotation = rot;
			h.Rotation = rot;
			Editor.RotationPoint.Position = Vector.Add(pos, Vector.ComputeVector(Vector.Magnitude(h.Vertices[0]), h.Rotation));
		};
	},



	// Selection
	Deselect: function(){
		Editor.DestroyHandles();
		if (Editor.RotationHandle !== undefined){
			Editor.RotationHandle.Destroy();
			Editor.RotationPoint.Destroy();

			Editor.RotationHandle = undefined;
		};

		return
	},
	SelectObject: function(list, inWorld){
		var selected = undefined;
		var g = undefined;
		var p = Editor.MousePos;
		
		list = list || workspace;
		if (inWorld !== true && inWorld !== false){inWorld = true};

		//console.log("Attempting to select at mouse position " + Editor.MousePos[0] + ", " + Editor.MousePos[1]);

		function CheckObject(o, iw){
			if (o.IsPhysical !== true){return false};
			var c = Vector.GetHitboxCorners(o.Vertices);
			var tp = Vector.Subtract(o.Position, Camera.Scroll);
			
			if (iw !== true && iw !== false){iw = true};
			if (iw == false){
				tp = o.Position;
			};
			
			var c1 = Vector.Add(c[0], tp);
			var c2 = Vector.Add(c[2], tp);
			if (p[0] > c1[0] && p[0] < c2[0] && p[1] > c1[1] && p[1] < c2[1]){
				return true
			};
			return false
		};

		if (list !== undefined){
			for (var i = list.length-1; i >= 0; i--){
				var o = list[i];
				
				if (list == gui){o = o.obj};
				if (CheckObject(o, inWorld) == true){
					selected = o;
					
					if (o.HasGUI == true){
						g = gui[i];
					};
					break
				}
			};
		} else if (list == workspace){
			for (var i = gui.length-1; i >= 0; i--){
				var o = gui[i].obj;
				if (CheckObject(o, false) == true){
					selected = o;
					g = gui[i];
					break
				}
			};
			if (selected == undefined){
				for (var i = workspace.length-1; i >= 0; i--){
					var o = workspace[i];
					if (CheckObject(o) == true){
						selected = o;
						break
					}
				};
			};
		};

		return [selected, g];
	},

	MoveMouse: function(p) {
		if (p == undefined){console.log("p == undefined"); return};
		Editor.MousePos = [p.clientX, p.clientY];
	},
	ClickMouse: function() {
		var s = Editor.SelectObject();
		var sgui = s[1];
		s = s[0];

		if (s !== undefined){
			Editor.Dragging = true;
			Editor.LastPosition = s.Position;

			if (Editor.Resizing == true && obj.EditorLocked !== true){
				for (var i = 0; i < Editor.Points.length; i++){
					if (s == Editor.Points[i]){
						s = Editor.Selected;
						Editor.RCorner = Editor.SelectObject(Editor.Points)[0];
						//break
						return
					}
				};
			};
			if (Editor.Moving == true){
				Editor.GrabOffset = Vector.Subtract(s.Position, Vector.Add(Camera.Scroll, Editor.MousePos));
			};
			if (Editor.Rotating == true && s.EditorLocked !== true){
				Editor.GenerateRotationHandle();
			}

			if (s.IsPhysical == true && s.Velocity !== undefined){
				Editor.GrabVelocity = [s.Velocity.x, s.Velocity.y];
			}
		};

		if (obj.EditorLocked !== true){
			if (s !== Editor.Selected){
				Editor.Deselect();
			};

			if (Editor.Selected !== undefined){
				Editor.Selected.SelectionOutline = undefined;
			};
			Editor.Selected = s;

			if (s !== undefined){
				s.SelectionOutline = true;
				//console.log("Selected " + s.Name);
			};
		} else if (sgui !== undefined && sgui.OnClick !== undefined){
			sgui.OnClick();
		};
	},
	LetGoMouse: function() {
		Editor.Dragging = false;
	},


	gui: [],
	SetupGUI: function (){
		var m = Instance.New("Prop", "EditorWindow Main", false);
		m.Opacity = 1;
		m.Color = "#444444";
		m = Instance.SetupGUI(m, [0,0], [0.2,0.4]);

		var h = Instance.New("Prop", "EditorWindow Header", false);
		h.Opacity = 1;
		h.Color = "#555555";
		h.Text = "JS Studio Editor";
		h.FontSize = 20;
		h.TextColor = "#ffffff";
		h.TextAlign = "center";
		h = Instance.SetupGUI(h, [0.01,0.01], [0.98,0.0825]);
		h.ScaleTo = m;

		var back = Instance.New("Prop", "EditorWindow Backdrop", false);
		back.Color = "#555555";
		back = Instance.SetupGUI(back, [0.01,0.1], [0.98,0.99-0.1]);
		back.ScaleTo = m;

		Editor.gui.push(m);
		Editor.gui.push(h);
		Editor.gui.push(back);

		for (var i = 1; i < Editor.gui.length; i++){
			var o = Editor.gui[i];
			o.EditorLocked = true;
			if (i >= 3){
				o.ScaleTo = back;
			};
		}
	},
	ToggleGUI: function(val){
		if (val !== true && val !== false){
			if (gui.indexOf(Editor.gui[0]) == -1){
				val = true
			} else {
				val = false
			};
		};

		for (var i = 0; i < Editor.gui.length; i++){
			Editor.gui[i].Hide(!val);
		};
		return val
	},



	UpdateEditor: function(step){
		if (Editor.Resizing == true && Editor.Selected !== undefined){
			Editor.Resize();
		};
		if (Editor.Moving == true && Editor.Selected !== undefined){
			Editor.Move(step);
		};
		if (Editor.Rotating == true && Editor.Selected !== undefined){
			Editor.Rotate();
		};


		if (Editor.Selected !== undefined){
			Editor.LastPosition = Editor.Selected.Position;
		};
		return
	}
};


if (EditorMode == true){
	Time.Speed = 0;

	document.onmousemove = Editor.MoveMouse;
	document.onmousedown = Editor.ClickMouse;
	document.onmouseup = Editor.LetGoMouse;

	Editor.SetupGUI();
	//Editor.ToggleGUI(true);

	StepFunctions.push(Editor.UpdateEditor);
};
